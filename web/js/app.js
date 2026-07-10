// meyvetabagi — boot + topbar shell render. Views live in views/, logic in engine.js, state in state.js.
import { S, save, applyTheme, dstr } from './state.js';
import { loadDB, totals } from './data.js';
import { rebalance } from './engine.js';
import { initSupa, signOut, online, currentUser, syncStatus } from './supa.js';
import { $, el, esc, ICON, animateCounts, setChips } from './ui.js';
import { route, setRender } from './router.js';
import { initGlyphs } from './glyphs.js';
import { bugun } from './views/bugun.js';
import { konular } from './views/konular.js';
import { takvim } from './views/takvim.js';
import { profil } from './views/profil.js';
import { mesajlar } from './views/mesajlar.js';
import { ayarlar } from './views/ayarlar.js';
import { kaynakca } from './views/kaynakca.js';
import { onboard } from './views/onboard.js';

// deneme mechanic REMOVED from UI (Damla, 2026-07-10: "konuşmadık henüz") — data stays in state/DB
// amme hizmeti aracı (gymgyme/calicocat gibi) — yarış/sıralama YOK (Damla, 2026-07-10)
const NAV = [
  { id: 'bugun', label: 'bugün' },
  { id: 'konular', label: 'konular' },
  { id: 'takvim', label: 'takvim' },
];
const VIEWS = { bugun, konular, takvim, profil, mesajlar, ayarlar, kaynakca };

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
  chip.innerHTML = `<div class="ui"><b class="uname">${esc((u.name || '').toLocaleLowerCase('tr'))}</b></div>`;
  slot.appendChild(chip);
  chip.onclick = () => {
    const old = slot.querySelector('.usermenu');
    if (old) { old.remove(); return; }
    const menu = el('div', 'usermenu');
    // mesajlaşma yok → Mesajlar & Çıkış menüden kalktı (Damla). Çıkış Ayarlar'da.
    menu.innerHTML = `<button data-a="profil">${ICON.user}Profil</button>
      <button data-a="ayarlar">${ICON.cog}Ayarlar</button>`;
    slot.appendChild(menu);
    menu.querySelector('[data-a="profil"]').onclick = () => { menu.remove(); location.hash = '#/profil'; };
    menu.querySelector('[data-a="ayarlar"]').onclick = () => { menu.remove(); location.hash = '#/ayarlar'; };
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
initGlyphs();
Promise.all([loadDB(), initSupa().catch(() => null)])
  .then(() => { rebalance(); render(); animateCounts(); if (!S.user) onboard(); })
  .catch(err => {
    console.error('boot error:', err);
    $('#page').innerHTML = `<div class="empty">Bir şeyler ters gitti: ${(err && err.message) || err}</div>`;
  });
window.addEventListener('hashchange', () => { render(); animateCounts(); });
