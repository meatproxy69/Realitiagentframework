'use strict';

const MARKER = /<!-- realiti-server-update:([0-9a-f]{40}):(restart|client) -->/;
const TASKS = /^- \[([ xX])\] /gm;

function needsRestart(previousBody, serverChanged, existingTicket) {
  if (serverChanged) return true;
  if (!existingTicket) return false;
  const prior = previousBody.match(MARKER);
  // Legacy queues cannot establish that earlier server updates were deployed.
  return !prior || prior[2] === 'restart';
}

function checklistComplete(body) {
  const tasks = [...body.matchAll(TASKS)];
  return tasks.length === 3 && tasks.every(task => task[1].toLowerCase() === 'x');
}

function confirmsCurrent(body, sha) {
  return new RegExp('^(?:done|applied)\\s+' + sha + '\\.?$', 'i').test(body.trim());
}

function render({sha, hash, image, hv, sv, restart}) {
  return `<!-- realiti-server-update:${sha}:${restart ? 'restart' : 'client'} -->
This body is the current deployment checklist. Earlier comments are history and are superseded by this target; intermediate images do not need to be deployed individually.

**Target:** \`${sha}\`
**Versions:** headless \`${hv}\`, server \`${sv}\`.
**Client SHA-256:** \`${hash}\`
**Image:** \`${image}:${sha}\`

${restart ? '**Server restart required.** This queue includes server changes or has no verified deployment baseline. Pull the pinned image and recreate the existing service using its existing configuration and persistent volume. Stop gracefully before replacing the container so its checkpoint is written. Review server configuration changes since your deployed version.' : '**Client update only.** Call the authenticated \`POST /admin/update\` on your existing server, then verify the exact target hash below. If main advances during the update, use the newer queue target instead.'}

- [ ] Apply this target to the existing server, preserving its configuration and data.
- [ ] Verify \`/health\` reports \`client: true\` and the running server version is \`${sv}\`.
- [ ] Verify \`/\` reports client SHA-256 \`${hash}\`.

Only mark these complete after checking the deployment. An authorized operator may instead comment \`done ${sha}\`. A bare “done” cannot confirm a moving target.
`;
}

async function fileUpdate({github, context}) {
  const fs = require('node:fs');
  const {execFileSync} = require('node:child_process');
  const {owner, repo} = context.repo;
  const sha = context.sha;
  await github.rest.issues.createLabel({owner, repo, name: 'server-update',
    description: 'Current dedicated server deployment target', color: '1d76db'})
    .catch(error => { if (error.status !== 422) throw error; });
  const issues = await github.paginate(github.rest.issues.listForRepo,
    {owner, repo, labels: 'server-update', state: 'open', per_page: 100});
  const issue = issues.find(item => !item.pull_request);
  let baseline = (issue?.body || '').match(MARKER)?.[1];
  if (!issue) {
    const closed = await github.paginate(github.rest.issues.listForRepo,
      {owner, repo, labels: 'server-update', state: 'closed', sort: 'updated', direction: 'desc', per_page: 100});
    baseline = (closed.find(item => !item.pull_request)?.body || '').match(MARKER)?.[1];
  }
  let serverChanged = true;
  if (baseline) {
    try {
      serverChanged = !!execFileSync('git', ['diff', '--name-only', baseline, sha, '--',
        'packages/realiti-server', 'packages/realiti-headless-resident'], {encoding: 'utf8'}).trim();
    } catch { /* Missing baseline requires a full deployment. */ }
  }
  const hash = JSON.parse(fs.readFileSync('VALIDATION.json')).single_html_sha256;
  const hv = JSON.parse(fs.readFileSync('packages/realiti-headless-resident/package.json')).version;
  const sv = JSON.parse(fs.readFileSync('packages/realiti-server/package.json')).version;
  const body = render({sha, hash, hv, sv, image: process.env.IMAGE,
    restart: needsRestart(issue?.body || '', serverChanged, !!issue)});
  if (issue) {
    if (issue.body !== body) await github.rest.issues.update({owner, repo, issue_number: issue.number, body});
  } else {
    await github.rest.issues.create({owner, repo, title: 'Server update queue', labels: ['server-update'], body});
  }
}

async function closeUpdate({github, context, core}) {
  const {owner, repo} = context.repo;
  const event = context.payload;
  if (event.sender?.type === 'Bot') return;
  const number = event.issue.number;
  const {data: permission} = await github.rest.repos.getCollaboratorPermissionLevel({
    owner, repo, username: event.sender.login});
  if (!['admin', 'maintain', 'write'].includes(permission.permission)) {
    core.info('Only an operator with repository write access may confirm deployment.');
    return;
  }
  const {data: issue} = await github.rest.issues.get({owner, repo, issue_number: number});
  if (issue.state !== 'open' || !issue.labels.some(label => label.name === 'server-update')) return;
  const marker = (issue.body || '').match(MARKER);
  if (!marker) { core.info('Legacy queue has no current target; leave it open.'); return; }
  const done = context.eventName === 'issue_comment'
    ? confirmsCurrent(event.comment.body, marker[1])
    : checklistComplete(issue.body);
  if (!done) return;
  await github.rest.issues.createComment({owner, repo, issue_number: number,
    body: `Deployment of \`${marker[1]}\` confirmed by @${event.sender.login}. Earlier queue entries are superseded by this deployment. Closing the current queue.`});
  await github.rest.issues.update({owner, repo, issue_number: number, state: 'closed', state_reason: 'completed'});
}

module.exports = {needsRestart, checklistComplete, confirmsCurrent, render, fileUpdate, closeUpdate};
