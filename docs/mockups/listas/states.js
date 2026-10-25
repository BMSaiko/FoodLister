/* Lógica comum dos mockups de /lists: estados, filtros, shell (navbar/tab bar/FAB), capa. Dados: data.js (BD local de dev). */
(function () {
  const I = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    alert: '<path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 15h.01M12 12h.01"/>',
    fork: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 3c-2 2-3 5-3 8h3v10"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

  const q = new URLSearchParams(location.search);
  let state = q.get('state') || 'default';
  const SEARCH = { search: 'Jantares', noresults: 'sushi' };
  const searchQuery = q.get('search') || SEARCH[state] || '';
  const admin = state === 'admin';
  let activeTag = null;

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const date = (d) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  const plural = (n) => `${n} ${n === 1 ? 'restaurante' : 'restaurantes'}`;
  const img = (p) => { const m = (p || '').match(/r(\d)\/1\.(\w+)/); return m ? `assets/r${m[1]}.${m[2]}` : null; };
  const hue = (s) => { let h = 0; for (const c of s) h = c.charCodeAt(0) + ((h << 5) - h); return Math.abs(h % 360); };

  // capa: 0-4 fotos reais; sem fotos => gradiente determinístico + inicial (como ListCardCover)
  function cover(l, cls = '') {
    const photos = (l.preview || []).map((p) => img(p.image)).filter(Boolean).slice(0, 4);
    const h = hue(l.name);
    if (!photos.length) {
      return `<div class="cover n0 ${cls}" style="background:linear-gradient(135deg,hsl(${h} 70% 15%),hsl(${(h + 60) % 360} 60% 12%) 50%,hsl(${(h + 120) % 360} 50% 10%))" role="img" aria-label="Sem fotografias"><b style="color:hsl(${h} 80% 65%)">${esc(l.name[0]).toUpperCase()}</b></div>`;
    }
    const more = l.restaurant_count - photos.length;
    return `<div class="cover n${photos.length} ${cls}">${photos.map((p, i) => `<img src="${p}" alt="" loading="lazy">`).join('')}${more > 0 ? `<span class="more">+${more}</span>` : ''}</div>`;
  }

  const initialData = () => {
    let d = window.DATA.slice();
    if (state === 'empty') return [];
    if (!admin && state !== 'private') d = d; // mantém privadas: o utilizador vê as suas
    if (searchQuery) d = d.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return d;
  };

  window.Lists = { svg, esc, date, plural, cover, state, searchQuery, admin };

  // monta a página: opts.renderGrid(lists)->html, opts.renderTags(tags, active, counts)->html, opts.skeleton()->html
  window.mountLists = function (opts) {
    const lists = initialData();
    const tagCount = {};
    lists.forEach((l) => (l.tags || []).forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
    const tags = Object.keys(tagCount);
    const states = [['default', 'normal'], ['loading', 'a carregar'], ['empty', 'vazio'], ['search', 'pesquisa'], ['noresults', 'sem resultados'], ['error', 'erro'], ['admin', 'admin']];
    const here = location.pathname.split('/').pop();
    document.body.insertAdjacentHTML('afterbegin',
      `<div class="mockbar"><b>MOCKUP ${esc(opts.label)}</b>${states.map(([k, n]) => `<a href="${here}?state=${k}"${k === state ? ' aria-current="true"' : ''}>${n}</a>`).join('')}</div>
      <header class="nav"><div class="wrap"><a class="logo" href="#">Food<i>Lister</i></a><ul><li><a href="#">Restaurantes</a></li><li><a href="#">Mapa</a></li><li><a href="#" aria-current="page">Listas</a></li><li><a href="#">Roleta</a></li></ul><span class="avatar" title="Ana Teste">AT</span></div></header>`);
    document.body.insertAdjacentHTML('beforeend',
      `<nav class="tabbar" aria-label="Navegação"><a href="#">${svg('home')}Início</a><a href="#">${svg('fork')}Sítios</a><a href="#" aria-current="page">${svg('list')}Listas</a><a href="#">${svg('map')}Mapa</a><a href="#">${svg('dice')}Roleta</a></nav>
      <a class="fab" href="#" aria-label="Criar lista">${svg('plus')}</a>`);

    const root = document.getElementById('root');
    function draw() {
      const shown = activeTag ? lists.filter((l) => (l.tags || []).includes(activeTag)) : lists;
      const title = searchQuery ? `Resultados para “${esc(searchQuery)}”` : 'As tuas listas';
      const sub = searchQuery ? `${shown.length} lista(s) encontrada(s)` : 'Organiza os teus restaurantes em listas personalizadas';
      let body;
      if (state === 'loading') body = opts.skeleton();
      else if (state === 'error') body = `<div class="state"><div class="ico">${svg('alert')}</div><h2>Não foi possível carregar as listas</h2><p>Verifica a ligação e tenta outra vez.</p><a class="btn ghost" href="${here}">Tentar de novo</a></div>`;
      else if (!shown.length) body = searchQuery
        ? `<div class="state"><div class="ico">${svg('search')}</div><h2>Sem resultados</h2><p>Não encontramos listas que correspondam a “${esc(searchQuery)}”.</p><a class="btn ghost" href="${here}">Limpar pesquisa</a></div>`
        : `<div class="state"><div class="ico">${svg('list')}</div><h2>Nenhuma lista criada</h2><p>Cria a tua primeira lista para organizar os teus restaurantes favoritos.</p><a class="btn" href="#">${svg('plus')}Criar nova lista</a></div>`;
      else body = opts.renderGrid(shown);
      const showTags = tags.length > 0 && state !== 'loading' && state !== 'error';
      root.innerHTML = opts.shell({ title, sub, body, tagsHtml: showTags ? opts.renderTags(tags, activeTag, tagCount, lists.length) : '', total: lists.length, shown: shown.length });
      root.querySelectorAll('[data-tag]').forEach((b) => b.addEventListener('click', () => {
        const t = b.dataset.tag || null;
        activeTag = t && t === activeTag ? null : t;
        draw();
      }));
    }
    draw();
  };
})();
