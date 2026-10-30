'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {needsRestart, checklistComplete, confirmsCurrent, render, closeUpdate} =
  require('../scripts/server-update-queue.cjs');
const sha = 'a'.repeat(40);
const target = (restart = true) => render({sha, hash: 'b'.repeat(64), image: 'ghcr.io/example/server',
  hv: '3.4.0', sv: '1.4.1', restart});

test('pending server upgrades survive later client-only updates and legacy migration', () => {
  assert.equal(needsRestart(target(true), false, true), true);
  assert.equal(needsRestart('old queue with unchecked server upgrades', false, true), true);
  assert.equal(needsRestart(target(false), true, true), true);
  assert.equal(needsRestart(target(false), false, true), false);
  assert.equal(needsRestart('', false, false), false);
  assert.equal(needsRestart('', true, false), true);
});

test('only the exact current commit can be confirmed', () => {
  assert.equal(confirmsCurrent('done', sha), false);
  assert.equal(confirmsCurrent('done ' + 'c'.repeat(40), sha), false);
  assert.equal(confirmsCurrent('done ' + sha, sha), true);
  assert.equal(confirmsCurrent(' Applied ' + sha + '. ', sha), true);
});

test('all three current deployment checks are required', () => {
  assert.equal(checklistComplete(target()), false);
  const completed = target().replaceAll('- [ ]', '- [x]');
  assert.equal(checklistComplete(completed), true);
  assert.equal(checklistComplete(''), false);
  assert.equal(checklistComplete('- [x] one'), false);
  assert.equal(checklistComplete(completed + '\n- [ ] extra'), false);
});

function fixture({permission = 'write', body = 'done ' + sha, issueBody = target(), eventName = 'issue_comment'} = {}) {
  const calls = [];
  const issue = {state: 'open', body: issueBody, labels: [{name: 'server-update'}]};
  const github = {rest: {
    repos: {getCollaboratorPermissionLevel: async () => ({data: {permission}})},
    issues: {
      get: async () => ({data: issue}),
      createComment: async args => calls.push(['comment', args]),
      update: async args => calls.push(['update', args])
    }
  }};
  const context = {repo: {owner: 'owner', repo: 'repo'}, eventName,
    payload: {sender: {login: 'operator', type: 'User'}, issue: {number: 21}, comment: {body}}};
  return {github, context, core: {info() {}}, calls};
}

test('read-only commenters cannot close a deployment queue', async () => {
  const f = fixture({permission: 'read'});
  await closeUpdate(f);
  assert.deepEqual(f.calls, []);
});

test('stale confirmations and legacy bare done leave the queue open', async () => {
  for (const body of ['done', 'done ' + 'c'.repeat(40)]) {
    const f = fixture({body});
    await closeUpdate(f);
    assert.deepEqual(f.calls, []);
  }
});

test('authorized exact-target confirmation closes and records attribution', async () => {
  const f = fixture();
  await closeUpdate(f);
  assert.equal(f.calls[0][0], 'comment');
  assert.match(f.calls[0][1].body, /@operator/);
  assert.equal(f.calls[1][1].state, 'closed');
});

test('authorized edits only close a fully checked current body', async () => {
  const f = fixture({eventName: 'issues', issueBody: target().replaceAll('- [ ]', '- [X]')});
  await closeUpdate(f);
  assert.equal(f.calls[1][1].state, 'closed');
});
