const S=[["default","Normal"],["loading","A carregar"],["error","API falhou"],["auth","Autenticado"],["long","Textos longos"],["nophoto","Sem foto"],["empty","Sem restaurantes"]];
const bar=document.createElement("div");bar.className="states";
S.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.onclick=()=>set(k);b.dataset.k=k;bar.append(b)});
document.body.append(bar);
const LONG="Restaurante Teste 3 com um nome extraordinariamente comprido para testar o corte";
function set(k){
  document.body.dataset.state=k;
  bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
  document.querySelectorAll("[data-nm]").forEach(e=>e.textContent=k==="long"&&e.dataset.nm==="3"?LONG:"Restaurante Teste "+e.dataset.nm);
  document.querySelectorAll(".ph[data-img]").forEach(e=>e.classList.toggle("none",k==="nophoto"||(k==="empty")));
  const real=document.querySelectorAll("[data-real]");
  real.forEach(e=>e.hidden=(k==="error"||k==="empty"||k==="loading"));
  const e=document.getElementById("fallback");if(e)e.hidden=!(k==="error"||k==="empty"||k==="loading");
  if(window.onState)window.onState(k);
}
(function(){ // barra de scroll e Tovi
  const p=document.createElement("div");p.className="prog";document.body.prepend(p);
  const f=()=>{const h=document.documentElement;p.style.transform="scaleX("+(h.scrollTop/(h.scrollHeight-h.clientHeight||1))+")"};
  addEventListener("scroll",f,{passive:true});f();
  const t=document.querySelector(".tovi");if(t)t.addEventListener("click",()=>{t.classList.remove("hop");void t.offsetWidth;t.classList.add("hop")});
  document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{
    c.setAttribute("aria-pressed",c.getAttribute("aria-pressed")!=="true");
    const n=document.querySelectorAll(".chip[aria-pressed=true]").length,m=document.getElementById("taste-msg");
    if(m)m.textContent=n===0?"Escolhe pelo menos um sabor.":n<3?"Bom começo. Mais um ou dois e afinamos as sugestões.":"Perfil de paladar definido. Vamos encontrar o teu próximo prato.";
  });
  const veil=document.createElement("div");veil.id="veil";document.body.append(veil);
  document.querySelectorAll("a[data-go]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();veil.classList.add("on");setTimeout(()=>{location.href=a.dataset.go},420)}));
})();
set("default");
