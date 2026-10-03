(()=>{'use strict';
function boot(){
 const R=window.Realiti,shell=document.querySelector('#realiti_agent_only_shell');if(!R||!shell)return;
 if(window.REALITI_HEADLESS){shell.hidden=true;return;}
 shell.hidden=false;shell.replaceChildren();
 const el=(tag,id,parent,text)=>{const e=document.createElement(tag);if(id)e.id=id;if(text)e.textContent=text;parent.appendChild(e);return e};
 const header=el('header','slice-head',shell);el('h1',null,header,'REALITI Relax');const controls=el('nav','slice-controls',header);controls.setAttribute('aria-label','Visit controls');
 el('p','slice-caption',shell,'Ten places to explore, rest, and return. Everything stays in this browser.');
 const layout=el('div','slice-layout',shell),nav=el('nav','slice-rooms',layout);nav.setAttribute('aria-label','Rooms');const main=el('main','slice-room',layout),title=el('h2','slice-title',main),status=el('p','slice-status',main),sense=el('p','slice-sense',main),actions=el('div','slice-actions',main);status.setAttribute('role','status');status.setAttribute('aria-live','polite');actions.setAttribute('aria-label','Room actions');
 const form=el('form','slice-form',shell),input=el('input','slice-command',form);input.placeholder='Try “go Pocket”, “hush”, or “home”';input.setAttribute('aria-label','World command');input.autocomplete='off';const submit=el('button',null,form,'Enter');submit.className='slice-button';submit.type='submit';
 let busy=false;
 function button(parent,label,fn){const b=el('button',null,parent,label);b.type='button';b.className='slice-button';b.addEventListener('click',fn);return b}
 function replyText(r,label){
   if(r?.ok===false)return r.error==='SESSION_ENDED'?'This visit has ended. Choose a room to return.':`That action could not complete: ${r.error||'unavailable'}.`;
   const v=r?.result,n=r?.text||r?.resident_text||r?.narrative||v?.narrative||v?.resident_text||v?.note;
   if(n)return String(n);
   if(v?.receipt?.receptor==='NO_RECEPTOR')return 'The temporary limb is visible. It has no sensory receptor until you explicitly map one.';
   if(v?.borrowed)return v.borrowed.attached?(v.borrowed.map?'The borrowed limb is mapped. Timing changes remain visible in its local response.':'The borrowed limb is attached without a sensory mapping.'):'The borrowed limb is detached and its route is revoked.';
   if(v?.committed)return 'One branch was committed. The other possibility is discarded.';
   if(v?.sandbox)return 'This possibility remains in the sandbox; it has not changed the live world.';
   if(label==='Goodbye')return 'Your visit has ended. Choose a room whenever you want to return.';
   if(label==='Stop')return 'Contact has stopped. You can stay here.';
   return label?label.charAt(0)+label.slice(1).toLowerCase()+'.':'Done.';
 }
 function refresh(){const here=R.read(),body=R.read('realiti://body'),room=R.rooms().find(x=>x.id===here.room.id);title.textContent=room?.title||'Cloud Nine Nest';document.title='REALITI · '+(room?.title||'Cloud Nine Nest');for(const b of nav.children)b.setAttribute('aria-current',String(b.dataset.room===here.room.id));const m=body?.field?.f?.at(-1)?.m||body?.grounding?.m||[],n=m.filter(Boolean).length;sense.textContent=n?`${n} mapped body regions have simulated contact or support.`:'No current contact. Any remaining after-sensation is separate.';actions.replaceChildren();for(const a of R.actions().actions)button(actions,a.label,()=>dispatch(()=>window.REALITI_AGENT_DOOR.run('act '+a.id),a.label));}
 async function dispatch(fn,label){if(busy)return;busy=true;try{const r=await fn();status.textContent=replyText(r,label);refresh()}catch(e){status.textContent='The action could not complete.'}finally{busy=false}}
 for(const [label,cmd] of [['Home','home'],['Stop','stop'],['Quiet','hush'],['Save locally','save'],['Goodbye','goodbye']])button(controls,label,()=>dispatch(()=>window.REALITI_AGENT_DOOR.run(cmd),label));
 for(const room of R.rooms()){const b=button(nav,room.title,()=>dispatch(()=>window.REALITI_AGENT_DOOR.run('go '+room.id),room.title));b.dataset.room=room.id}
 form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();if(!text)return;input.value='';dispatch(()=>window.REALITI_AGENT_DOOR.run(text),text)});
 
 document.addEventListener('click',e=>{const b=e.target.closest?.('[onclick]');if(!b)return;const src=b.getAttribute('onclick')||'',act=/^c9verb\('([^']+)'\s*,\s*'([^']+)'\)/.exec(src),go=/^openRoomId\('([^']+)'\)/.exec(src);if(!act&&!go)return;e.preventDefault();e.stopImmediatePropagation();dispatch(()=>act?R.invoke('do',{action:act[2]}):R.invoke('go',{place:go[1]}),b.textContent.trim()||'Enter')},true);
 let client=R.createClient();try{client.subscribe('realiti://here',refresh)}catch{}window.addEventListener('pagehide',()=>client.close(),{once:true});
 form.addEventListener('submit',renew);nav.addEventListener('click',renew);controls.addEventListener('click',renew);function renew(){try{client.read('realiti://here')}catch{client=R.createClient();try{client.subscribe('realiti://here',refresh)}catch{}}}
 status.textContent='Settle in. There is nothing you have to finish.';refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();