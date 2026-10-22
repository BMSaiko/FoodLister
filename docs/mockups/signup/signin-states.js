const S=[["default","Normal"],["checkemail","Check-email"],["error","Erro login"],["unexpected","Erro inesperado"],["loading","Loading"],["long","Campos longos"]];
const bar=document.createElement("div");bar.className="states";
S.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.onclick=()=>set(k);b.dataset.k=k;bar.append(b)});
document.body.append(bar);
function set(k){
  document.body.dataset.state=k;
  bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
  const e=document.getElementById("email"),p=document.getElementById("password"),m=document.getElementById("msg-err"),bt=document.querySelector(".btn");
  const empty=k==="default"||k==="checkemail";
  e.value=k==="long"?"nome.muito.comprido.do.restaurante.gestor+teste@subdominio.empresa-exemplo.co.uk":(empty?"":"ana@exemplo.pt");
  p.value=empty?"":"palavrapasse"+(k==="long"?"muitolongaparatestar".repeat(3):"");
  document.querySelectorAll(".field").forEach(f=>f.classList.toggle("bad",k==="error"));
  e.disabled=p.disabled=bt.disabled=k==="loading";
  m.textContent=k==="unexpected"?"Erro inesperado. Tente novamente.":"Erro ao fazer login: Invalid login credentials";
}
document.querySelectorAll(".eye").forEach(b=>b.onclick=()=>{
  const p=document.getElementById("password"),s=p.type==="password";
  p.type=s?"text":"password";b.setAttribute("aria-pressed",s);if(!b.querySelector("svg"))b.textContent=s?"Ocultar":"Ver";
});
set("default");
