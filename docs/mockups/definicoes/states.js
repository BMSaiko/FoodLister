const S=[["default","Normal"],["new","Perfil novo"],["error","Erro validação"],["saving","A guardar"],["saved","Guardado"],["private","Privado"],["long","Campos longos"],["loading","Loading"],["loaderr","Erro ao carregar"]];
const bar=document.createElement("div");bar.className="states";
S.forEach(([k,l])=>{const b=document.createElement("button");b.textContent=l;b.onclick=()=>set(k);b.dataset.k=k;bar.append(b)});
document.body.append(bar);
const $=id=>document.getElementById(id);
const BIO="Cozinheira amadora e caçadora de tascas. Guardo aqui o que descubro entre o Porto e Matosinhos: peixe fresco, petiscos e o melhor pão com chouriço da cidade.";
function set(k){
  document.body.dataset.state=k;
  bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
  const fresh=k==="new",long=k==="long",bad=k==="error";
  $("name").value=fresh?"":long?"Ana Beatriz Fernandes de Albuquerque e Vasconcelos Pimentel":bad?"":"Ana Ferreira";
  $("phone").value=fresh?"":"+351 912 345 678";
  $("loc").value=fresh?"":long?"Vila Nova de Gaia, Área Metropolitana do Porto, Portugal":"Porto, Portugal";
  $("web").value=fresh?"":bad?"o-meu-blog.pt":long?"https://www.diariodeumaanafaminta-e-descobertas-gastronomicas.pt/receitas/porto":"https://anaferreira.pt";
  $("bio").value=fresh?"":bad?BIO.repeat(4).slice(0,500):long?BIO.repeat(3).slice(0,500):BIO;
  $("count").textContent=$("bio").value.length+"/500";
  document.querySelectorAll(".bad").forEach(f=>f.classList.remove("bad"));
  if(bad){$("f-name").classList.add("bad");$("f-web").classList.add("bad")}
  const av=$("avatar");av.innerHTML=fresh?"A":"<img alt='' src='assets/avatar-ana.svg'>";
  $("upl").textContent=fresh?"Adicionar foto":"Alterar foto";
  $("rm")&&($("rm").style.display=fresh?"none":"");
  const st=fresh?[0,0,0]:[27,6,14];
  ["s1","s2","s3"].forEach((id,i)=>$(id).textContent=st[i]);
  const priv=k==="private";
  document.querySelectorAll("[data-priv]").forEach(o=>o.setAttribute("aria-checked",String((o.dataset.priv==="private")===priv)));
  document.querySelectorAll("input,textarea,.btn,.upl").forEach(e=>{if(!e.readOnly&&!e.closest(".states"))e.disabled=k==="saving"||k==="loading"});
  $("btnlbl").textContent=k==="saving"?"A guardar...":"Guardar";
  document.querySelectorAll("[data-view]").forEach(a=>a.style.display=priv?"none":"");
}
document.querySelectorAll("[data-priv]").forEach(o=>o.onclick=()=>set(o.dataset.priv==="private"?"private":"default"));
$("bio").addEventListener("input",()=>$("count").textContent=$("bio").value.length+"/500");
set("default");
