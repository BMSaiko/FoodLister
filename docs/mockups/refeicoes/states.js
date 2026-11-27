/* Lógica comum de /meals: estados (?state=default|loading|empty|error|auth|noresults), filtro Todas/Organizo/Participo, shell. */
(function(){
const I={clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 4 6"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',home:'<path d="M4 11l8-7 8 7v9H4z"/>',fork:'<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 3c-2 2-3 5-3 8h3v10"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',alert:'<path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/>'};
const ic=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const q=new URLSearchParams(location.search);const state=q.get('state')||'default';
const TYPE={almoco:'Almoço',jantar:'Jantar',lanche:'Lanche'};
let role=q.get('role')||'all';
const D=s=>s?new Date(s+'T12:00:00'):null;
const mon=s=>D(s).toLocaleDateString('pt-PT',{month:'short'}).replace('.','');
const dnum=s=>D(s).getDate();
const wk=s=>D(s).toLocaleDateString('pt-PT',{weekday:'long'});
const monthLong=s=>D(s).toLocaleDateString('pt-PT',{month:'long',year:'numeric'});
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const todayD=D(window.TODAY);
const days=s=>Math.round((D(s)-todayD)/864e5);
const isPast=m=>m.meal_date&&D(m.meal_date)<todayD;
window.MK={ic,esc,mon,dnum,wk,monthLong,days,isPast,TYPE,
  list(){let l=window.MEALS.filter(m=>role==='all'||m.role===role);if(state==='noresults')l=[];return l},
  up(l){return l.filter(m=>!isPast(m)).sort((a,b)=>(a.meal_date||'9').localeCompare(b.meal_date||'9')||(a.meal_time||'').localeCompare(b.meal_time||''))},
  past(l){return l.filter(isPast).sort((a,b)=>b.meal_date.localeCompare(a.meal_date))},
  thumb(m,cls=''){const r=m.restaurant;return `<div class="thumb ${cls}">${r.image?`<img src="${r.image}" alt="" loading="lazy" onerror="this.remove()">`:esc(r.name.replace(/\D/g,'')||r.name[0])}</div>`},
  info(m){const r=m.restaurant;return `<div class="meta">${m.meal_time?`<span>${ic('clock')}${m.meal_time}</span>`:''}${r.location&&r.location!==r.name?`<span>${ic('pin')}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.location)}</span></span>`:''}${m.participant_count>0?`<span>${ic('users')}${m.participant_count}</span>`:''}</div>`},
  badges(m){return `<span class="tag${m.role==='organized'?'':' alt'}">${m.role==='organized'?'Organizas':'Participas'}</span>${m.meal_type&&TYPE[m.meal_type]?`<span class="tag alt">${TYPE[m.meal_type]}</span>`:''}`},
  boot(render){
    const bar=document.getElementById('mockbar');
    bar.innerHTML='<b>/meals</b>'+[['default','default'],['loading','loading'],['empty','vazio'],['noresults','filtro sem resultados'],['error','erro'],['auth','sem sessão']].map(([k,l])=>`<a href="?state=${k}"${state===k?' aria-current':''}>${l}</a>`).join('')+`<a href="${location.pathname.includes('a-')?'b-destaque.html':'a-agenda.html'}" style="margin-left:auto">outra direção →</a>`;
    document.getElementById('shell').innerHTML=`<header class="nav"><div class="wrap"><a class="logo" href="#">Food<i>Lister</i></a><ul><li><a href="#">Restaurantes</a></li><li><a href="#">Listas</a></li><li><a href="#" aria-current="page">Refeições</a></li><li><a href="#">Mapa</a></li></ul><span class="avatar">AT</span></div></header><nav class="tabbar" aria-label="Principal"><a href="#">${ic('home')}Início</a><a href="#">${ic('fork')}Restaurantes</a><a href="#" aria-current="page">${ic('cal')}Refeições</a><a href="#">${ic('map')}Mapa</a><a href="#">${ic('user')}Perfil</a></nav>`;
    const root=document.getElementById('root');
    const draw=()=>{
      if(state==='auth'){root.innerHTML='<div class="state"><p>Precisa de estar autenticado para ver as suas refeições.</p></div>';return}
      const head=`<h1>Refeições</h1><p class="sub">Gere as tuas refeições agendadas</p>`;
      if(state==='loading'){root.innerHTML=head+'<div style="margin-top:28px">'+'<div class="sk"></div>'.repeat(4)+'</div>';return}
      if(state==='error'){root.innerHTML=head+`<div class="state">${ic('alert').replace('<svg','<svg style="width:32px;height:32px;color:var(--danger)"')}<h2>Não foi possível carregar as refeições</h2><p>Verifica a ligação e tenta de novo.</p><a class="btn" href="?state=default">Tentar de novo</a></div>`;return}
      if(state==='empty'){root.innerHTML=head+`<div class="state"><img src="assets/tovi-a-pensar.svg" alt=""><h2>Nenhuma refeição agendada</h2><p>Agenda uma refeição a partir de qualquer restaurante.</p><a class="btn" href="#">Explorar Restaurantes ${ic('arrow')}</a></div>`;return}
      const seg=`<div class="seg" role="group" aria-label="Filtrar refeições">${[['all','Todas'],['organized','Organizo'],['participating','Participo']].map(([k,l])=>`<button aria-pressed="${role===k}" data-r="${k}">${l}</button>`).join('')}</div>`;
      const l=MK.list();
      root.innerHTML=head+seg+(l.length?render(l):`<div class="state"><p>Nenhuma refeição nesta vista.</p><button class="btn" data-r="all">Ver todas</button></div>`);
      root.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{role=b.dataset.r;draw()});
    };draw();
  }};
})();
