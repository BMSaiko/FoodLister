// Dados reais do seed (Ana Teste, Restaurante Teste 1-5, listas de docs/mockups/listas/data.json).
// Tempos em minutos atrás, para o formatTimeAgo da página (lib atual) não mudar.
const ANA={name:"Ana Teste",avatar:"assets/avatar-ana.svg",code:"ana-teste"};
const SEM={name:"Utilizador",avatar:null,code:null}; // sem perfil: fallback do código
const LONGO={name:"Ana Beatriz Fernandes de Albuquerque e Vasconcelos Pimentel",avatar:null,code:"ana-beatriz"};
const R={1:["Restaurante Teste 1","r1.png"],2:["Restaurante Teste 2","r2.jpeg"],3:["Restaurante Teste 3","r3.png"],4:["Restaurante Teste 4","r4.png"],5:["Restaurante Teste 5","r5.png"]};
const BASE=[
 {t:"review",a:ANA,r:3,m:4},
 {t:"list",a:ANA,l:"Brunch de domingo",pv:[],m:95},
 {t:"follow",a:SEM,to:"Ana Teste",m:60*5},
 {t:"review",a:ANA,r:1,m:60*26},
 {t:"list",a:ANA,l:"Jantares de sábado à noite",pv:[1,3,4],m:60*24*3},
 {t:"review",a:SEM,r:2,m:60*24*4},
 {t:"follow",a:ANA,to:"outro utilizador",m:60*24*9},
 {t:"review",a:ANA,r:5,m:60*24*12},
];
const LONG=[
 {t:"review",a:LONGO,r:4,rn:"Restaurante de Peixe e Marisco do Mercado Municipal de Matosinhos, Cais da Ribeira",m:12},
 {t:"list",a:LONGO,l:"Os melhores sítios para um jantar demorado de sábado à noite no Porto e em Gaia, com reserva",pv:[2,5],m:200},
 {t:"follow",a:LONGO,to:"Maria Conceição de Almeida Cardoso Mendes",m:900},
];
const ICON={
 review:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
 follow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M19 8v6M16 11h6"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
 down:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
};
const TAG={review:"Review",list:"Nova lista",follow:"Novo seguidor"};
// Mesma regra do formatTimeAgo de app/feed/page.tsx
function ago(m){if(m<1)return"Agora mesmo";if(m<60)return`há ${m}min`;const h=Math.floor(m/60);if(h<24)return`há ${h}h`;const d=Math.floor(h/24);if(d<7)return`há ${d}d`;return new Date(Date.now()-m*60000).toLocaleDateString("pt-PT")}
function day(m){const h=m/60;return h<24?"Hoje":h<48?"Ontem":h<24*7?"Esta semana":"Mais antigo"}
function e(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function avatar(a){
  const inner=a.avatar?`<img src="${a.avatar}" alt="${e(a.name)}">`:ICON.user;
  // Avatar com código leva ao perfil (link irmão, não aninhado: corrige <a> dentro de <a>)
  return a.code?`<a class="av" href="#perfil" aria-label="Perfil de ${e(a.name)}">${inner}</a>`:`<span class="av">${inner}</span>`;
}
function phrase(i){
  const n=i.a.name;
  if(i.t==="review")return`<span class="who">${e(n)}</span> <span class="what">fez um review em <b>${e(i.rn||R[i.r][0])}</b></span>`;
  if(i.t==="list")return`<span class="who">${e(n)}</span> <span class="what">criou a lista <b>${e(i.l)}</b></span>`;
  return`<span class="who">${e(n)}</span> <span class="what">começou a seguir <b>${e(i.to)}</b></span>`;
}
// Direção A: linha do tempo por dia, linhas compactas num trilho vertical
function renderA(items){
  let out="",last="";
  items.forEach(i=>{
    const d=day(i.m);
    if(d!==last){out+=`<h2 class="day">${d}</h2>`;last=d}
    out+=`<div class="row"><span class="node t-${i.t}" aria-hidden="true">${ICON[i.t]}</span>
      <div class="card">${avatar(i.a)}<a class="t main" href="#destino"><span class="tag">${TAG[i.t]}</span><p>${phrase(i)}</p><time>${ago(i.m)}</time></a></div></div>`;
  });
  return out;
}
// Direção B: cartões com contexto (foto do restaurante, pré-visualização da lista)
function renderB(items){
  return items.map(i=>{
    let media="";
    if(i.t==="review"){const[n,img]=R[i.r];media=`<img class="ph" src="assets/${img}" alt="" loading="lazy">`}
    if(i.t==="list"){media=i.pv.length?`<div class="strip">${i.pv.map(k=>`<img src="assets/${R[k][1]}" alt="">`).join("")}</div>`:`<div class="strip none">${ICON.list}</div>`}
    return`<article class="card t-${i.t}"><header>${avatar(i.a)}<div class="t"><p>${phrase(i)}</p><time>${ago(i.m)}</time></div><span class="tag">${ICON[i.t]}${TAG[i.t]}</span></header>${media?`<div class="media">${media}</div>`:""}<a class="stretch" href="#destino" aria-label="${e(i.a.name)}: abrir ${TAG[i.t].toLowerCase()}"></a></article>`;
  }).join("");
}
function init(dir){
  const S=[["default","Normal (faz scroll)"],["more","A carregar mais"],["end","Fim do feed"],["long","Textos longos"],["loading","Loading"],["empty","Vazio"],["error","Erro ao carregar mais"],["fatal","Erro total"]];
  const bar=document.createElement("div");bar.className="states";
  S.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.dataset.k=k;b.onclick=()=>set(k);bar.append(b)});
  document.body.append(bar);
  // Scroll infinito como /restaurants (RestaurantGrid): sentinela com rootMargin 600px, skeletons enquanto carrega, sem botão.
  let batches=1,timer=0,obs=null;
  const MAX=3; // simula hasMore=false ao fim de 3 páginas
  function items(k){
    let all=k==="long"?LONG.concat(BASE):BASE;
    for(let n=1;n<batches;n++)all=all.concat(BASE.map(i=>({...i,m:i.m+n*60*24*14})));
    return all;
  }
  function paint(k){document.getElementById("list").innerHTML=(dir==="a"?renderA:renderB)(items(k))}
  function set(k){
    clearTimeout(timer);
    batches=k==="end"?MAX:1;
    document.body.dataset.state=k;
    bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
    paint(k);
    arm();
  }
  function load(){
    if(dir!=="b"||document.body.dataset.state!=="default"||batches>=MAX)return;
    document.body.dataset.state="more";
    bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k==="more"));
    timer=setTimeout(()=>{
      batches++;paint("default");
      const k=batches>=MAX?"end":"default";
      document.body.dataset.state=k;
      bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
      arm();
    },900);
  }
  function arm(){
    const s=document.getElementById("sentinel");
    if(!s||typeof IntersectionObserver==="undefined")return;
    if(obs)obs.disconnect();
    obs=new IntersectionObserver(en=>{if(en[0].isIntersecting)load()},{rootMargin:"600px 0px"});
    obs.observe(s);
  }
  const q=new URLSearchParams(location.search).get("state");
  set(q||"default");
}
