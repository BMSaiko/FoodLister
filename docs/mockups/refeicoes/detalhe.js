/* Lógica comum de /meals/[id]: dados de exemplo, estados (?state=default|loading|notfound), papel (?as=organizer|participant|pending),
   refeição (?id=m1..m7), modais (?modal=edit|delete). Forma dos dados = resposta de /api/meals/[id]. Participantes/duração são EXEMPLOS (a BD de dev não tem refeições). */
(function(){
const q=new URLSearchParams(location.search);
const id=q.get('id')||'m1',state=q.get('state')||'default';
const ME='Ana Teste';
const NAMES=['Bruno Silva','Carla Mendes','Diogo Ferreira','Inês Rocha','Miguel Santos','Rita Gomes','Tiago Lopes','Sofia Martins','João Pires','Marta Costa','Rui Almeida','Beatriz Nunes'];
const STAT=['accepted','accepted','pending','declined','accepted','pending'];
const EXTRA={m1:{dur:120,org:'Ana Teste',code:'#ANA-4821',gcal:true},m2:{dur:90,org:'Carla Mendes',code:'#CAR-1177',gcal:true,me:'accepted'},m3:{dur:180,org:'Ana Teste',code:'#ANA-4821',gcal:false},m4:{dur:60,org:'Rui Almeida',code:null,gcal:false,me:'pending'},m5:{dur:120,org:'Ana Teste',code:'#ANA-4821',gcal:true},m6:{dur:60,org:'Inês Rocha',code:'#INE-9034',gcal:false,me:'accepted'},m7:{dur:60,org:'Ana Teste',code:'#ANA-4821',gcal:false}};
const base=window.MEALS.find(m=>m.id===id);
const N={pequeno:'Pequeno Almoço',almoco:'Almoço',jantar:'Jantar',lanche:'Lanche',brunch:'Brunch',ceia:'Ceia'};
let as=q.get('as');
let meal=null;
if(base){const e=EXTRA[id],org=base.role==='organized';
  const n=Math.max(base.participant_count-(org?0:1),0);
  meal={id,type:base.meal_type,date:base.meal_date,time:base.meal_time,dur:e.dur,gcal:e.gcal,restaurant:base.restaurant,isOrganizer:org,
   organizer:{name:e.org,code:e.code,avatar:null},
   participants:Array.from({length:n},(_,i)=>({id:'p'+i,name:NAMES[i%12],code:i%3?`#${NAMES[i%12].slice(0,3).toUpperCase()}-${1000+i*37}`:null,status:STAT[i%6]})),
   status:org?null:(e.me||'pending')};
  if(as==='participant'&&org){meal.isOrganizer=false;meal.status='pending'}
  if(as==='organizer'&&!org){meal.isOrganizer=true;meal.status=null}
  if(as==='pending'){meal.status='pending'}
}
const D=s=>s?new Date(s+'T12:00:00'):null;
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const todayD=D(window.TODAY);
const isPast=m=>m.date&&D(m.date)<todayD;
const I={back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',down:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',check:'<path d="M5 12l5 5 9-10"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',dur:'<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>'};
const ic=(n,c='')=>window.MK_IC?`<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n]||window.MK_I[n]}</svg>`:'';
const L={accepted:['Aceite','ok'],declined:['Recusado','no'],pending:['Pendente','wait']};
const chip=s=>s?`<span class="chip ${L[s][1]}">${L[s][0]}</span>`:'';
const initials=n=>(n||'?').charAt(0);
const av=(p,cls='')=>`<span class="av ${cls}">${initials(p.name)}</span>`;
const fmtDate=d=>D(d).toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const endTime=(t,m)=>{if(!t)return null;const[h,mi]=t.split(':').map(Number),x=h*60+mi+m;return String(Math.floor(x/60)%24).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};
const durL=m=>m%60===0?`${m/60} h`:`${Math.floor(m/60)} h ${m%60} min`;
const canRespond=m=>!isPast(m)&&(m.isOrganizer||m.status!=null);
const state2=()=>meal?{}:{};
let ui={edit:q.get('modal')==='edit',del:q.get('modal')==='delete',menu:false,all:false,busy:false};
window.DT={meal,id,state,esc,ic,chip,av,fmtDate,endTime,durL,canRespond,isPast,N,ui,ME,
  type:m=>N[m.type]||m.type,
  rsvp(m,cls=''){if(!canRespond(m))return '';const a=m.status==='accepted',d=m.status==='declined';
    return `<div class="rsvp ${cls}"><button class="btn ok${a?' on':''}" data-act="accepted">${ic('check')}${a?'Aceite ✓':'Confirmar presença'}</button><button class="btn no${d?' on':''}" data-act="declined">${ic('x')}${d?'Recusado ✓':'Recusar'}</button></div>`},
  cal(m){return `<a class="btn line" href="#ics">${ic('down')}Download .ics (Calendário)</a>${m.gcal?`<a class="btn line" href="#gcal" target="_blank" rel="noopener">${ic('ext')}Adicionar ao Google Calendar</a>`:''}`},
  owner(m){return m.isOrganizer?`<button class="btn line" data-open="edit">${ic('edit')}Editar</button><button class="btn line danger" data-open="del">${ic('trash')}Eliminar</button>`:''},
  people(m,max){const all=m.participants,vis=ui.all?all:all.slice(0,max);
    return `<ul class="people">${vis.map(p=>`<li>${av(p)}<div><b>${esc(p.name)}</b>${p.code?`<small>${p.code}</small>`:''}</div>${chip(p.status)}</li>`).join('')}</ul>${all.length>max?`<button class="more" data-open="all">${ui.all?'Mostrar menos':`Mostrar todos (${all.length})`}</button>`:''}`},
  modals(m){return (ui.edit?`<div class="scrim" data-close><form class="modal" role="dialog" aria-modal="true" aria-label="Editar Refeição" onclick="event.stopPropagation()"><h3>Editar refeição</h3>
   <label>Data<input type="date" value="${m.date||''}" min="${window.TODAY}"></label><label>Hora<input type="time" value="${m.time||''}"></label>
   <label>Tipo de refeição<select>${Object.entries(N).map(([k,v])=>`<option value="${k}"${k===m.type?' selected':''}>${v}</option>`).join('')}</select></label>
   <label>Duração<select>${[30,60,90,120,180,240].map(v=>`<option${v===m.dur?' selected':''}>${durL(v)}</option>`).join('')}</select></label>
   <div class="mfoot"><button type="button" class="btn line" data-close>Cancelar</button><button type="button" class="btn" data-close>Guardar alterações</button></div></form></div>`:'')
   +(ui.del?`<div class="scrim" data-close><div class="modal sm" role="alertdialog" aria-modal="true" aria-label="Confirmar eliminação" onclick="event.stopPropagation()"><span class="dangerico">${ic('trash')}</span><h3>Eliminar refeição?</h3><p>Esta ação irá eliminar a refeição e todas as participações associadas. Não pode ser desfeita.</p><div class="mfoot"><button class="btn line" data-close>Cancelar</button><button class="btn dangerfill" data-close>Eliminar</button></div></div></div>`:'')},
  boot(render){
    const bar=document.getElementById('mockbar');
    const link=(k,v,l)=>{const p=new URLSearchParams(location.search);if(v==null)p.delete(k);else p.set(k,v);if(k==='state')p.delete('modal');return `<a href="?${p}"${(q.get(k)||null)===v||(v==null&&!q.get(k))?' aria-current':''}>${l}</a>`};
    bar.innerHTML='<b>/meals/[id]</b>'+[['m1','jantar · organizas'],['m2','almoço · participas (12)'],['m3','nome longo'],['m4','sem hora/local/imagem'],['m5','passada']].map(([k,l])=>link('id',k,l)).join('')+'<span style="width:8px"></span>'+[[null,'default'],['loading','loading'],['notfound','não encontrada']].map(([k,l])=>link('state',k,l)).join('')+'<span style="width:8px"></span>'+[['edit','modal editar'],['delete','modal eliminar']].map(([k,l])=>link('modal',k,l)).join('')+`<a href="${location.pathname.includes('a-')?'detalhe-b-ficha.html':'detalhe-a-convite.html'}${location.search}" style="margin-left:auto">outra direção →</a>`;
    document.getElementById('shell').innerHTML=`<header class="nav"><div class="wrap"><a class="logo" href="#">Food<i>Lister</i></a><ul><li><a href="#">Restaurantes</a></li><li><a href="#">Listas</a></li><li><a href="#" aria-current="page">Refeições</a></li><li><a href="#">Mapa</a></li></ul><span class="avatar">AT</span></div></header>`;
    const root=document.getElementById('root');
    const draw=()=>{
      if(state==='loading'){root.innerHTML='<div class="sk" style="height:220px"></div><div class="sk"></div><div class="sk"></div>';return}
      if(state==='notfound'||!meal){root.innerHTML=`<div class="state">${ic('alert','big')}<h2>Refeição não encontrada</h2><p>A refeição que procuras não existe ou foi removida.</p><a class="btn" href="#">${ic('back')}Voltar ao perfil</a></div>`;return}
      root.innerHTML=render(meal)+DT.modals(meal);
      root.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{meal.status=b.dataset.act;draw()});
      root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const k=b.dataset.open;if(k==='all')ui.all=!ui.all;else ui[k]=true;draw()});
      root.querySelectorAll('[data-close]').forEach(b=>b.onclick=e=>{if(e.target!==b&&b.classList.contains('scrim'))return;ui.edit=ui.del=false;draw()});
    };draw();
  }};
})();
