// meyvetabagi — boot + topbar shell render. Views live in views/, logic in engine.js, state in state.js.
import { S, save, applyTheme, dstr } from './state.js';
import { loadDB, totals } from './data.js';
import { rebalance } from './engine.js';
import { initSupa, signOut, online, currentUser, syncStatus } from './supa.js';
import { $, el, esc, ICON, animateCounts, setChips } from './ui.js';
import { route, setRender } from './router.js';
import { bugun } from './views/bugun.js';
import { konular } from './views/konular.js';
import { takvim } from './views/takvim.js';
import { denemeler } from './views/denemeler.js';
import { siralama } from './views/siralama.js';
import { profil } from './views/profil.js';
import { onboard } from './views/onboard.js';

const NAV = [
  { id: 'bugun', label: 'bugün' },
  { id: 'konular', label: 'konular' },
  { id: 'takvim', label: 'takvim' },
  { id: 'denemeler', label: 'denemeler' },
  { id: 'siralama', label: 'sıra puanı' },
];
const VIEWS = { bugun, konular, takvim, denemeler, siralama, profil };

// sync indicator: local mode says Öğrenci; with an account it reflects push state
function syncLabel() {
  if (!online() || !currentUser()) return 'Öğrenci';
  const st = syncStatus();
  return st === 'ok' ? 'senkronize' : st === 'pending' ? 'senkron bekliyor…' : 'çevrimdışı · tekrar denenecek';
}
window.addEventListener('syncstate', () => {
  const s = document.querySelector('.userchip .syncsub');
  if (s) { s.textContent = syncLabel(); s.className = 'syncsub ' + (syncStatus() === 'error' ? 'err' : ''); }
});
// session revoked/expired elsewhere -> back to login, local copy stays
window.addEventListener('authgone', () => { location.hash = '#/bugun'; onboard(); });

function renderBar() {
  const nav = $('#nav'); nav.innerHTML = '';
  const t = totals();
  NAV.forEach(n => {
    const a = el('a', 'nav' + (n.id === route() ? ' active' : ''));
    a.href = '#/' + n.id;
    a.textContent = n.label;
    if (n.id === 'konular') a.innerHTML += `<span class="count">%${t.greenPct}</span>`;
    if (n.id === 'bugun') { const ts = dstr(new Date()); const td = S.events.filter(x => x.date === ts && !x.done).length; if (td) a.innerHTML += `<span class="count">${td}</span>`; }
    nav.appendChild(a);
  });
  const slot = $('#userslot'); slot.innerHTML = '';
  const u = S.user || { name: 'Misafir' };
  const initial = (u.name || '?').trim().charAt(0).toLocaleUpperCase('tr');
  const chip = el('div', 'userchip' + (route() === 'profil' ? ' active' : ''));
  chip.innerHTML = `<span class="ava">${esc(initial)}</span><div class="ui"><b>${esc(u.name)}</b><span class="syncsub">${syncLabel()}</span></div>`;
  slot.appendChild(chip);
  chip.onclick = () => {
    const old = slot.querySelector('.usermenu');
    if (old) { old.remove(); return; }
    const menu = el('div', 'usermenu');
    menu.innerHTML = `<button data-a="profil">${ICON.user}Profil</button>
      <button data-a="theme">${S.theme === 'dark' ? ICON.sun : ICON.moon}${S.theme === 'dark' ? 'Açık tema' : 'Koyu tema'}</button>
      <div class="sep"></div><button data-a="logout">${ICON.logout}Çıkış yap</button>`;
    slot.appendChild(menu);
    menu.querySelector('[data-a="profil"]').onclick = () => { menu.remove(); location.hash = '#/profil'; };
    menu.querySelector('[data-a="theme"]').onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); menu.remove(); };
    menu.querySelector('[data-a="logout"]').onclick = async () => { menu.remove(); if (confirm(online() ? 'Çıkış yapılsın mı? Verilerin hesabında güvende.' : 'Çıkış yapılsın mı? Verilerin bu tarayıcıda kalır.')) { await signOut(); S.user = null; save(); onboard(); } };
    const close = e => { if (!menu.contains(e.target) && !chip.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  };
}

function render() {
  applyTheme(); renderBar(); setChips(null);
  (VIEWS[route()] || bugun)();
}
setRender(render);

// ---- boot ----
applyTheme();
Promise.all([loadDB(), initSupa().catch(() => null)])
  .then(() => { rebalance(); render(); animateCounts(); if (!S.user) onboard(); })
  .catch(err => {
    console.error('boot error:', err);
    $('#page').innerHTML = `<div class="empty">Bir şeyler ters gitti: ${(err && err.message) || err}</div>`;
  });
window.addEventListener('hashchange', () => { render(); animateCounts(); });
