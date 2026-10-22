const S=[["default","Normal"],["short","Mínimo 6"],["mismatch","Passwords diferentes"],["error","Erro ao criar"],["unexpected","Erro inesperado"],["loading","Loading"],["long","Campos longos"]];
const bar=document.createElement("div");bar.className="states";
S.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.onclick=()=>set(k);b.dataset.k=k;bar.append(b)});
document.body.append(bar);
function set(k){
  document.body.dataset.state=k;
  bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
  const $=id=>document.getElementById(id),e=$("email"),p=$("password"),c=$("confirmPassword"),m=$("msg-err"),f=$("form-error"),bt=document.querySelector(".btn"),mt=document.querySelector(".meter");
  const long=k==="long",empty=k==="default";
  e.value=long?"nome.muito.comprido.do.restaurante.gestor+teste@subdominio.empresa-exemplo.co.uk":(empty?"":"ana@exemplo.pt");
  p.value=empty?"":k==="short"?"abc":"palavrapasse"+(long?"muitolongaparatestar".repeat(3):"");
  c.value=empty?"":k==="short"?"abc":k==="mismatch"?"palavrapasse2":p.value;
  mt.dataset.n=empty?0:k==="short"?1:p.value.length>=12?3:2;
  document.querySelectorAll(".field").forEach(x=>x.classList.remove("bad"));
  if(k==="short")p.closest(".field").classList.add("bad");
  if(k==="mismatch")c.closest(".field").classList.add("bad");
  p.setAttribute("aria-invalid",k==="short");c.setAttribute("aria-invalid",k==="mismatch");
  f.textContent="";
  e.disabled=p.disabled=c.disabled=bt.disabled=k==="loading";
  m.textContent=k==="unexpected"?"Erro inesperado. Tente novamente.":"Erro ao criar conta: User already registered";
}
document.querySelectorAll(".eye").forEach(b=>b.onclick=()=>{
  const p=b.parentElement.querySelector("input"),s=p.type==="password",w=p.id==="password"?"password":"confirmação";
  p.type=s?"text":"password";b.setAttribute("aria-pressed",s);b.setAttribute("aria-label",(s?"Ocultar ":"Mostrar ")+w);
});
(function(){
  const $=id=>document.getElementById(id),p=$("password"),c=$("confirmPassword"),mt=document.querySelector(".meter");
  const lvl=v=>!v?0:v.length<6?1:v.length>=12?3:2;
  const chk=(inp,bad)=>{inp.closest(".field").classList.toggle("bad",bad);inp.setAttribute("aria-invalid",bad)};
  p.addEventListener("input",()=>{mt.dataset.n=lvl(p.value);if(p.closest(".field").classList.contains("bad")&&p.value.length>=6)chk(p,false)});
  p.addEventListener("blur",()=>{if(p.value)chk(p,p.value.length<6)});
  c.addEventListener("blur",()=>{if(c.value)chk(c,c.value!==p.value)});
  c.addEventListener("input",()=>{if(c.closest(".field").classList.contains("bad")&&c.value===p.value)chk(c,false)});
})();
set("default");
