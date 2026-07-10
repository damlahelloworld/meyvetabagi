// meyvetabagi — boot + shell render. Views live in views/, logic in engine.js, state in state.js.
import { S, save, applyTheme, dstr } from './state.js';
import { loadDB, totals } from './data.js';
import { rebalance } from './engine.js';
import { initSupa, signOut, online, currentUser, syncStatus } from './supa.js';
import { $, el, esc, ICON, animateCounts } from './ui.js';
import { route, setRender } from './router.js';
import { bugun } from './views/bugun.js';
import { konular } from './views/konular.js';
import { takvim } from './views/takvim.js';
import { denemeler } from './views/denemeler.js';
import { siralama } from './views/siralama.js';
import { profil } from './views/profil.js';
import { onboard } from './views/onboard.js';

const NAV = [
  { id: 'bugun', label: 'Bugün' },
  { id: 'konular', label: 'Konular' },
  { id: 'takvim', label: 'Takvim' },
  { id: 'denemeler', label: 'Denemeler' },
  { id: 'siralama', label: 'Sıralama' },
];
const VIEWS = { bugun, konular, takvim, denemeler, siralama, profil };

function renderNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  const t = totals();
  nav.appendChild(el('div', 'navsec', 'Çalışma'));
  NAV.forEach(n => {
    const a = el('a', 'nav' + (n.id === route() ? ' active' : ''));
    a.href = '#/' + n.id;
    a.innerHTML = `${ICON[n.id]}${n.label}`;
    if (n.id === 'konular') a.innerHTML += `<span class="count">%${t.greenPct}</span>`;
    if (n.id === 'bugun') { const ts = dstr(new Date()); const td = S.events.filter(x => x.date === ts && !x.done).length; if (td) a.innerHTML += `<span class="count">${td}</span>`; }
    nav.appendChild(a);
  });
  const side = $('#nav').parentElement;
  side.querySelectorAll('.usermenu').forEach(m => m.remove());
  const foot = side.querySelector('.foot');
  foot.innerHTML = '';
  const u = S.user || { name: 'Misafir' };
  const initial = (u.name || '?').trim().charAt(0).toLocaleUpperCase('tr');
  const chip = el('div', 'userchip');
  chip.innerHTML = `<span class="ava">${esc(initial)}</span><div class="ui"><b>${esc(u.name)}</b><span class="syncsub">${syncLabel()}</span></div><span class="cog">${ICON.cog}</span>`;
  foot.appendChild(chip);
  chip.onclick = () => {
    if (side.querySelector('.usermenu')) { side.querySelector('.usermenu').remove(); return; }
    const menu = el('div', 'usermenu');
    menu.innerHTML = `<button data-a="profil">${ICON.user}Profil</button>
      <button data-a="theme">${S.theme === 'dark' ? ICON.sun : ICON.moon}${S.theme === 'dark' ? 'Açık tema' : 'Koyu tema'}</button>
      <div class="sep"></div><button data-a="logout">${ICON.logout}Çıkış yap</button>`;
    side.appendChild(menu);
    menu.querySelector('[data-a="profil"]').onclick = () => { menu.remove(); location.hash = '#/profil'; };
    menu.querySelector('[data-a="theme"]').onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); menu.remove(); };
    menu.querySelector('[data-a="logout"]').onclick = async () => { menu.remove(); if (confirm(online() ? 'Çıkış yapılsın mı? Verilerin hesabında güvende.' : 'Çıkış yapılsın mı? Verilerin bu tarayıcıda kalır.')) { await signOut(); S.user = null; save(); onboard(); } };
    const close = e => { if (!menu.contains(e.target) && !chip.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  };
}

// sync indicator: local mode says Öğrenci; with an account it reflects push state (stage 11)
function syncLabel() {
  if (!online() || !currentUser()) return 'Öğrenci';
  const st = syncStatus();
  return st === 'ok' ? 'senkronize' : st === 'pending' ? 'senkron bekliyor…' : 'çevrimdışı · tekrar denenecek';
}
window.addEventListener('syncstate', () => {
  const s = document.querySelector('.userchip .syncsub');
  if (s) { s.textContent = syncLabel(); s.className = 'syncsub ' + (syncStatus() === 'error' ? 'err' : ''); }
});
// session revoked/expired elsewhere -> back to login, local copy stays (stage 13)
window.addEventListener('authgone', () => { location.hash = '#/bugun'; onboard(); });

function render() {
  applyTheme(); renderNav();
  const d = $('#detail'); d.classList.remove('wide');  // takvim re-adds it
  (VIEWS[route()] || bugun)();
}
setRender(render);

// ---- boot ----
applyTheme();
Promise.all([loadDB(), initSupa().catch(() => null)])
  .then(() => { rebalance(); render(); animateCounts(); if (!S.user) onboard(); })
  .catch(() => { $('#detail').innerHTML = '<div class="empty">Veri yüklenemedi — kökten servis et: scripts/serve.sh</div>'; });
window.addEventListener('hashchange', () => { render(); animateCounts(); });
