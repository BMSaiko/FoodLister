const R=[["Restaurante Teste 1","r1.png","4.6","€€","Porto","Portuguesa"],["Restaurante Teste 2","r2.jpeg","4.2","€","Lisboa","Pizzaria"],["Restaurante Teste 3","r3.png","4.8","€€€","Braga","Japonesa, Sushi, Fusão"],["Restaurante Teste 4","r4.png","4.0","€€","Coimbra","Grelhados"],["Restaurante Teste 5","r5.png","4.4","€","Aveiro","Vegetariana"],["Restaurante Teste 6","r1.png","","","Faro","Petiscos"]];
const LONG="Restaurante Teste 3 com um nome extraordinariamente comprido para testar o corte";
const S=[["default","Normal"],["loading","A carregar"],["error","Erro de API"],["geo","Erro de localização"],["long","Nome longo"],["nophoto","Sem foto"],["empty","Sem restaurantes"],["many","200 itens"]];
const img=f=>`style="background-image:url(../home/assets/${f})"`;
function cardHTML(r,i,st){const nm=st==="long"&&i===2?LONG:r[0];return `<article class="card"><div class="ph ${st==="nophoto"?"none":""}" ${img(r[1])}></div><div class="cb"><b title="${nm}">${nm}</b><div class="meta">${r[2]?"★ "+r[2]:"sem avaliação"} · ${r[3]||"sem preço"} · ${r[4]}</div><div class="meta">${r[5].split(", ").slice(0,3).join(" · ")}</div></div></article>`}
function render(st){
  document.body.dataset.state=st;document.body.dataset.n=st==="empty"?0:st==="many"?200:R.length;
  document.querySelectorAll(".states button").forEach(b=>b.classList.toggle("on",b.dataset.k===st));
  const n=st==="empty"?0:st==="many"?200:R.length;
  document.querySelectorAll("[data-count]").forEach(e=>e.textContent=n===0?"Sem restaurantes":`${n} ${n===1?"disponível":"disponíveis"} (filtrados de ${st==="many"?200:6})`);
  document.querySelectorAll("[data-spin]").forEach(b=>b.disabled=n===0||st==="loading"||st==="error");
  const g=document.getElementById("grid");
  if(g)g.innerHTML=st==="loading"?'<div class="sk"></div>'.repeat(6):st==="empty"?'<p class="muted">Sem restaurantes nesta fonte. Adiciona restaurantes ou muda de lista.</p>':st==="error"?'<p class="err" role="alert">Não foi possível carregar. <button class="chip">Tentar de novo</button></p>':R.slice(0,st==="many"?9:6).map((r,i)=>cardHTML(r,i,st)).join("")+(st==="many"?'<p class="muted">+191 mais</p>':"");
  document.querySelectorAll("[data-geo]").forEach(e=>e.textContent=st==="geo"?"Não foi possível obter a localização. Verifica as permissões.":"");
  if(window.onState)window.onState(st,n);
}
document.addEventListener("DOMContentLoaded",()=>{
  const b=document.createElement("div");b.className="states";
  S.forEach(([k,l])=>{const x=document.createElement("button");x.textContent=l;x.dataset.k=k;x.onclick=()=>render(k);b.append(x)});document.body.append(b);
  const v=document.createElement("button");v.className="chip vw";v.textContent="Desktop / Mobile";v.onclick=()=>{document.body.dataset.vw=document.body.dataset.vw==="m"?"d":"m"};document.body.append(v);
  document.querySelectorAll(".chip[aria-pressed]").forEach(c=>c.onclick=()=>c.setAttribute("aria-pressed",c.getAttribute("aria-pressed")!=="true"));
  render("default");
});
