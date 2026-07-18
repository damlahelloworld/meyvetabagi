// inkbee - boot + topbar shell render. Views live in views/, logic in engine.js, state in state.js.
import { S, save, applyTheme, dstr } from './state.js';
import { loadDB, totals, findKaz } from './data.js';
import { rebalance } from './engine.js';
import { initSupa, signOut, online, currentUser, syncStatus } from './supa.js';
import { $, el, esc, animateCounts, setChips } from './ui.js';
import { route, setRender, param } from './router.js';
import { initGlyphs } from './glyphs.js';
import { bugun } from './views/bugun.js';
import { konular } from './views/konular.js';
import { takvim } from './views/takvim.js';
import { profil } from './views/profil.js';
import { mesajlar } from './views/mesajlar.js';
import { ayarlar } from './views/ayarlar.js';
import { kaynakca } from './views/kaynakca.js';
import { onboard } from './views/onboard.js';

// deneme mechanic REMOVED from UI (Damla, 2026-07-10: "konuşmadık henüz") - data stays in state/DB
// amme hizmeti aracı (gymgyme/calicocat gibi) - yarış/sıralama YOK (Damla, 2026-07-10)
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
  const chip = el('div', 'userchip' + (route() === 'profil' ? ' active' : ''));
  chip.innerHTML = `<div class="ui"><b class="uname">${esc((u.name || '').toLocaleLowerCase('tr'))}</b></div>`;
  slot.appendChild(chip);
  // profil + ayarlar birleşti (Damla): isme tıkla → doğrudan profil, hover menüsü yok
  chip.onclick = () => { location.hash = '#/profil'; };
}

// SEO: her sayfa/kazanım için anlamlı <title> (paylaşım + tarayıcı geçmişi + arama)
function seoTitle() {
  const r = route(), p = param();
  if (r === 'konular' && p) {
    const z = findKazSeo(p);
    if (z) return `${z.title} - ${z.ders.ders} ${z.code} - inkbee`;
  }
  const map = { bugun: 'Bugün', konular: 'Konular - 954 MEB kazanımı', takvim: 'Takvim', profil: 'Profil', ayarlar: 'Ayarlar', kaynakca: 'Kaynakça' };
  return `${map[r] || 'inkbee'} - inkbee`;
}
function findKazSeo(uid) { try { return findKaz(uid); } catch { return null; } }

function render() {
  applyTheme(); renderBar(); setChips(null);
  (VIEWS[route()] || bugun)();
  document.title = seoTitle();
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
