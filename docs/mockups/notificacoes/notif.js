/* Lógica comum dos mockups de /notifications. Tipos/cores: types/notification.ts. Nomes: BD de dev (Ana Teste, Restaurante Teste N). */
(function () {
  const I = {
    fork: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 3c-2 2-3 5-3 8h3v10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    reply: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 6 6v3"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4M4 4v4h4M4 13a8 8 0 0 0 14 4M20 20v-4h-4"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    at: '<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-4 7.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="M4 12l5 5L20 6M9 12l3 3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 0 0 4 0"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/>', map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 15h.01M12 12h.01"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
  const TYPES = {
    meal_invitation: ['Convite para refeição', '#f59e0b', 'fork'], meal_reminder: ['Lembrete de refeição', '#f97316', 'clock'],
    review_created: ['Novo review', '#eab308', 'star'], comment_reply: ['Resposta a comentário', '#3b82f6', 'reply'],
    list_invite: ['Convite para lista', '#22c55e', 'list'], list_update: ['Lista atualizada', '#14b8a6', 'refresh'],
    like: ['Gosto', '#ec4899', 'heart'], mention: ['Menção', '#a855f7', 'at'],
    system: ['Sistema', 'rgba(255,255,255,0.62)', 'info'], release: ['Novidades', '#f59e0b', 'spark'],
  };
  // Filtros corrigidos (decisão BMS 2026-11-27). review_created fica em Social (antes: filtro «Reviews»).
  const GROUPS = [
    ['all', 'Todas', null], ['unread', 'Não lidas', null],
    ['meals', 'Refeições', ['meal_invitation', 'meal_reminder']],
    ['social', 'Social', ['review_created', 'comment_reply', 'like', 'mention']],
    ['lists', 'Listas', ['list_invite', 'list_update']],
    ['system', 'Sistema', ['system', 'release']],
  ];
  const H = 3600e3, NOW = Date.now(), ago = (ms) => new Date(NOW - ms).toISOString();
  const DATA = [
    ['meal_invitation', 'Ana Teste convidou-te para jantar', 'Jantar no Restaurante Teste 2, sábado às 20h30. Já confirmaram 3 pessoas.', '/refeicoes/r1', 0, 12 * 60e3],
    ['comment_reply', 'Resposta ao teu comentário', 'Ana Teste: «Concordo com a sobremesa, mas a carta de vinhos do Restaurante Teste 5 merecia mais destaque no teu review.»', '/restaurants/r5?comment=c1', 0, 1.2 * H],
    ['like', 'Gostaram da tua lista', 'Ana Teste gostou de «Jantares de sábado à noite».', '/lists/jantares-de-sabado-a-noite', 0, 2.5 * H],
    ['meal_reminder', 'Jantar amanhã às 20h30', 'Lembrete: Restaurante Teste 2, mesa para 4.', '/refeicoes/r1', 1, 5 * H],
    ['list_invite', 'Convite para colaborar numa lista', 'Ana Teste convidou-te para editar «Para ir com os pais».', '/lists/para-ir-com-os-pais', 0, 26 * H],
    ['review_created', 'Novo review de Ana Teste', 'Restaurante Teste 4 — 4,5 estrelas: «Carta curta, tudo no ponto. O arroz de pato e a mousse de chocolate seguram a casa inteira, mesmo com a sala cheia ao sábado.»', '/restaurants/r4?review=rv1', 1, 29 * H],
    ['list_update', 'Lista atualizada', 'Foram adicionados 2 restaurantes a «Brunch de domingo».', '/lists/brunch-de-domingo', 1, 50 * H],
    ['mention', 'Foste mencionado num review', '@tu, experimenta o menu de degustação do Restaurante Teste 3.', '/restaurants/r3?review=rv2', 1, 3 * 24 * H],
    ['release', 'Novidades: mapa de listas', 'Já podes ver as tuas listas no mapa e partilhar um percurso.', '/mapa', 1, 6 * 24 * H],
    ['system', 'Preferências atualizadas', 'Alterámos o resumo semanal para domingo às 18h.', null, 1, 9 * 24 * H],
    ['meal_invitation', 'Convite para jantar de aniversário com uma lista de convidados muito longa que não cabe numa só linha de título', 'Mensagem longa de teste: ' + 'o grupo vai reunir-se no Restaurante Teste 1 para celebrar, e há menu fixo, alergias a confirmar e transporte combinado desde o centro. '.repeat(2), '/refeicoes/r9', 1, 12 * 24 * H],
  ].map((r, i) => ({ id: 'n' + i, type: r[0], title: r[1], message: r[2], link: r[3], read: !!r[4], created_at: ago(r[5]) }));

  const q = new URLSearchParams(location.search);
  let state = q.get('state') || 'default';          // default | loading | empty | unread-empty | error
  let filter = q.get('filter') || (state === 'unread-empty' ? 'unread' : 'all');
  let items = state === 'empty' || state === 'unread-empty' ? (state === 'empty' ? [] : DATA.map((n) => ({ ...n, read: true }))) : DATA.map((n) => ({ ...n }));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ago2 = (iso) => { const m = Math.round((NOW - new Date(iso)) / 6e4); if (m < 60) return `há ${m} min`; const h = Math.round(m / 60); if (h < 24) return `há ${h} h`; const d = Math.round(h / 24); return `há ${d} d`; };
  const dayLabel = (iso) => { const d = new Date(iso), t = new Date(NOW); const s = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); const diff = (s(t) - s(d)) / 864e5; return diff === 0 ? 'Hoje' : diff === 1 ? 'Ontem' : d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }); };
  const inGroup = (n, key) => key === 'all' || (key === 'unread' ? !n.read : GROUPS.find((g) => g[0] === key)[2].includes(n.type));
  const count = (key) => items.filter((n) => inGroup(n, key)).length;
  const unread = () => items.filter((n) => !n.read).length;

  const itemMenu = (n) => `<div class="more"><button type="button" aria-label="Ações da notificação" aria-haspopup="menu" aria-expanded="false" data-more="${n.id}">${svg('more')}</button>
    <div class="menu" role="menu" hidden>${n.read ? '' : `<button type="button" role="menuitem" data-read="${n.id}">${svg('check')}Marcar como lida</button>`}<button type="button" role="menuitem" class="del" data-del="${n.id}">${svg('trash')}Apagar</button></div></div>`;

  function emptyState() {
    const u = filter === 'unread';
    return `<div class="state"><img src="assets/${u ? 'tovi-a-celebrar' : 'tovi-a-dormir'}.svg" alt="" width="132" height="132"><h2>${u ? 'Tudo em dia' : 'Sem notificações'}</h2><p>${u ? 'Não tens notificações por ler.' : 'Quando alguém te convidar, comentar ou gostar, aparece aqui.'}</p>${u ? '<button class="btn" data-filter="all">Ver todas</button>' : '<a class="btn pri" href="#restaurants">Explorar restaurantes</a>'}</div>`;
  }
  const errorState = () => `<div class="state" role="alert"><img src="assets/tovi-triste.svg" alt="" width="132" height="132"><h2>Não foi possível carregar</h2><p>Verifica a ligação e tenta outra vez. As tuas notificações não se perderam.</p><button class="btn pri" data-retry>Tentar de novo</button></div>`;

  function groupsOf(list) { const g = new Map(); for (const n of list) { const k = dayLabel(n.created_at); if (!g.has(k)) g.set(k, []); g.get(k).push(n); } return [...g]; }

  window.NOTIF = {
    svg, TYPES, GROUPS, esc, ago2, count, unread, get items() { return items; }, get filter() { return filter; }, get state() { return state; },
    header(extra = '') {
      const u = unread();
      return `<a class="back" href="#restaurants">${svg('back')}Restaurantes</a>
      <div class="head"><div><h1>Notificações</h1><p>${u ? `<b>${u}</b> não ${u === 1 ? 'lida' : 'lidas'}` : 'Todas lidas'}</p></div>
      <div class="actions">${u ? `<button class="btn" data-readall>${svg('check')}Marcar todas como lidas</button>` : ''}<a class="icobtn" href="settings-notifications" aria-label="Preferências de notificações" title="Preferências de notificações">${svg('gear')}</a></div></div>${extra}`;
    },
    chips() { return `<div class="chips" role="group" aria-label="Filtrar notificações">${GROUPS.map((g) => `<button type="button" class="chip" aria-pressed="${filter === g[0]}" data-filter="${g[0]}">${g[1]}<em>${count(g[0])}</em></button>`).join('')}</div>`; },
    body(row, wrapGroup) {
      if (state === 'loading') return '<div class="list">' + '<div class="skel"></div>'.repeat(3) + '</div>';
      if (state === 'error') return errorState();
      const list = items.filter((n) => inGroup(n, filter));
      if (!list.length) return emptyState();
      return groupsOf(list).map(([label, g]) => wrapGroup(label, g.map(row).join(''))).join('');
    },
    itemMenu,
    mount(render) {
      const root = document.getElementById('app');
      const draw = () => { const open = document.querySelector('.menu:not([hidden])'); root.innerHTML = render(); if (open) {} };
      draw();
      document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-more],[data-read],[data-del],[data-filter],[data-readall],[data-retry],[data-open]');
        const menus = () => document.querySelectorAll('.menu');
        if (!t) { menus().forEach((m) => (m.hidden = true)); return; }
        if (t.dataset.more) { const m = t.nextElementSibling, was = m.hidden; menus().forEach((x) => (x.hidden = true)); m.hidden = !was; t.setAttribute('aria-expanded', String(was)); return; }
        if (t.dataset.read) items.find((n) => n.id === t.dataset.read).read = true;
        else if (t.dataset.del) items = items.filter((n) => n.id !== t.dataset.del);
        else if (t.dataset.filter) filter = t.dataset.filter;
        else if (t.hasAttribute('data-readall')) items.forEach((n) => (n.read = true));
        else if (t.hasAttribute('data-retry')) state = 'default';
        else if (t.dataset.open) { const n = items.find((x) => x.id === t.dataset.open); n.read = true; }
        draw();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.menu').forEach((m) => (m.hidden = true)); });
    },
    shell(main) {
      return `<div class="mockbar"><b>MOCKUP</b>${['default', 'loading', 'empty', 'unread-empty', 'error'].map((s) => `<a href="?state=${s}" ${state === s ? 'aria-current="page"' : ''}>${s}</a>`).join('')}<a href="a-cronologia.html${location.search}">A</a><a href="b-caixa.html${location.search}">B</a></div>
      <header class="nav"><div class="wrap"><a class="logo" href="#">Food<i>Lister</i></a><ul><li><a href="#">Restaurantes</a></li><li><a href="#">Mapa</a></li><li><a href="#">Listas</a></li></ul><a class="bell" href="#" aria-label="Notificações" aria-current="page">${svg('bell')}</a></div></header>
      <main class="page"><div class="wrap">${main}</div></main>
      <nav class="tabbar" aria-label="Principal">${[['home', 'Home'], ['fork', 'Restaurantes'], ['map', 'Mapa'], ['search', 'Pesquisa'], ['dice', 'Roleta'], ['list', 'Listas'], ['user', 'Perfil']].map((t) => `<a href="#">${svg(t[0])}${t[1]}</a>`).join('')}</nav>`;
    },
  };
})();
