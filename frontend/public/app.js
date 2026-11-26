// StandBy frontend. All data comes from the Spring backend (/api/*, proxied by server.mjs). Only the JWT + UI prefs live in localStorage.
const app=document.querySelector('#app');
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch{}}};
const ui=(()=>{try{return JSON.parse(store.get('standby-ui')||'{}')}catch{return {}}})();
let token=store.get('standby-token'),page=ui.page||'Daily briefing',space=ui.space||'All',modal=null,notice='',busy='',authMode='login',authErr='',D=null,seq=0;
const AUTONOMY={'Recommendations only':'RECOMMENDATIONS_ONLY','Approval required':'APPROVAL_REQUIRED'};
const nav=[['Daily briefing','▦'],['Smart inbox','✉'],['Commitments','☑'],['Risk radar','◇'],['Calendar','▤'],['Agent activity','⌁'],['Privacy center','♧']];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=x=>x?x[0]+x.slice(1).toLowerCase():'';
const btn=(t,a,c='primary',id='')=>`<button class="${c}" data-action="${a}" ${id!==''?`data-id="${id}"`:''}>${t}</button>`;
const chip=(t,c='')=>`<span class="chip ${c}">${esc(t)}</span>`;
const date=()=>D?new Date(D.briefing.date+'T12:00:00'):new Date();
const head=(t,d)=>`<div class="eyebrow">${esc(date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase())} · DEMO WORKSPACE</div><h1>${t}</h1><p class="muted">${d}</p>`;
const card=(t,body)=>`<section class="card"><h2>${t}</h2>${body}</section>`;
const metric=(t,v,d,c='')=>`<div class="card"><div class="muted">${t}</div><div class="metric ${c}">${v}</div><div class="muted">${d}</div></div>`;
// ponytail: times shown in the browser's timezone, backend zone is APP_ZONE (default Europe/Rome)
const hm=iso=>new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
const initials=n=>(n||'?').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const q=()=>space==='All'?'':'?space='+space.toLowerCase();
const risks=()=>D.risks.slice().sort((a,b)=>(a.status==='OPEN'?0:1)-(b.status==='OPEN'?0:1));

async function api(path,method='GET',body){
  const r=await fetch('/api'+path,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body!==undefined?JSON.stringify(body):undefined});
  const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch{}
  if(r.status===401&&!path.startsWith('/auth/')){logout('Session expired, please sign in again.');throw Error('unauthorized')}
  if(!r.ok)throw Error(j?.detail||j?.title||`Request failed (${r.status})`);
  return j;
}
function logout(msg=''){token=null;D=null;modal=null;store.set('standby-token',null);authErr=msg;render()}
async function load(){
  const my=++seq,s=q();
  const [briefing,emails,commitments,rs,activity,settings,actions,me]=await Promise.all(['/briefing'+s,'/emails'+s,'/commitments'+s,'/risks'+s,'/activity'+s,'/settings','/actions'+s,'/me'].map(p=>api(p)));
  const evidence={};await Promise.all(rs.map(async r=>{evidence[r.id]=(await api('/risks/'+r.id)).evidence}));
  if(my===seq)D={briefing,emails,commitments,risks:rs,activity,settings,actions,me,evidence};
}
// run a mutation, then reload everything and render
async function act(label,fn){
  if(busy)return;busy=label;notice='';render();
  try{const n=await fn();if(n)notice=n}catch(e){if(e.message!=='unauthorized')notice=e.message}
  busy='';try{if(token)await load()}catch(e){if(e.message!=='unauthorized')notice=e.message}
  render();
}

// ---------- views ----------
function riskCard(r){const open=r.status==='OPEN';return `<div class="risk"><div class="row between">${chip(open?r.severity+' priority':'Mitigated',open?(r.severity==='High'?'red':''):'green')}<span class="muted">${r.sourceIds.length} linked emails</span></div><h2 style="margin-top:12px">${esc(r.title)}</h2><p class="muted">${esc(open?r.explanation:(r.resolution||'Risk mitigated.'))}</p><div class="row between" style="margin-top:15px"><strong class="${open?'red':'green'}">${esc(open?(r.exposure||'Exposure unknown'):'Risk reduced')}</strong>${btn('View evidence','Risk radar','secondary')}</div></div>`}
function tasks(){return D.commitments.map(t=>`<div class="item row"><input type="checkbox" class="check" data-task="${t.id}" ${t.done?'checked':''}><div style="flex:1"><h3 ${t.done?'style="text-decoration:line-through"':''}>${esc(t.title)}</h3><span class="muted">${esc(cap(t.space))} · ${esc(t.due)} · ${esc(t.owner)}</span></div>${chip(t.done?'Done':t.status,t.done?'green':t.status==='Blocked'?'red':'')}</div>`).join('')||'<p class="empty">No commitments.</p>'}
function schedule(){
  const b=D.briefing,conflict=b.conflicts[0];
  return (b.schedule.map(e=>`<div class="item"><span class="muted">${hm(e.startAt)}–${hm(e.endAt)}</span><h3>${esc(e.title)}${e.space==='PERSONAL'?' 🔒':''}</h3>${chip(cap(e.space))}</div>`).join('')||'<p class="empty">Nothing scheduled.</p>')
   +(conflict?`<div class="email"><h3>Calendar conflict</h3><p class="muted">${esc(conflict.workEvent.title)} overlaps a private appointment.</p>${btn('Resolve privately','conflict','link',conflict.workEvent.id)}</div>`:'');
}
function summaries(){return Object.entries(D.briefing.summaries).map(([sp,t])=>card(`${cap(sp)} AI analysis`,`<p>${esc(t)}</p>`)).join('')}
function agentActions(){
  const list=D.actions.filter(a=>a.status!=='REJECTED').slice(0,3);
  return card('Agent actions',(list.map(a=>`<div class="item"><h3>${a.status==='APPROVED'?'✓ Approved: ':''}${esc(a.subject)}</h3><p class="muted">${esc(a.recipients)}</p>${a.status==='DRAFT'?btn('Review draft','review','secondary',a.id):''}</div>`).join('')||'<p class="empty">No actions yet.</p>')+`<span class="muted">${esc(autonomy())}</span>`);
}
const autonomy=()=>Object.keys(AUTONOMY).find(k=>AUTONOMY[k]===D.settings.autonomy);
function home(){
  const b=D.briefing,top=risks()[0],m=b.metrics;
  return head(`Good morning, ${esc(b.name.split(' ')[0])}.`,'A little less noise. A lot more clarity.')+`<section class="hero"><div class="eyebrow" style="color:#d6cdfd">✦ YOUR AI BRIEFING</div><h2>Here’s what really matters today.</h2><p>${space==='Personal'?'Your private appointments and commitments.':'Focus on decisions, not the inbox.'}</p><div style="margin-top:16px">${btn(busy==='analyze'?'Analyzing…':'Analyze emails','analyze','secondary')}</div></section><div class="grid">${metric('Open commitments',m.openCommitments,'Across selected spaces')}${metric('Active business risks',m.activeRisks,'Dependency intelligence','red')}${metric('Time reclaimed','25m','Illustrative estimate','purple')}</div><div class="split"><div class="stack">${top?card('Risk radar',riskCard(top)):''}${card('Your commitments',tasks())}${summaries()}</div><div class="stack">${card('Your schedule',schedule())}${agentActions()}</div></div><div class="privacy">♧ Separate work and personal content. Only authorized availability is used for coordination.</div>`;
}
function inbox(){
  const shown=D.emails.slice(0,50);
  return head('Smart inbox','Priorities based on business impact and deadlines.')+`<div class="spacer"></div>${card('Communications',shown.map(e=>`<div class="item row"><div class="tile">✉</div><div style="flex:1"><div class="row between"><h3>${esc(e.subject)}</h3>${chip(e.priority,e.priority==='Critical'?'red':'')}</div><span class="muted">${esc(e.sender)} · ${cap(e.space)} · ${hm(e.receivedAt)}</span><p>${esc(e.body)}</p></div></div>`).join('')||'<p class="empty">No emails.</p>')}${D.emails.length>shown.length?`<p class="muted">Showing ${shown.length} of ${D.emails.length}.</p>`:''}`;
}
const commitments=()=>head('Commitment center','Every promise, owner and deadline in one place.')+`<div class="spacer"></div>${card('Commitments',tasks())}`;
function riskDetail(r){
  const open=r.status==='OPEN',ok=r.status==='MITIGATED';
  return riskCard(r)+`<div class="graph">${r.chain.map((n,i)=>`${i?'↓':''}<div class="node" style="background:${ok?'#e8f6ef':i===r.chain.length-1?'':'#fff3e2'}"><h3>${esc(n.title)}</h3>${esc(n.detail)}</div>`).join('')}</div><h2>Source evidence</h2>${(D.evidence[r.id]||[]).map(e=>`<div class="email"><strong>${esc(e.sender)}</strong><p>${esc(e.body)}</p></div>`).join('')}${ok&&r.resolution?`<div class="email">${esc(r.resolution)}</div>`:''}${open?`<div class="row">${btn('Review escalation','escalate','primary',r.id)}${btn('Simulate IT response','resolve','secondary',r.id)}</div>`:''}`;
}
function riskPage(){
  const rs=risks();
  return head('Risk radar','See the downstream consequences of delayed commitments.')+`<div class="spacer"></div>`+(rs.length?rs.map(r=>card('Business risk',riskDetail(r))).join(''):card('No business data',`<p class="muted">${space==='Personal'?'Work risks are hidden in your personal view.':'No risks detected.'}</p>`));
}
function privacy(){
  const s=D.settings,on=[s.analyzeWork,s.analyzePersonal,s.crossCalendar,false,false,false];
  return head('Privacy center','Your data. Your boundaries. Your decisions.')+`<div class="spacer"></div>${card('Connected accounts',`<div class="item row between"><div><h3>Corporate Outlook</h3><span class="muted">${esc(D.me.email)} · simulated</span></div>${chip('Work','green')}</div><div class="item row between"><div><h3>Personal Gmail</h3><span class="muted">simulated</span></div>${chip('Personal','green')}</div>`)}<div class="spacer"></div>${card('Agent permissions',['Analyze work communications','Analyze personal communications','Cross-calendar coordination','Automatic work follow-ups (roadmap)','Automatic personal replies (roadmap)','Process attachments (roadmap)'].map((t,i)=>`<div class="item row between"><h3>${t}</h3><button class="switch ${on[i]?'on':''}" data-action="toggle${i}" aria-label="${t}" aria-pressed="${on[i]}" ${i>2?'disabled':''}><span></span></button></div>`).join('')+`<div class="item"><h3>Autonomy level</h3><select class="field" id="mode">${Object.keys(AUTONOMY).map(m=>`<option ${autonomy()===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="privacy">Demo settings only; not a production security boundary.</div><div style="margin-top:14px">${btn('Reset demo','reset','secondary')}</div>`)}`;
}
function activity(){return head('Agent activity','Review every simulated action.')+`<div class="spacer"></div>${card('Activity log',`<div class="timeline">${D.activity.map(l=>`<div class="item"><h3>${esc(l.text)}</h3><span class="muted">${esc(cap(l.space))} · ${hm(l.createdAt)}</span></div>`).join('')||'<p class="empty">No activity.</p>'}</div>`)}`}
function dialog(){
  if(!modal)return '';const conflict=modal.type==='RESCHEDULE';
  return `<div class="modalback"><div class="modal"><div class="row between"><h2>${conflict?'Resolve scheduling conflict':'Review escalation'}</h2>${btn('×','close','link')}</div><div class="email"><strong>To: ${esc(modal.recipients)}</strong><p><b>${esc(modal.subject)}</b></p><p style="white-space:pre-wrap">${esc(modal.body)}</p></div><div class="privacy">${conflict?'Only free/busy information used. No personal details included.':'Sources: work emails only. No personal data included.'}</div><div class="row" style="margin-top:18px">${btn('Approve simulated '+(conflict?'reschedule':'send'),'confirm')}${btn('Discard draft','discard','secondary')}${btn('Cancel','close','secondary')}</div></div></div>`;
}
const pages={'Daily briefing':home,'Smart inbox':inbox,'Commitments':commitments,'Risk radar':riskPage,'Calendar':()=>head('Your calendar','One view, separate privacy boundaries.')+`<div class="spacer"></div>${card(esc(date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})),schedule())}`,'Agent activity':activity,'Privacy center':privacy};

function authView(){
  const reg=authMode==='register';
  return `<div class="authwrap"><form class="card auth" id="auth"><div class="brand"><span class="logo">✦</span><b>standby<span class="purple">.</span></b></div><h2>${reg?'Create account':'Sign in'}</h2>${authErr?`<div class="toast">${esc(authErr)}</div>`:''}${reg?'<input class="field" name="name" placeholder="Name" required maxlength="100" autocomplete="name">':''}<input class="field" name="email" type="email" placeholder="Email" required autocomplete="email"><input class="field" name="password" type="password" placeholder="Password${reg?' (min 8 characters)':''}" required minlength="${reg?8:1}" autocomplete="${reg?'new-password':'current-password'}">${btn(busy?'…':reg?'Register':'Sign in','submit')}<button type="button" class="link" data-action="authswitch">${reg?'Have an account? Sign in':'New here? Create an account'}</button></form></div>`;
}
function render(){
  store.set('standby-ui',JSON.stringify({page,space}));
  if(!token){app.innerHTML=authView();return}
  if(!D){app.innerHTML='<div class="authwrap"><p class="muted">Loading…</p></div>';return}
  app.innerHTML=`<div class="shell"><aside><div class="brand"><span class="logo">✦</span><b>standby<span class="purple">.</span></b></div><div class="label">WORKSPACE</div>${nav.map(([n,i])=>`<button title="${n}" class="nav ${page===n?'active':''}" data-action="${n}">${i}<span>${n}</span></button>`).join('')}<div class="profile"><div class="avatar">${esc(initials(D.me.name))}</div><div><strong>${esc(D.me.name)}</strong><div><button class="link" data-action="logout">Sign out</button></div></div></div></aside><main><header class="top"><div class="segment">${['All','Work','Personal'].map(x=>`<button data-action="space:${x}" class="${space===x?'active':''}">${x==='All'?'My day':x}</button>`).join('')}</div><div class="row">${chip('● Demo mode','green')}<div class="avatar">${esc(initials(D.me.name))}</div></div></header><div class="content">${notice?`<div class="toast row between">${esc(notice)}${btn('×','dismiss','secondary')}</div>`:''}${pages[page]()}</div></main></div>${dialog()}`;
}

// ---------- events ----------
const post=(p,b)=>api(p,'POST',b);
const draft=async p=>{modal=await post(p)};
app.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;
  const f=Object.fromEntries(new FormData(e.target)),reg=authMode==='register';
  busy='auth';authErr='';render();
  try{
    const r=await post(reg?'/auth/register':'/auth/login',f);
    token=r.token;store.set('standby-token',token);busy='';return act('init',async()=>{});
  }catch(err){authErr=err.message}
  busy='';render();
});
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;
  const a=b.dataset.action,id=b.dataset.id;
  if(pages[a]){page=a;notice='';return render()}
  if(a==='authswitch'){authMode=authMode==='login'?'register':'login';authErr='';return render()}
  if(a==='logout')return logout();
  if(a==='dismiss'){notice='';return render()}
  if(a==='close'){modal=null;return render()}
  if(a.startsWith('space:')){space=a.slice(6);notice='';modal=null;return act('space',async()=>{})}
  if(a.startsWith('toggle')){const k=['analyzeWork','analyzePersonal','crossCalendar'][a.slice(6)];return act('settings',()=>api('/settings','PUT',{...D.settings,[k]:!D.settings[k]}).then(()=>''))}
  if(a==='reset')return act('reset',async()=>{await post('/demo/reset');return 'Demo reset'});
  if(a==='escalate')return act('draft',()=>draft(`/risks/${id}/escalation-draft`));
  if(a==='conflict')return act('draft',()=>draft(`/calendar/events/${id}/reschedule-draft`));
  if(a==='review')return act('draft',async()=>{modal=D.actions.find(x=>x.id==id)});
  if(a==='discard'){const m=modal;modal=null;return act('reject',async()=>{await post(`/actions/${m.id}/reject`);return 'Draft discarded.'})}
  if(a==='confirm'){const m=modal;modal=null;return act('approve',async()=>{await post(`/actions/${m.id}/approve`);return m.type==='RESCHEDULE'?'Meeting moved. No real calendar changed.':'Escalation approved. No real email sent.'})}
  if(a==='resolve')return act('resolve',async()=>{await post(`/risks/${id}/resolve`,{note:'IT: We can deliver the specifications today instead.'});return 'Dependency updated.'});
  if(a==='analyze')return act('analyze',async()=>{const rs=await post('/ai/analyze'+q());return rs.length?`Analysis complete: ${rs.map(r=>`${cap(r.space)} ${r.mode}`).join(', ')}.`:'No enabled workspace to analyze.'});
});
app.addEventListener('change',e=>{
  const t=e.target;
  if(t.matches('[data-task]'))return act('task',()=>api('/commitments/'+t.dataset.task,'PATCH',{done:t.checked}).then(()=>''));
  if(t.id==='mode')return act('settings',()=>api('/settings','PUT',{...D.settings,autonomy:AUTONOMY[t.value]}).then(()=>''));
});

render();
if(token)act('init',async()=>{});
