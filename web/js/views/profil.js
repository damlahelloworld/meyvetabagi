// Profil - identity + stats + activity heatmap ONLY (Damla, 2026-07-10: randevu comes later
// somewhere else; mesajlar & ayarlar live on their own pages).
import { S, streak, dstr } from '../state.js';
import { totals } from '../data.js';
import { el, esc, page } from '../ui.js';

function heatmap() {
  const wrap = el('div', 'heatwrap');
  const total = Object.values(S.activity).reduce((a, b) => a + b, 0);
  wrap.appendChild(el('div', 'ht', `Son 12 hafta · ${total} tamamlama · ${streak()} gün seri`));
  const grid = el('div', 'heat');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const wd = (today.getDay() + 6) % 7;
  const start = new Date(today); start.setDate(today.getDate() - wd - 11 * 7);  // 11 tam hafta + içinde bulunulan hafta = 12 sütun
  for (let dt = new Date(start); dt <= today; dt.setDate(dt.getDate() + 1)) {
    const k = dstr(dt);
    const c = S.activity[k] || 0;
    const lvl = c === 0 ? '' : c < 2 ? 'l1' : c < 4 ? 'l2' : c < 6 ? 'l3' : 'l4';
    const cell = el('i', lvl); cell.title = `${k}: ${c} tamamlama`;
    grid.appendChild(cell);
  }
  wrap.appendChild(grid);
  const leg = el('div', 'heatleg');
  leg.innerHTML = `az <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> çok`;
  wrap.appendChild(leg);
  return wrap;
}

export function profil() {
  const u = S.user || { name: 'Misafir', target: 'Sayısal' };
  const initial = (u.name || '?').trim().charAt(0).toLocaleUpperCase('tr');
  const t = totals();
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('div', 'crumb', 'PROFİL'));
  const head = el('div', 'profhead');
  head.innerHTML = `<div class="bigava">${esc(initial)}</div><div><h1>${esc(u.name)}</h1>
    <p class="meta">${esc(u.target || 'Sayısal')} · YKS 2026</p></div>`;
  d.appendChild(head);

  const cards = el('div', 'grid cards prof');
  cards.appendChild(el('div', 'card c-teal', `<div class="k">Yeşil kazanım</div><div class="v">%${t.greenPct}<small> · ${t.green}/${t.total}</small></div>`));
  cards.appendChild(el('div', 'card c-blue', `<div class="k">Toplam çalışma</div><div class="v">${Object.values(S.activity).reduce((a, b) => a + b, 0)}</div>`));
  cards.appendChild(el('div', 'card c-pink', `<div class="k">Güncel seri</div><div class="v">${streak()}<small> gün</small></div>`));
  d.appendChild(cards);

  d.appendChild(el('div', 'seclabel', 'Aktivite'));
  d.appendChild(heatmap());
}
