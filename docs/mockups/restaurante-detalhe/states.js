/* Lógica comum dos mockups /restaurants/[id]: dados reais (data.js), estados, papéis e interações. Layout vem de body[data-layout]=A|B. */
const IC={
  star:'<path d="M12 3l2.700 5.700 6.300.8-4.600 4.300 1.200 6.200L12 17l-5.600 3 1.200-6.200L3 9.500l6.300-.8z"/>',
  pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  search:'<path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  more:'<circle cx="5" cy="12" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="19" cy="12" r="1.200"/>',
  share:'<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4.500 6h.01M4.500 12h.01M4.500 18h.01"/>',
  flag:'<path d="M5 21V4h11l-1.500 4L16 12H5"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  phone:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  menu:'<path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8M18 3c-2 2-3 5-3 8h3v10"/>',
  img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.500"/><path d="M21 16l-5-5-9 9"/>',
  chev:'<path d="M9 6l6 6-6 6"/>',up:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};
const ic=(n,c="")=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const $=id=>document.getElementById(id);
const L=document.body.dataset.layout;
const src=u=>"../../../public"+u;
const ME="dbec0413-860a-49ff-8444-bb5e0bb78e44"; /* utilizador de teste = autor da avaliação de 3 estrelas */
const LONG={name:"Restaurante Tradicional de Cozinha Portuguesa e Petiscos da Ribeira do Porto com Esplanada",location:"Rua de Mouzinho da Silveira 123, Ribeira, 4050-417 Porto, Portugal",creator_display_name:"nome.muito.comprido.do.utilizador+teste@subdominio.empresa-exemplo.co.uk",description:"Casa de petiscos e pratos tradicionais no coração da Ribeira, com esplanada virada para o rio, carta de vinhos do Douro e sobremesas de convento feitas todos os dias, aberta ao almoço e ao jantar."};
const EXTRA={cuisine_types:["Portuguesa","Petiscos"],dietary_options:["Vegetariano","Sem glúten"],features:["Esplanada","Wi-Fi","Aceita reservas"],phones:["+351 22 000 0001","+351 91 000 0002"],menu_images:["/dev-seed/r1/2.png","/dev-seed/r1/4.png"],website:"https://exemplo.pt",hours:[["Segunda","Fechado"],["Terça","12:00–15:00 · 19:00–23:00"],["Quarta","12:00–15:00 · 19:00–23:00"],["Quinta","12:00–15:00 · 19:00–23:00"],["Sexta","12:00–15:00 · 19:00–00:00"],["Sábado","12:00–00:00"],["Domingo","12:00–16:00"]],menu_url:"https://exemplo.pt/menu"};
const VIEWS=[["normal","Normal"],["loading","Loading"],["notfound","Não encontrado"],["error","Erro"],["nophotos","Sem fotos"],["long","Nome longo"],["noreviews","Sem avaliações"],["many","Muitos itens"]];
const ROLES=[["visitor","Visitante"],["user","Utilizador"],["owner","Dono"],["admin","Admin"]];
const st={view:"normal",role:"user",tab:"sobre",editing:false,expanded:{},infoMore:false,lb:0,hl:null};

function data(){
  const v=st.view;let d={...window.DETAIL},r=window.REVIEWS.map(x=>({...x}));
  if(v==="long")d={...d,...LONG};
  if(v==="many"){d={...d,...EXTRA};const m=[];for(let i=0;i<3;i++)r.forEach(x=>m.push({...x,id:x.id+i}));r=m;d.review_count=r.length}
  if(v==="nophotos"){d.images=[];r=r.map(x=>({...x,images:[]}))}
  if(v==="noreviews"){r=[];d.rating=null;d.review_count=0}
  return {d,r};
}
function photos(d,r){const s=new Set(),a=[];[...d.images,...r.flatMap(x=>x.images)].forEach(u=>{if(u&&!/placeholder|^data:/.test(u)&&!s.has(u)){s.add(u);a.push(u)}});return a}
const stars=(n,sz="")=>`<span class="stars" aria-label="${n} de 5">${[1,2,3,4,5].map(i=>ic("star",i<=Math.round(n)?"fill":"fill off")).join("")}</span>`;
const fmt=d=>new Date(d).toLocaleDateString("pt-PT",{day:"numeric",month:"long",year:"numeric"});
const euro=p=>p==null?"":`<span class="price"><b>${"€".repeat(p<10?1:p<20?2:p<35?3:4)}<i>${"€".repeat(4-(p<10?1:p<20?2:p<35?3:4))}</i></b> €${p.toFixed(2).replace(".",",")} por pessoa</span>`;
const can=()=>st.role!=="visitor";
const canEdit=()=>st.role==="owner"||st.role==="admin";
const mine=r=>st.role==="admin"||(st.role==="user"&&r.user_id===ME);

function menu(id){
  return `<div class="menu" id="${id}" role="menu">
  ${canEdit()?`<button role="menuitem" data-a="edit">${ic("edit")}Editar restaurante</button>`:""}
  ${can()?`<button role="menuitem" data-a="save">${ic("list")}Guardar numa lista</button>`:""}
  ${can()?`<button role="menuitem" data-a="report">${ic("flag")}Denunciar</button>`:""}
  ${st.role==="admin"?`<hr><button role="menuitem" class="dng" data-a="del">${ic("trash")}Eliminar restaurante</button>`:""}
  ${!can()?`<button role="menuitem" data-a="login">${ic("user")}Iniciar sessão para guardar</button>`:""}</div>`;
}
function actions(prefix,d){
  return `${can()?`<button class="cta" data-a="rate">${ic("star")}Avaliar</button>`:`<button class="cta" data-a="login">${ic("star")}Avaliar</button>`}
  <button class="btn" data-a="sched">${ic("cal")}Agendar</button>
  <button class="ib" data-a="share" aria-label="Partilhar">${ic("share")}</button>
  <span style="position:relative"><button class="ib" data-a="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Mais ações">${ic("more")}</button>${menu(prefix+"menu")}</span>${can()?"":`<p class="hint">Inicie sessão para avaliar e guardar em listas.</p>`}`;
}
function head(d,r){
  const sc=d.rating!=null&&d.review_count>0;
  return `${d.creator_display_name?`<div class="by2">Por <a href="#">${esc(d.creator_display_name)}</a></div>`:""}
  <h1>${esc(d.name)}</h1>
  <div class="facts2">
   <div class="row2">${sc?`<span class="score">${stars(d.rating)}<b>${d.rating.toFixed(1)}</b><small>(${d.review_count} ${d.review_count===1?"avaliação":"avaliações"})</small></span>`:`<span class="meta">Ainda sem avaliações</span>`}</div>
   ${d.price_per_person!=null?`<div class="row2">${euro(d.price_per_person)}</div>`:""}
   ${d.location?`<div class="row2">${ic("pin")}<span>${esc(d.location)}</span></div>`:""}
  </div>`;
}
function shortcuts(d){
  const hasMap=d.latitude!=null,sc=[];
  if(hasMap)sc.push(`<a class="chip" href="#loc">${ic("pin")}Mapa</a>`);
  if(d.menu_url||(d.menu_images||[]).length)sc.push(`<a class="chip" href="#menu">${ic("menu")}Menu</a>`);
  if((d.phones||[]).length)sc.push(`<a class="chip" href="tel:${esc(d.phones[0])}">${ic("phone")}Ligar</a>`);
  if(d.website)sc.push(`<a class="chip" href="${esc(d.website)}">${ic("globe")}Site</a>`);
  return sc.length?`<div class="shortcuts">${sc.join("")}</div>`:"";
}
function gallery(d,ph){
  if(!ph.length)return `<div class="brand ${L==="B"?"slim":""}"><div class="mascot">${ic("img").replace('class="ic ','class="ic ')}</div><b>Ainda sem fotografias</b><span>Mascote «tovi-a-dormir» no lugar da galeria</span></div>`;
  const b=(u,i,x="")=>`<button class="ph-btn m${i} ${x}" data-lb="${i}" aria-label="Abrir foto ${i+1} de ${ph.length}"><img src="${src(u)}" alt="${i?"":esc(d.name)}" loading="lazy"></button>`;
  if(L==="A"){
    const n=Math.min(ph.length,5);
    return `<div class="gal"><div class="mosaic n${n}">${ph.slice(0,n).map((u,i)=>b(u,i)).join("")}</div>
    <button class="allbtn" data-lb="0">${ic("img")}Ver as ${ph.length} fotos</button></div>
    <div class="gal mob"><div class="snap" id="snap">${ph.map((u,i)=>b(u,i)).join("")}</div><span class="snapc" id="snapc">1 / ${ph.length}</span></div>`;
  }
  return `<div class="strip" id="snap">${ph.map((u,i)=>b(u,i)).join("")}</div>
  <div class="thumbs">${ph.map((u,i)=>`<button data-lb="${i}" aria-label="Foto ${i+1}" class="${i?"":"on"}"><img src="${src(u)}" alt=""></button>`).join("")}</div>`;
}
function infoRow(k,v){return `<div class="ir"><dt>${k}</dt><dd>${v||'<span class="na">Não indicado</span>'}</dd></div>`}
function about(d){
  const tags=(l,c="")=>l&&l.length?l.map(t=>`<span class="tg ${c}">${esc(t)}</span>`).join(""):"";
  const hrs=d.hours?`<ul class="hrs">${d.hours.map(([n,t],i)=>`<li class="${i===5?"today":""}"><span>${n}</span><span>${t}</span></li>`).join("")}</ul>`:"";
  const sc=d.rating!=null&&d.review_count>0;
  let h="";
  if(d.description)h+=`<p class="lead">${esc(d.description)}</p>`;
  h+=`<section class="sec" id="info"><h2>Informações</h2><dl class="info">
  ${infoRow("Morada",d.location?esc(d.location):"")}
  ${infoRow("Preço médio",d.price_per_person!=null?`€${d.price_per_person.toFixed(2).replace(".",",")} por pessoa`:"")}
  ${infoRow("Cozinha",tags(d.cuisine_types))}
  ${infoRow("Horário",hrs)}
  ${infoRow("Telefone",(d.phones||[]).length?`<span class="tels">${d.phones.map(p=>`<a class="chip" href="tel:${esc(p)}">${ic("phone")}${esc(p)}</a>`).join("")}</span>`:"")}
  <div class="moreW${st.infoMore?" open":""}" id="moreW"><div class="moreI">
  ${infoRow("Avaliação",sc?`${d.rating.toFixed(1)} / 5 · ${d.review_count} ${d.review_count===1?"avaliação":"avaliações"}`:"")}
  ${infoRow("Opções alimentares",tags(d.dietary_options,"g"))}
  ${infoRow("Características",tags(d.features))}
  ${infoRow("Website",d.website?`<a class="lnk" href="${esc(d.website)}">${esc(d.website.replace(/^https?:\/\//,""))}</a>`:"")}
  ${infoRow("Menu online",d.menu_url?`<a class="lnk" href="${esc(d.menu_url)}">${esc(d.menu_url.replace(/^https?:\/\//,""))}</a>`:"")}
  ${infoRow("Coordenadas",d.latitude!=null?`${d.latitude}, ${d.longitude}`:"")}
  ${infoRow("Adicionado por",d.creator_display_name?`<a class="lnk" href="#">${esc(d.creator_display_name)}</a>`:"")}
  ${infoRow("Adicionado em",d.created_at?fmt(d.created_at):"")}
  ${infoRow("Atualizado em",d.updated_at?fmt(d.updated_at):"")}
  </div></div>
  </dl><button class="btn moreinfo" data-a="infomore" aria-expanded="${st.infoMore}">${st.infoMore?"Ver menos":"Ver mais informações"}<svg class="ic ${st.infoMore?"up2":"dn"}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></section>`;
  h+=`<section class="sec" id="loc"><h2>Localização</h2>${d.latitude!=null?`<button class="map" data-a="nav" aria-label="Abrir opções de navegação para ${esc(d.name)}"><span class="pin">${ic("pin")}</span><span class="mapcta">${ic("arrow")}Como chegar</span><small>Mapa ilustrativo (Leaflet só na app) · ${d.latitude}, ${d.longitude}</small></button>`:`<div class="empty2" style="padding:24px"><p style="margin:0">Sem localização no mapa.</p></div>`}
  <div class="addr"><span>${esc(d.location||"Sem morada")}</span></div></section>`;
  if((d.menu_images||[]).length)h+=`<section class="sec" id="menu"><h2>Menu</h2><div class="mgal">${d.menu_images.map(u=>`<button class="ph-btn" data-lbm="${u}" aria-label="Abrir menu"><img src="${src(u)}" alt="Menu"></button>`).join("")}</div></section>`;
  return h;
}
function reviewCard(x){
  const long=x.comment.length>150,open=st.expanded[x.id];
  const text=long&&!open?x.comment.slice(0,150).trimEnd()+"…":x.comment;
  return `<article class="rv${st.hl===x.id?" hl":""}" id="rv-${x.id}">
  <div class="hd"><div class="av">${esc(x.user_name[0])}</div><div><div class="nm"><a href="#">${esc(x.user_name)}</a></div><div class="dt">${fmt(x.created_at)}</div></div><div class="sp">${stars(x.rating)}</div></div>
  <p>${esc(text)} ${long?`<button class="more2" data-ex="${x.id}">${open?"ver menos":"ver mais"}</button>`:""}</p>
  ${x.amount_spent!=null?`<div class="spent">Gastou €${x.amount_spent.toFixed(2).replace(".",",")}</div>`:""}
  ${x.images.length?`<div class="imgs">${x.images.map(u=>`<button class="ph-btn" data-lbm="${u}" aria-label="Abrir foto da avaliação"><img src="${src(u)}" alt="" loading="lazy"></button>`).join("")}</div>`:""}
  ${can()?`<div class="ra">${mine(x)?`<button class="link" data-a="rate">${ic("edit")}Editar</button><button class="link dng" data-a="delrev">${ic("trash")}Eliminar</button>`:""}${x.user_id!==ME||st.role!=="user"?`<button class="link" data-a="report">${ic("flag")}Denunciar</button>`:""}</div>`:""}</article>`;
}
function reviews(d,r){
  const form=`<div class="form${st.editing?" open":""}" id="form"><h3>${r.find(x=>x.user_id===ME)&&st.role==="user"?"Editar a sua avaliação":"Nova avaliação"}</h3>
  <div class="pick" role="radiogroup" aria-label="Nota">${[1,2,3,4,5].map(i=>`<button class="${i<=3?"on":""}" data-p="${i}" aria-label="${i} estrelas">${ic("star","fill")}</button>`).join("")}</div>
  <textarea placeholder="O que achou? Use @ para mencionar alguém." aria-label="Comentário"></textarea>
  <label class="fld" style="max-width:220px"><span class="meta">€</span><input type="number" min="0" placeholder="Valor gasto" aria-label="Valor gasto"></label>
  <div class="addph">${ic("plus")}Adicionar fotos</div>
  <div class="two"><button class="btn" data-a="cancel">Cancelar</button><button class="cta" data-a="send">Guardar avaliação</button></div></div>`;
  if(!r.length)return form+`<div class="empty2"><h3>Ainda sem avaliações</h3><p>Seja o primeiro a avaliar ${esc(d.name)}.</p>${can()?`<button class="cta" data-a="rate">${ic("star")}Fazer avaliação</button>`:`<button class="cta" data-a="login">Iniciar sessão para avaliar</button>`}</div>`;
  const tot=r.length,dist=[5,4,3,2,1].map(n=>[n,r.filter(x=>Math.round(x.rating)===n).length]);
  const avg=d.rating??r.reduce((s,x)=>s+x.rating,0)/tot;
  return `<div class="sum"><div><div class="big">${avg.toFixed(1)} <small>/ 5</small></div>${stars(avg)}<div class="meta" style="margin-top:6px">${tot} avaliações</div></div>
  <div class="dist">${dist.map(([n,c])=>`<div><span>${n}</span><i><b style="width:${c/tot*100}%"></b></i><span>${c}</span></div>`).join("")}</div></div>${form}
  ${r.map(reviewCard).join("")}`;
}
function listsSec(){
  if(st.view!=="many")return "";
  return `<section class="sec" id="listas"><h2>Listas${L==="A"?"":""}</h2><p class="ilus">Ilustrativo: os dados de desenvolvimento ainda não têm listas com este restaurante.</p><div class="lists"><a href="#">Francesinhas do Porto <small>12 locais</small></a><a href="#">Jantares de sexta <small>7 locais</small></a><a href="#">Sobremesas a repetir <small>5 locais</small></a></div></section>`;
}
function body(){
  const {d,r}=data(),ph=photos(d,r),nl=st.view==="many"?3:0;
  if(st.view==="loading")return `<div class="skp"><i class="g"></i><i class="t"></i><i class="l"></i><i class="l w"></i><i class="l"></i></div>`;
  if(st.view==="notfound")return `<div class="msg" style="display:block"><h3>Restaurante não encontrado.</h3><p>Pode ter sido removido ou o endereço está incorreto.</p><a class="cta" href="#">Voltar aos restaurantes</a></div>`;
  if(st.view==="error")return `<div class="msg err" style="display:block"><h3>Erro: não foi possível carregar o restaurante.</h3><p>Verifique a ligação e tente outra vez.</p><button class="btn" onclick="setView('normal')">Tentar de novo</button></div>`;
  const crumb=`<nav class="crumb"><a href="#">${ic("arrow","back")}Restaurantes</a><span>/</span><span>${esc(d.name.length>40?d.name.slice(0,40)+"…":d.name)}</span></nav>`;
  const rtitle=`Avaliações <span class="badge">${r.length}</span>`;
  if(L==="A"){
    return `${crumb}<div class="la"><div class="main">${gallery(d,ph)}
    
    ${about(d)}
    <section class="sec" id="avaliacoes"><h2>${rtitle}</h2>${reviews(d,r)}</section>${listsSec()}</div>
    <aside class="side"><div class="card2 title">${head(d,r)}${shortcuts(d)}<div class="acts">${actions("a",d)}</div></div></aside></div>`;
  }
  const tabs=[["sobre","Sobre"],["aval","Avaliações",r.length],...(nl?[["listas","Listas",nl]]:[])];
  return `${crumb}<div class="lb2"><div>${gallery(d,ph)}</div>
  <div class="hd2"><div class="title">${head(d,r)}${shortcuts(d)}</div><div class="acts">${actions("b",d)}</div></div></div>
  <div class="tabs" role="tablist">${tabs.map(([k,l,c])=>`<button role="tab" data-tab="${k}" class="${st.tab===k?"on":""}" aria-selected="${st.tab===k}">${l}${c!=null?` <span class="badge">${c}</span>`:""}</button>`).join("")}</div>
  <div class="tabp ${st.tab==="sobre"?"on":""}">${about(d)}</div>
  <div class="tabp ${st.tab==="aval"?"on":""}" id="avaliacoes">${reviews(d,r)}</div>
  ${nl?`<div class="tabp ${st.tab==="listas"?"on":""}">${listsSec().replace(/<h2>.*?<\/h2>/,"")}</div>`:""}
  <div class="abar">${can()?`<button class="cta" data-a="rate">${ic("star")}Avaliar</button>`:`<button class="cta" data-a="login">Iniciar sessão</button>`}<button class="ib" data-a="sched" aria-label="Agendar">${ic("cal")}</button><button class="ib" data-a="share" aria-label="Partilhar">${ic("share")}</button><span style="position:relative"><button class="ib" data-a="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Mais ações">${ic("more")}</button>${menu("bm")}</span></div>`;
}
let lbList=[];
function toast(t,err){const e=$("toast");e.textContent=t;e.className="toast on"+(err?" err":"");clearTimeout(toast.t);toast.t=setTimeout(()=>e.className="toast",2600)}
function openLb(i){lbList=photos(data().d,data().r);st.lb=i;showLb()}
function showLb(){const o=$("lb");o.classList.add("open");const u=lbList[st.lb];o.querySelector("img").src=src(u);o.querySelector(".ct").textContent=`${st.lb+1} / ${lbList.length}`;o.querySelectorAll(".nav2").forEach(b=>b.style.display=lbList.length>1?"grid":"none")}
function dlg(h){const e=$("dlg");e.innerHTML=`<div class="bx" role="dialog" aria-modal="true">${h}</div>`;e.classList.add("open")}
function closeDlg(){$("dlg").classList.remove("open")}
function act(a,el){
  if(a==="menu"){const m=el.parentElement.querySelector(".menu"),o=!m.classList.contains("open");document.querySelectorAll(".menu").forEach(x=>x.classList.remove("open"));m.classList.toggle("open",o);el.setAttribute("aria-expanded",o);return}
  document.querySelectorAll(".menu.open").forEach(x=>x.classList.remove("open"));
  if(a==="rate"||a==="edit"&&0){st.editing=true;if(L==="B")st.tab="aval";render();setTimeout(()=>$("form")?.scrollIntoView({behavior:"smooth",block:"center"}),30)}
  else if(a==="cancel"){st.editing=false;render()}
  else if(a==="send"){st.editing=false;render();toast("Avaliação guardada")}
  else if(a==="share"){navigator.share?navigator.share({title:data().d.name}).catch(()=>toast("Não foi possível partilhar",1)):(navigator.clipboard?.writeText(location.href).then(()=>toast("Ligação copiada"),()=>toast("Não foi possível copiar a ligação",1)))}
  else if(a==="infomore"){st.infoMore=!st.infoMore;$("moreW").classList.toggle("open",st.infoMore);el.setAttribute("aria-expanded",st.infoMore);el.firstChild.textContent=st.infoMore?"Ver menos":"Ver mais informações";el.querySelector(".ic").classList.toggle("up2",st.infoMore);el.classList.toggle("on",st.infoMore)}
  else if(a==="nav"){const d=data().d,ll=d.latitude+","+d.longitude,q=encodeURIComponent(d.location||d.name);dlg(`<h3>Como chegar</h3><p>${esc(d.name)}<br><small>${esc(d.location||ll)}</small></p><div class="apps">
    <a class="app" href="https://www.google.com/maps/dir/?api=1&destination=${ll}" target="_blank" rel="noopener" data-a="close"><i class="lg g1">G</i><span><b>Google Maps</b><small>Abre a app ou o site</small></span>${ic("chev")}</a>
    <a class="app" href="https://waze.com/ul?ll=${ll}&navigate=yes" target="_blank" rel="noopener" data-a="close"><i class="lg g2">W</i><span><b>Waze</b><small>Navegação com trânsito</small></span>${ic("chev")}</a>
    <a class="app" href="https://maps.apple.com/?daddr=${ll}&q=${q}" target="_blank" rel="noopener" data-a="close"><i class="lg g3">M</i><span><b>Apple Maps</b><small>iPhone, iPad e Mac</small></span>${ic("chev")}</a>
    <button class="app" data-a="close" data-t="Morada copiada">${ic("copy")}<span><b>Copiar morada</b><small>Para colar noutra app</small></span></button></div>
    <label class="rem"><input type="checkbox"> Lembrar a minha escolha</label><div class="two"><button class="btn" data-a="close">Cancelar</button></div>`)}
  else if(a==="sched")dlg(`<h3>Agendar refeição</h3><p>${esc(data().d.name)}</p><label>Data<span class="fld"><input type="date" value="2026-10-30"></span></label><label>Hora<span class="fld"><input type="time" value="20:00"></span></label><div class="two"><button class="btn" data-a="close">Cancelar</button><button class="cta" data-a="close" data-t="Refeição agendada">Agendar</button></div>`);
  else if(a==="save")dlg(`<h3>Guardar numa lista</h3><label>Filtrar<span class="fld">${ic("search")}<input placeholder="Procurar lista"></span></label><div class="lists" style="grid-template-columns:1fr"><a href="#" data-a="close" data-t="Guardado em «Francesinhas do Porto»">Francesinhas do Porto <small>12 locais</small></a><a href="#" data-a="close" data-t="Já está em «Jantares de sexta»">Jantares de sexta <small>já nesta lista</small></a></div><div class="two"><button class="btn" data-a="close">Fechar</button></div>`);
  else if(a==="report")dlg(`<h3>Denunciar</h3><p>Diga-nos o que está errado.</p><label>Motivo<span class="fld"><input placeholder="Descreva o problema"></span></label><div class="two"><button class="btn" data-a="close">Cancelar</button><button class="cta" data-a="close" data-t="Denúncia enviada">Enviar</button></div>`);
  else if(a==="del")dlg(`<h3>Eliminar restaurante?</h3><p>Esta ação não pode ser desfeita. As avaliações associadas também desaparecem.</p><div class="two"><button class="btn" data-a="close">Cancelar</button><button class="cta dng" data-a="close" data-t="Restaurante eliminado">Eliminar</button></div>`);
  else if(a==="delrev")dlg(`<h3>Eliminar avaliação?</h3><p>Esta ação não pode ser desfeita.</p><div class="two"><button class="btn" data-a="close">Cancelar</button><button class="cta dng" data-a="close" data-t="Avaliação eliminada">Eliminar</button></div>`);
  else if(a==="login")toast("Inicie sessão para continuar (redireciona para /auth/signin)");
  else if(a==="close"){closeDlg();if(el.dataset.t)toast(el.dataset.t)}
  if(a==="edit")toast("Abre /restaurants/"+(data().d.id.slice(0,8))+"/edit");
}
function render(){
  const b=document.body;b.dataset.view=st.view;b.dataset.role=st.role;
  $("root").innerHTML=body();
  bar.querySelectorAll("button[data-k]").forEach(x=>x.classList.toggle("on",x.dataset.k===st.view||x.dataset.k==="r:"+st.role));
  const sn=$("snap");if(sn&&L==="A"){sn.onscroll=()=>{const i=Math.round(sn.scrollLeft/sn.clientWidth);$("snapc").textContent=`${i+1} / ${sn.children.length}`}}
}
function setView(v){st.view=v;st.editing=false;render()}window.setView=setView;

const bar=document.createElement("div");bar.className="states";
VIEWS.forEach(([k,l])=>{const x=document.createElement("button");x.textContent=l;x.dataset.k=k;x.onclick=()=>setView(k);bar.append(x)});
bar.append(Object.assign(document.createElement("span"),{className:"sep"}));
ROLES.forEach(([k,l])=>{const x=document.createElement("button");x.textContent=l;x.dataset.k="r:"+k;x.onclick=()=>{st.role=k;render()};bar.append(x)});
bar.append(Object.assign(document.createElement("span"),{className:"sep"}));
const hb=document.createElement("button");hb.textContent="?review=…";hb.onclick=()=>{if(L==="B")st.tab="aval";st.hl=window.REVIEWS[1].id;render();const e=$("rv-"+st.hl);e?.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>{st.hl=null;render()},3000)};bar.append(hb);
document.body.prepend(bar);

document.addEventListener("click",e=>{
  const t=e.target.closest("[data-a],[data-lb],[data-lbm],[data-tab],[data-ex],[data-p]");
  if(!e.target.closest(".menu,[data-a=menu]"))document.querySelectorAll(".menu.open").forEach(x=>x.classList.remove("open"));
  if(!t)return;
  if(t.dataset.a){e.preventDefault();act(t.dataset.a,t)}
  else if(t.dataset.lb!=null)openLb(+t.dataset.lb);
  else if(t.dataset.lbm){lbList=[t.dataset.lbm];st.lb=0;showLb()}
  else if(t.dataset.tab){st.tab=t.dataset.tab;render()}
  else if(t.dataset.ex){st.expanded[t.dataset.ex]=!st.expanded[t.dataset.ex];render()}
  else if(t.dataset.p){t.parentElement.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i<+t.dataset.p))}
});
$("lb").onclick=e=>{if(e.target.closest(".cl")||e.target===$("lb"))$("lb").classList.remove("open");else if(e.target.closest(".nav2")){st.lb=(st.lb+(e.target.closest(".n")?1:-1)+lbList.length)%lbList.length;showLb()}};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("lb").classList.remove("open");closeDlg()}if($("lb").classList.contains("open")){if(e.key==="ArrowRight"){st.lb=(st.lb+1)%lbList.length;showLb()}if(e.key==="ArrowLeft"){st.lb=(st.lb-1+lbList.length)%lbList.length;showLb()}}});
$("totop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
addEventListener("scroll",()=>$("totop").classList.toggle("on",scrollY>600));
render();
