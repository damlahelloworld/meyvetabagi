// Takvim — real MONTH grid + konu havuzu sidebar (iwantmymtv referansı, Damla 2026-07-10).
// Havuzdan kazanımı bir güne SÜRÜKLE ya da güne tıklayıp havuzdan dokun ile koy. Gün kartındaki
// kazanıma tıkla = yapıldı, × = kaldır. Kazanım güne konur (saat kavramı yok).
import { S, save, bump, unbump, dstr } from '../state.js';
import { DB, allKaz, findKaz } from '../data.js';
import { el, esc, norm, ICON, WD_SHORT, MON_LONG, page, dersColor } from '../ui.js';
import { refresh } from '../router.js';

const POOLFILT = { q: '', ders: 'all', sinif: 'all' };
let VIEW = null;   // {y, m} — görüntülenen ay
let SEL_DAY = null;

function addToDay(code, ds) {
  S.events.push({ id: 'e' + Date.now() + Math.floor(Math.random() * 999), date: ds, h: null, code, author: 'student', done: false });
  save(); refresh();
}
function dayEvents(ds) { return S.events.filter(x => x.date === ds); }

export function takvim() {
  const today = new Date(); const tstr = dstr(today);
  if (!VIEW) VIEW = { y: today.getFullYear(), m: today.getMonth() };
  if (!SEL_DAY) SEL_DAY = tstr;

  const shell = el('div', 'pagein widepage'); page(true).appendChild(shell);
  const grid2 = el('div', 'calwrap'); shell.appendChild(grid2);
  const main = el('div', 'calmain'); grid2.appendChild(main);
  const side = el('div', 'calside'); grid2.appendChild(side);

  const bar = el('div', 'monthbar');
  bar.innerHTML = `<h1><b>${MON_LONG[VIEW.m]}</b> <span class="yr">${VIEW.y}</span></h1>
    <div class="mnav"><button id="mtoday">bugün</button><button id="mprev">‹</button><button id="mnext">›</button></div>`;
  bar.querySelector('#mprev').onclick = () => { VIEW.m--; if (VIEW.m < 0) { VIEW.m = 11; VIEW.y--; } refresh(); };
  bar.querySelector('#mnext').onclick = () => { VIEW.m++; if (VIEW.m > 11) { VIEW.m = 0; VIEW.y++; } refresh(); };
  bar.querySelector('#mtoday').onclick = () => { VIEW = { y: today.getFullYear(), m: today.getMonth() }; SEL_DAY = tstr; refresh(); };
  main.appendChild(bar);

  const head = el('div', 'calgrid calhead');
  WD_SHORT.forEach(w => head.appendChild(el('div', 'wd', w.toLocaleLowerCase('tr'))));
  main.appendChild(head);

  const grid = el('div', 'calgrid calbody');
  const first = new Date(VIEW.y, VIEW.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(VIEW.y, VIEW.m, 1 - lead);
  for (let i = 0; i < 42; i++) {
    const dt = new Date(start); dt.setDate(start.getDate() + i);
    const ds = dstr(dt);
    const other = dt.getMonth() !== VIEW.m;
    const cell = el('div', 'dcell' + (other ? ' other' : '') + (ds === tstr ? ' today' : '') + (ds === SEL_DAY ? ' sel' : ''));
    const num = el('div', 'dnum', String(dt.getDate()));
    if (ds === tstr) { num.title = 'bugüne git'; num.onclick = e => { e.stopPropagation(); location.hash = '#/bugun'; }; }  // bugüne tıkla → bugün sayfası
    cell.appendChild(num);
    const evs = dayEvents(ds);
    evs.slice(0, 3).forEach(ev => cell.appendChild(evChip(ev)));
    if (evs.length > 3) cell.appendChild(el('div', 'dmore', `+${evs.length - 3} daha`));
    cell.onclick = e => { if (e.target.closest('.echip')) return; SEL_DAY = ds; refresh(); };
    cell.ondragover = e => { e.preventDefault(); cell.classList.add('over'); };
    cell.ondragleave = () => cell.classList.remove('over');
    cell.ondrop = e => {
      e.preventDefault(); cell.classList.remove('over');
      const data = e.dataTransfer.getData('text/plain');
      if (data.startsWith('pool:')) { addToDay(data.slice(5), ds); return; }
      if (data.startsWith('move:')) { const ev = S.events.find(x => x.id === data.slice(5)); if (ev) { ev.date = ds; save(); } refresh(); }
    };
    grid.appendChild(cell);
  }
  main.appendChild(grid);

  const parts = SEL_DAY.split('-').map(Number);
  const selLbl = `${parts[2]} ${MON_LONG[parts[1] - 1]}`;

  // seçili günün konuları — güne tıklayınca yanda görünür
  const selEvs = dayEvents(SEL_DAY);
  const box = el('div', 'seldaybox');
  box.appendChild(el('h4', null, `${esc(selLbl)}${SEL_DAY === tstr ? ' · bugün' : ''}`));
  if (!selEvs.length) box.appendChild(el('div', 'seldayempty', 'bu güne konu eklenmedi'));
  selEvs.forEach(ev => {
    const z = findKaz(ev.code);
    const row = el('div', 'seldayrow' + (ev.done ? ' done' : ''));
    row.innerHTML = `<span class="st2">${esc(z ? z.title : ev.code)}</span><button class="dn">${ev.done ? '↺' : '✓'}</button><button class="dx">×</button>`;
    row.querySelector('.st2').onclick = () => { if (z) location.hash = '#/konular/' + z.uid; };
    row.querySelector('.dn').onclick = () => { ev.done = !ev.done; ev.done ? bump() : unbump(); save(); refresh(); };
    row.querySelector('.dx').onclick = () => { S.events = S.events.filter(x => x.id !== ev.id); save(); refresh(); };
    box.appendChild(row);
  });
  side.appendChild(box);

  side.appendChild(el('div', 'sidehead', 'konu havuzu'));
  side.appendChild(el('div', 'sidesub', `dokun → <b>${esc(selLbl)}</b> gününe eklenir · ya da güne sürükle`));

  const tools = el('div', 'tools');
  tools.innerHTML = `<div class="search${POOLFILT.q ? ' has' : ''}"><span class="mag">${ICON.mag}</span>
    <input placeholder="ara…" value="${esc(POOLFILT.q)}"><span class="clr">×</span></div>
    <div class="chips" data-grp="ders">
      <button class="chip${POOLFILT.ders === 'all' ? ' on' : ''}" data-v="all">tümü</button>
      ${DB.dersler.map(x => `<button class="chip dersc dc-${dersColor(x.ders)}${POOLFILT.ders === x.ders ? ' on' : ''}" data-v="${esc(x.ders)}">${esc(x.ders.split(' ')[0].toLocaleLowerCase('tr'))}</button>`).join('')}
    </div>
    <div class="chips gap-top" data-grp="sinif">
      <button class="chip${POOLFILT.sinif === 'all' ? ' on' : ''}" data-v="all">tüm sınıflar</button>
      ${['9', '10', '11', '12'].map(g => `<button class="chip${POOLFILT.sinif === g ? ' on' : ''}" data-v="${g}">${g}</button>`).join('')}
    </div>`;
  side.appendChild(tools);
  const list = el('div', 'list pool'); side.appendChild(list);
  function paintPool() {
    list.innerHTML = '';
    let n = 0, total = 0;
    allKaz().forEach(z => {
      const st = S.status[z.uid] || 'none';
      if (POOLFILT.ders !== 'all' && z.ders.ders !== POOLFILT.ders) return;
      if (POOLFILT.sinif !== 'all' && String(z.unit && z.unit.grade) !== POOLFILT.sinif) return;
      if (POOLFILT.q && !norm(z.title).includes(norm(POOLFILT.q)) && !z.code.includes(POOLFILT.q)) return;
      total++; if (n++ > 50) return;
      const row = el('div', 'prow2'); row.draggable = true;
      row.innerHTML = `<span class="pcode cst-${st}">${z.code}</span><span class="ptitle">${esc(z.title)}</span>`;
      row.ondragstart = e => { e.dataTransfer.setData('text/plain', 'pool:' + z.uid); e.dataTransfer.effectAllowed = 'copy'; row.classList.add('dragging'); };
      row.ondragend = () => row.classList.remove('dragging');
      row.onclick = () => addToDay(z.uid, SEL_DAY);
      list.appendChild(row);
    });
    if (total > 50) list.appendChild(el('div', 'hint', `${total} kazanım · aramayla daralt`));
    if (!total) list.appendChild(el('div', 'empty', 'eşleşen yok'));
  }
  tools.querySelector('input').oninput = e => { POOLFILT.q = e.target.value; tools.querySelector('.search').classList.toggle('has', !!POOLFILT.q); paintPool(); };
  tools.querySelector('.clr').onclick = () => { POOLFILT.q = ''; refresh(); };
  tools.querySelector('[data-grp="ders"]').querySelectorAll('.chip').forEach(c => c.onclick = () => { POOLFILT.ders = c.dataset.v; refresh(); });
  tools.querySelector('[data-grp="sinif"]').querySelectorAll('.chip').forEach(c => c.onclick = () => { POOLFILT.sinif = c.dataset.v; refresh(); });
  paintPool();
}

function evChip(ev) {
  const z = findKaz(ev.code);
  const c = el('div', 'echip' + (ev.done ? ' done' : '')); c.draggable = true;
  c.innerHTML = `<span class="et">${esc(z ? z.title : ev.code)}</span><span class="ex">×</span>`;
  c.title = (z ? z.title : ev.code) + (ev.done ? ' · yapıldı' : '');
  c.ondragstart = e => { e.stopPropagation(); e.dataTransfer.setData('text/plain', 'move:' + ev.id); e.dataTransfer.effectAllowed = 'move'; };
  c.onclick = e => { e.stopPropagation(); if (e.target.closest('.ex')) return; ev.done = !ev.done; ev.done ? bump() : unbump(); save(); refresh(); };
  c.querySelector('.ex').onclick = e => { e.stopPropagation(); S.events = S.events.filter(x => x.id !== ev.id); save(); refresh(); };
  return c;
}
