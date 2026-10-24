/* Lógica comum dos mockups /restaurants: dados reais (data.js), filtros/ordenação reais e barra de estados. */
const IC={
  search:'<path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5"/>',
  sliders:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/>',
  pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  star:'<path d="M12 3l2.700 5.700 6.300.8-4.600 4.300 1.200 6.200L12 17l-5.600 3 1.200-6.200L3 9.500l6.300-.8z"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev:'<path d="M6 9l6 6 6-6"/>'
};
const ic=(n,c="")=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const img=u=>"../../../public"+u;
const $=id=>document.getElementById(id);

const LONG={name:"Restaurante Tradicional de Cozinha Portuguesa e Petiscos da Ribeira do Porto com Esplanada",location:"Rua de Mouzinho da Silveira 123, Ribeira, 4050-417 Porto, Portugal",creator_display_name:"nome.muito.comprido.do.utilizador+teste@subdominio.empresa-exemplo.co.uk"};
const V=[["normal","Normal"],["loading","Loading"],["empty","Vazio"],["noresults","Sem resultados"],["error","Erro"],["long","Nome longo"],["many","Muitos itens"]];
const N=[["off","Perto: off"],["locating","A localizar"],["locerr","Sem localização"],["on","Perto: ativo"]];
const st={view:"normal",near:"off",user:1,q:"",sort:"random:asc",pmin:null,pmax:null,rmin:null,loc:"",radius:10};

function place(l){const p=(l||"").split(",").map(s=>s.trim()).filter(Boolean);return p.slice(-2).join(", ")||l||""}
function base(){
  let a=window.DATA.map(r=>({...r}));
  if(st.view==="long")a[4]={...a[4],...LONG};
  if(st.view==="many"){const m=[];for(let i=0;i<3;i++)a.forEach(r=>m.push({...r,id:r.id+i}));a=m}
  if(st.view==="empty"||st.view==="error")a=[];
  if(st.view==="noresults"||st.q)a=a.filter(r=>r.name.toLowerCase().includes((st.q||"zzz").toLowerCase()));
  return a;
}
function filtered(){
  let a=base();
  if(st.near==="on")a=a.filter(r=>r.images.length).slice(0,6);
  a=a.filter(r=>(st.pmin==null||(r.price_per_person??0)>=st.pmin)&&(st.pmax==null||(r.price_per_person??Infinity)<=st.pmax)&&(st.rmin==null||(r.rating??0)>=st.rmin)&&(!st.loc||(r.location||"").toLowerCase().includes(st.loc.toLowerCase())));
  if(st.sort==="random:asc"){const z=st.seed||(st.seed=Math.random());const h=r=>{let x=Math.sin(String(r.id).split("").reduce((p,c)=>(p*31+c.charCodeAt(0))%100003,7)+z*1e4)*1e4;return x-Math.floor(x)};a.sort((x,y)=>h(x)-h(y));return [...a.filter(r=>r.images.length),...a.filter(r=>!r.images.length)]}
  const [k,d]=st.sort.split(":"),f={name:r=>r.name,rating:r=>r.rating??-1,price:r=>r.price_per_person??-1,popularity:r=>r.review_count};
  a.sort((x,y)=>{const u=f[k](x),v=f[k](y);return (u>v?1:u<v?-1:0)*(d==="desc"?-1:1)});
  if(st.sort==="name:asc")a=[...a.filter(r=>r.images.length),...a.filter(r=>!r.images.length)];
  return a;
}
function card(r){
  const m=r.images.length?r.images[Math.max(0,r.display_image_index)]||r.images[0]:"";
  const tail=r.name.split(" ").pop();
  const p=m?`<img src="${img(m)}" alt="${esc(r.name)}" loading="lazy">`:`<div class="noimg"><b>${esc(tail)}</b><span>Sem fotografia</span></div>`;
  return `<article class="card"><div class="ph">${p}
  ${r.rating!=null?`<span class="tag l">${ic("star","fill")}${r.rating.toFixed(1)}${r.review_count>0?` <small>(${r.review_count})</small>`:""}</span>`:""}
  ${r.price_per_person!=null?`<span class="tag r">€${r.price_per_person}</span>`:""}</div>
  <div class="bd"><h3><a href="#" title="${esc(r.name)}">${esc(r.name)}</a></h3>
  <div class="loc">${ic("pin")}<span>${esc(place(r.location))}</span></div>
  <div class="by">Adicionado por <a href="#">${esc(r.creator_display_name)}</a></div>
  <div class="go">Ver restaurante ${ic("arrow")}</div></div></article>`;
}
function hero(){
  const r=window.DATA.find(x=>x.images.length>1)||window.DATA[0];if(!r)return"";
  const ph=r.images.map((u,i)=>`<img class="img${i?"":" on"}" src="${img(u)}" alt="${i?"":esc(r.name)}">`).join("");
  return `${ph}<div class="dots">${r.images.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>
  <div class="in"><div class="eyebrow">Sugestão de hoje</div><h2>${esc(r.name)}</h2>
  <div class="facts"><span class="pill">${ic("star","fill")}${r.rating.toFixed(1)} <span style="opacity:.6">(${r.review_count})</span></span><span class="pill pr">€${r.price_per_person}</span><span>${ic("pin")} ${esc(place(r.location))}</span><span class="creator">Criado por <a href="#">${esc(r.creator_display_name)}</a></span></div>
  <p>${esc(r.description)}</p><a class="cta" href="#">Ver restaurante ${ic("arrow")}</a></div>`;
}
function render(){
  const list=filtered(),loading=st.view==="loading",nearOn=st.near==="on";
  const b=document.body;b.dataset.state=st.view;b.dataset.near=st.near;b.dataset.user=st.user;b.dataset.q=st.q?"1":"0";
  $("hero").innerHTML=loading?"":hero();$("hero").style.display=loading?"none":"";
  $("grid").innerHTML=loading?"":list.map(card).join("");
  $("grid").style.display=loading?"none":"";
  const showMsg=!loading&&!list.length&&st.near!=="locerr";
  const msg=$("msg");msg.style.display=showMsg?"block":"none";msg.className="msg"+(st.view==="error"?" err":"");
  msg.innerHTML=st.view==="error"?`<h3>Erro: não foi possível carregar os restaurantes.</h3><p>Verifique a ligação e tente outra vez.</p><button class="btn" onclick="setView('normal')">Tentar de novo</button>`
   :`<h3>Nenhum restaurante encontrado.</h3><p>${st.q?`Sem resultados para «${esc(st.q)}».`:"Experimente outros filtros ou adicione o primeiro restaurante."}</p>${st.user?`<a class="cta" href="#">${ic("plus")} Criar restaurante</a>`:""}`;
  const total=st.view==="many"?900:list.length;
  document.querySelectorAll(".cnt").forEach(e=>e.innerHTML=`<b>${loading?"–":total}</b> restaurantes`);
  $("more").style.display=st.view==="many"&&!nearOn?"block":"none";
  $("foot").style.display=!loading&&list.length?"block":"none";$("foot").textContent=`${total} restaurantes`;
  const n=(st.pmin!=null||st.pmax!=null?1:0)+(st.rmin!=null?1:0);
  document.querySelectorAll(".fbadge").forEach(e=>{e.textContent=n;e.style.display=n?"inline-grid":"none"});
  document.querySelectorAll(".clear").forEach(e=>e.style.display=n||st.loc?"inline-flex":"none");
  document.querySelectorAll(".nearby").forEach(e=>e.classList.toggle("on",st.near==="on"||st.near==="locating"));
  document.querySelectorAll(".radius").forEach(e=>{e.style.display=st.near==="off"?"none":"";e.value=st.radius});
  const msgN={locating:"A localizar...",locerr:"Não foi possível obter a sua localização. Ative a localização no browser.",on:`${list.length} restaurantes a ${st.radius} km`,off:""}[st.near];
  document.querySelectorAll(".nstat").forEach(e=>{e.textContent=msgN;e.style.color=st.near==="locerr"?"var(--err)":""});
  document.querySelectorAll(".qchip span").forEach(e=>e.textContent="Pesquisa: "+st.q);
  document.querySelectorAll(".sch span").forEach(e=>e.textContent=st.q||"Pesquisar restaurantes");
  document.querySelectorAll(".rate").forEach(e=>e.classList.toggle("on",+e.dataset.r===st.rmin));
  bar.querySelectorAll("button[data-k]").forEach(x=>x.classList.toggle("on",x.dataset.k===st.view||x.dataset.k==="n:"+st.near||(x.dataset.k==="u"&&st.user)||(x.dataset.k==="q"&&st.q)));
}
function setView(v){st.view=v;if(v!=="noresults")st.q=st.q&&v==="normal"?"":st.q;render()}
window.setView=setView;

const bar=document.createElement("div");bar.className="states";
V.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.dataset.k=k;b.onclick=()=>{st.q=k==="noresults"?"sushi":"";st.view=k;render()};bar.append(b)});
bar.append(Object.assign(document.createElement("span"),{className:"sep"}));
N.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.dataset.k="n:"+k;b.onclick=()=>{st.near=k;render()};bar.append(b)});
bar.append(Object.assign(document.createElement("span"),{className:"sep"}));
const u=document.createElement("button");u.textContent="Com sessão (FAB)";u.dataset.k="u";u.onclick=()=>{st.user=st.user?0:1;render()};bar.append(u);
const q=document.createElement("button");q.textContent="Pesquisa ativa";q.dataset.k="q";q.onclick=()=>{st.q=st.q?"":"Teste";if(st.view==="noresults")st.view="normal";render()};bar.append(q);
document.body.prepend(bar);

document.querySelectorAll("[data-ic]").forEach(e=>e.outerHTML=ic(e.dataset.ic));
/* controlos */
document.querySelectorAll(".ftoggle").forEach(b=>b.onclick=()=>{const p=document.querySelector(b.dataset.t||".panel");p.classList.toggle("open");b.classList.toggle("on",p.classList.contains("open"))});
document.querySelectorAll(".nearby").forEach(b=>b.onclick=()=>{st.near=st.near==="off"?"locating":"off";if(st.near==="locating")setTimeout(()=>{if(st.near==="locating"){st.near="on";render()}},900);render()});
document.querySelectorAll(".radius").forEach(e=>e.onchange=()=>{st.radius=+e.value;render()});
document.querySelectorAll(".sort").forEach(e=>e.value=st.sort);
document.querySelectorAll(".sort").forEach(e=>e.onchange=()=>{st.sort=e.value;st.seed=0;document.querySelectorAll(".sort").forEach(x=>x.value=e.value);render()});
document.querySelectorAll(".pmin").forEach(e=>e.oninput=()=>{st.pmin=e.value?+e.value:null;render()});
document.querySelectorAll(".pmax").forEach(e=>e.oninput=()=>{st.pmax=e.value?+e.value:null;render()});
document.querySelectorAll(".loc-in").forEach(e=>e.oninput=()=>{st.loc=e.value;render()});
document.querySelectorAll(".rate").forEach(e=>e.onclick=()=>{st.rmin=st.rmin===+e.dataset.r?null:+e.dataset.r;render()});
document.querySelectorAll(".clear").forEach(e=>e.onclick=()=>{Object.assign(st,{pmin:null,pmax:null,rmin:null,loc:""});document.querySelectorAll(".pmin,.pmax,.loc-in").forEach(x=>x.value="");render()});
document.querySelectorAll(".qchip button").forEach(e=>e.onclick=()=>{st.q="";if(st.view==="noresults")st.view="normal";render()});
document.querySelectorAll(".cuis").forEach(e=>e.style.display="none"); /* sem cuisine_types nos dados dev: grupo oculto como no código (availableCuisines.length>0) */
let hi=0;setInterval(()=>{const im=document.querySelectorAll("#hero .img"),d=document.querySelectorAll("#hero .dots i");if(im.length<2)return;hi=(hi+1)%im.length;im.forEach((x,i)=>x.classList.toggle("on",i===hi));d.forEach((x,i)=>x.classList.toggle("on",i===hi))},4000);
document.querySelectorAll("[data-sheet]").forEach(b=>b.onclick=()=>document.body.classList.toggle("sheet"));
render();
