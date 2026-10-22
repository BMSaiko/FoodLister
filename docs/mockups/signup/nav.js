(function(){
    const other="#050505";
  const veil=document.createElement("div");veil.id="veil";document.body.append(veil);
  if(location.hash==="#t"){veil.style.background=other;veil.style.transition="none";veil.classList.add("on");
    requestAnimationFrame(()=>requestAnimationFrame(()=>{veil.style.transition="";veil.classList.remove("on")}))}
  document.querySelectorAll("a[data-go]").forEach(a=>a.addEventListener("click",e=>{
    e.preventDefault();veil.style.background=other;veil.classList.add("on");
    setTimeout(()=>{location.href=a.dataset.go+"#t"},420)}));
  const t=document.getElementById("tovi");
  if(t)t.addEventListener("click",()=>{t.classList.remove("hop");void t.offsetWidth;t.classList.add("hop")});
})();
