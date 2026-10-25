// Lógica partilhada pelas 2 direções. Pins posicionados com as coordenadas reais (projeção linear da caixa).
(function () {
  var R = window.RESTS, W = R.filter(function (r) { return r.lat != null; }), NC = R.filter(function (r) { return r.lat == null; });
  var la = W.map(function (r) { return r.lat; }), ln = W.map(function (r) { return r.lng; });
  var mn = Math.min.apply(null, la), mx = Math.max.apply(null, la), nl = Math.min.apply(null, ln), xl = Math.max.apply(null, ln);
  function pos(r) { return { x: 12 + 76 * (r.lng - nl) / (xl - nl), y: 20 + 62 * (1 - (r.lat - mn) / (mx - mn)) }; }
  var st = { sel: null, q: "", near: false, radius: 10, view: "ok", zoom: 1, sheet: "closed" };
  var body = document.body;
  // Ícones do projeto (components/ui/icons/Ico.tsx: traço 1.6, 24x24). "x", "locate", "chevron" são propostas novas no mesmo traço.
  var PATHS = {
    fork: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 21V3c-2.5 1.5-3 5-3 8h3"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', locate: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    chevron: '<path d="m6 15 6-6 6 6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function ico(n, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 18) + '" height="' + (s || 18) + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PATHS[n] + '</svg>'; }
  var ICON = ico('fork');
  document.querySelectorAll("[data-ico]").forEach(function (e) { e.innerHTML = ico(e.dataset.ico, +e.dataset.s || 18); });
  function star(r) { return r.rating == null ? '<span class="rt none">sem avaliações</span>' : '<span class="rt">' + ico('star', 13) + ' ' + r.rating.toFixed(1) + '</span>'; }
  function filt() {
    var q = st.q.toLowerCase();
    var l = W.filter(function (r) { return !q || (r.name + " " + r.loc).toLowerCase().indexOf(q) >= 0; });
    if (st.near) l = l.filter(function (r) { return r.lat < 41.195; });
    return l;
  }
  function render() {
    var l = filt(), map = document.getElementById("map");
    map.querySelectorAll(".pin,.cl,.pop,.me").forEach(function (e) { e.remove(); });
    if (st.near) { var m = document.createElement("div"); m.className = "me"; m.style.left = "38%"; m.style.top = "70%"; map.appendChild(m); }
    var groups = [];
    l.forEach(function (r) {
      var p = pos(r), g = st.zoom < 1 && st.sel !== r.id ? groups.filter(function (x) { return Math.abs(x.x - p.x) < 14 && Math.abs(x.y - p.y) < 14; })[0] : null;
      if (g) { g.items.push(r); g.x = (g.x * (g.items.length - 1) + p.x) / g.items.length; g.y = (g.y * (g.items.length - 1) + p.y) / g.items.length; }
      else groups.push({ x: p.x, y: p.y, items: [r] });
    });
    groups.forEach(function (g) {
      var b = document.createElement("button"), r = g.items[0];
      b.style.left = g.x + "%"; b.style.top = g.y + "%";
      if (g.items.length > 1) {
        b.className = "cl"; b.textContent = g.items.length; b.setAttribute("aria-label", g.items.length + " restaurantes, aproximar");
        b.onclick = function () { st.zoom = 1; render(); };
      } else {
        b.className = "pin" + (st.sel === r.id ? " on" : r.rating == null ? " none" : r.rating >= 4.5 ? " top" : "");
        b.setAttribute("aria-label", r.name + (r.rating == null ? ", sem avaliações" : ", " + r.rating.toFixed(1) + " estrelas"));
        b.innerHTML = "<i>" + ico(st.sel === r.id || r.rating >= 4.5 ? "star" : "fork", 14) + "</i>";
        b.onclick = function () { st.sel = st.sel === r.id ? null : r.id; render(); };
      }
      map.appendChild(b);
    });
    var s = W.filter(function (r) { return r.id === st.sel; })[0];
    if (s && l.indexOf(s) >= 0) {
      var p = pos(s), d = document.createElement("div");
      d.className = "pop";
      d.style.left = "clamp(8px,calc(" + p.x + "% - 120px),calc(100% - 248px))";
      d.style.top = "max(70px,calc(" + p.y + "% - 160px))";
      d.innerHTML = "<h4>" + s.name + "</h4><p>" + s.loc + " · " + star(s) + '</p><a class="btn" style="width:100%" href="#">Explorar</a><button class="btn ghost" style="width:100%;margin-top:6px" data-act="reset">Fechar</button>';
      map.appendChild(d);
    }
    body.dataset.view = st.view === "ok" && !l.length ? "empty" : st.view;
    body.classList.toggle("near", st.near);
    document.querySelectorAll("[data-count]").forEach(function (e) { e.textContent = l.length; });
    document.querySelectorAll("[data-list]").forEach(function (e) {
      e.innerHTML = l.map(function (r) {
        return '<button class="item' + (st.sel === r.id ? " on" : "") + '" data-id="' + r.id + '"><span class="ic">' + ICON + '</span><span class="t"><b>' + r.name + "</b><span>" + r.loc + "</span></span>" + star(r) + "</button>";
      }).join("") || '<p class="note">Nenhum resultado.</p>';
      e.querySelectorAll(".item").forEach(function (b) { b.onclick = function () { st.sel = b.dataset.id; setSheet("closed"); render(); };
        b.onkeydown = function (ev) { var n = ev.key === "ArrowDown" ? b.nextElementSibling : ev.key === "ArrowUp" ? b.previousElementSibling : null; if (n && n.focus) { ev.preventDefault(); n.focus(); } };
      });
    });
    document.querySelectorAll("[data-ncn]").forEach(function (e) { e.textContent = NC.length; });
    document.querySelectorAll("[data-nc]").forEach(function (e) { e.innerHTML = NC.length + ' restaurantes sem coordenadas — <a href="#">ver lista completa</a>'; });
  }
  document.addEventListener("input", function (e) { if (e.target.matches("[data-q]")) { st.q = e.target.value; render(); } });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]"); if (!t) return;
    var a = t.dataset.act;
    if (a === "frame") { document.querySelector(".frame").classList.toggle("m", t.dataset.v === "m"); document.querySelectorAll("[data-act=frame]").forEach(function (b) { b.classList.toggle("on", b === t); }); }
    if (a === "view") { st.view = t.dataset.v; document.querySelectorAll("[data-act=view]").forEach(function (b) { b.classList.toggle("on", b === t); }); render(); }
    if (a === "near") { st.near = !st.near; render(); }
    if (a === "radius") { st.radius = +t.dataset.v; document.querySelectorAll("[data-act=radius]").forEach(function (b) { b.classList.toggle("on", b === t); }); }
    if (a === "clear") { st.q = ""; document.querySelectorAll("[data-q]").forEach(function (i) { i.value = ""; }); render(); }
    if (a === "sheet" && !drag.moved) setSheet(st.sheet === "closed" ? "half" : st.sheet === "half" ? "full" : "closed");
    if (a === "nc") { setSheet("full"); var w = document.querySelector(".sheet .warn"); if (w) w.scrollIntoView({ block: "end" }); }
    if (a === "zin") { st.zoom = 1; render(); }
    if (a === "zout") { st.zoom = 0.5; render(); }
    if (a === "reset") { st.sel = null; render(); }
  });
  var drag = { y: 0, moved: false };
  function setSheet(h) { st.sheet = h; document.querySelectorAll(".sheet").forEach(function (s) { s.dataset.h = h; }); }
  document.addEventListener("pointerdown", function (e) { var g = e.target.closest(".grab"); if (g) { drag.y = e.clientY; drag.moved = false; drag.g = g; } });
  document.addEventListener("pointerup", function (e) {
    if (!drag.g) return; var d = e.clientY - drag.y; drag.g = null;
    if (Math.abs(d) > 24) { drag.moved = true; var o = ["closed", "half", "full"], i = o.indexOf(st.sheet); setSheet(o[Math.max(0, Math.min(2, i + (d < 0 ? 1 : -1)))]); setTimeout(function () { drag.moved = false; }, 0); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !e.target.matches("input")) { e.preventDefault(); document.querySelector("[data-q]").focus(); }
    if (e.key === "Escape") { if (st.sel) { st.sel = null; render(); } else setSheet("closed"); }
  });
  document.addEventListener("DOMContentLoaded", render);
})();
