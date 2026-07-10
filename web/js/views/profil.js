// Profil - identity + stats + activity heatmap ONLY (Damla, 2026-07-10: randevu comes later
// somewhere else; mesajlar & ayarlar live on their own pages).
import { S, streak, dstr } from '../state.js';
import { totals, allKaz } from '../data.js';
import { el, esc, page } from '../ui.js';
import { settingsCard } from './ayarlar.js';

// bitirdiğin kazanımlar - editoryal, dans eden renkli duvar (Damla: spiral mi dans mı süsle)
function basardiklarim() {
  const done = allKaz().filter(z => S.status[z.uid] === 'green');
  const wrap = el('div', 'basari');
  if (!done.length) { wrap.appendChild(el('div', 'empty', 'daha yeşile boyadığın kazanım yok, ilk yeşilin burada büyür ✿')); return wrap; }
  // düz akış, virgülle, renk = katı palet döngüsü (mor yasak), boyut sayfa indikçe küçülür
  const PAL = ['t-red', 't-pink', 't-orange', 't-yellow', 't-green', 't-blue', 't-teal', 't-brown'];
  wrap.style.setProperty('--n', done.length);
  done.forEach((z, i) => {
    const w = el('a', 'basarikelime ' + PAL[i % PAL.length]);
    w.href = '#/konular/' + z.uid;
    w.style.setProperty('--i', i);
    w.textContent = z.title.toLocaleLowerCase('tr');
    wrap.appendChild(w);
  });
  return wrap;
}

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
  const t = totals();
  const d = el('div', 'pagein widepage'); page(true).appendChild(d);
  d.appendChild(el('div', 'crumb', 'PROFİL'));

  // üst blok iki sütun: sol = kimlik + istatistik + aktivite, sağ = ayarlar (Damla: boşluğa ayarları koy)
  const grid = el('div', 'profgrid');
  const left = el('div', 'profcol');
  const head = el('div', 'profhead');
  head.innerHTML = `<h1 class="rainbow">${esc(u.name)}</h1>
    <p class="meta">${esc(u.target || 'Sayısal')} · YKS 2026</p>`;
  left.appendChild(head);

  const cards = el('div', 'grid cards prof');
  cards.appendChild(el('div', 'card c-teal', `<div class="k">Yeşil kazanım</div><div class="v">%${t.greenPct}<small> · ${t.green}/${t.total}</small></div>`));
  cards.appendChild(el('div', 'card c-blue', `<div class="k">Toplam çalışma</div><div class="v">${Object.values(S.activity).reduce((a, b) => a + b, 0)}</div>`));
  cards.appendChild(el('div', 'card c-pink', `<div class="k">Güncel seri</div><div class="v">${streak()}<small> gün</small></div>`));
  left.appendChild(cards);

  left.appendChild(el('div', 'seclabel', 'aktivite'));
  left.appendChild(heatmap());

  const rightc = el('div', 'profcol');
  rightc.appendChild(el('div', 'seclabel', 'ayarlar'));
  rightc.appendChild(settingsCard());

  grid.appendChild(left); grid.appendChild(rightc);
  d.appendChild(grid);

  d.appendChild(el('div', 'seclabel', 'başardığın kazanımlar'));
  d.appendChild(basardiklarim());
}
