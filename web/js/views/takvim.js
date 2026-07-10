// Takvim — drag-drop week calendar (real dates, prev/next week) + kazanım pool.
import { S, save, bump, unbump, dstr } from '../state.js';
import { DB, allKaz, findKaz } from '../data.js';
import { $, el, esc, norm, ICON, WD_SHORT, MON_SHORT, HOURS, weekDates, setMid, dersDot } from '../ui.js';
import { refresh } from '../router.js';

const POOLFILT = { q: '', ders: 'all', only: false };
let WEEK_OFFSET = 0;

// add to first free slot (today onward, 9-21, past hours skipped)
function addToNextSlot(code) {
  const now = new Date();
  const busy = new Set(S.events.map(e => e.date + '@' + e.h));
  for (let d = 0; d < 60; d++) {
    const dt = new Date(); dt.setHours(0, 0, 0, 0); dt.setDate(dt.getDate() + d);
    const ds = dstr(dt);
    for (let h = 9; h <= 21; h += 2) {
      if (d === 0 && h <= now.getHours()) continue;
      if (busy.has(ds + '@' + h)) continue;
      S.events.push({ id: 'e' + Date.now(), date: ds, h, code, author: 'student', done: false });
      save(); refresh();
      return;
    }
  }
}

export function takvim() {
  const mid = $('#mid');
  const t = mid.querySelector('.tools'); if (t) t.remove();
  mid.querySelector('.head').innerHTML = `<h2>Kazanım havuzu</h2><p>Sürükleyip takvime bırak</p>`;
  const tools = el('div', 'tools');
  tools.innerHTML = `<div class="search${POOLFILT.q ? ' has' : ''}"><span class="mag">${ICON.mag}</span>
    <input placeholder="Havuzda ara…" value="${esc(POOLFILT.q)}"><span class="clr">×</span></div>
    <div class="chips" data-grp="ders">
      <button class="chip${POOLFILT.ders === 'all' ? ' on' : ''}" data-v="all">Tümü</button>
      ${DB.dersler.map(x => `<button class="chip${POOLFILT.ders === x.ders ? ' on' : ''}" data-v="${esc(x.ders)}">${dersDot(x.ders)}${esc(x.ders.split(' ')[0])}</button>`).join('')}
    </div>
    <div class="chips gap-top">
      <button class="chip${POOLFILT.only ? ' on' : ''}" id="onlyred">Sadece çalışılmamış</button>
    </div>`;
  mid.insertBefore(tools, mid.querySelector('.list'));
  const list = mid.querySelector('.list'); list.className = 'list pool';
  function paintPool() {
    list.innerHTML = '';
    let n = 0, total = 0;
    allKaz().forEach(z => {
      const st = S.status[z.uid] || 'none';
      if (POOLFILT.ders !== 'all' && z.ders.ders !== POOLFILT.ders) return;
      if (POOLFILT.only && (st === 'green')) return;
      if (POOLFILT.q && !norm(z.title).includes(norm(POOLFILT.q)) && !z.code.includes(POOLFILT.q)) return;
      total++;
      if (n++ > 150) return;
      const row = el('div', 'row'); row.draggable = true;
      row.innerHTML = `<span class="grip">⠿</span><span class="stat ${st === 'none' ? '' : st}"></span>
        <div class="rtext"><div class="code">${z.code} · ${esc(z.ders.ders.split(' ')[0])}</div><div class="title">${esc(z.title)}</div></div>`;
      row.ondragstart = e => { e.dataTransfer.setData('text/plain', 'pool:' + z.uid); e.dataTransfer.effectAllowed = 'copy'; row.classList.add('dragging'); };
      row.ondragend = () => row.classList.remove('dragging');
      // HTML5 drag doesn't exist on touch: tap → first free slot (desktop shortcut too)
      row.onclick = () => { addToNextSlot(z.uid); };
      list.appendChild(row);
    });
    if (total > 150) list.appendChild(el('div', 'hint', `${total} kazanım · ilk 150 gösteriliyor, aramayla daralt`));
    if (!total) list.appendChild(el('div', 'empty', 'Eşleşen kazanım yok'));
  }
  tools.querySelector('input').oninput = e => { POOLFILT.q = e.target.value; tools.querySelector('.search').classList.toggle('has', !!POOLFILT.q); paintPool(); };
  tools.querySelector('.clr').onclick = () => { POOLFILT.q = ''; takvim(); };
  tools.querySelector('#onlyred').onclick = () => { POOLFILT.only = !POOLFILT.only; takvim(); };
  tools.querySelector('[data-grp="ders"]').querySelectorAll('.chip').forEach(c => c.onclick = () => { POOLFILT.ders = c.dataset.v; takvim(); });
  paintPool();

  const dates = weekDates(WEEK_OFFSET), tstr = dstr(new Date());
  const d = $('#detail'); d.classList.add('wide'); d.innerHTML = '';
  const bar = el('div', 'calbar');
  const label = WEEK_OFFSET === 0 ? 'Bu hafta' : WEEK_OFFSET === -1 ? 'Geçen hafta' : WEEK_OFFSET === 1 ? 'Gelecek hafta' : `${WEEK_OFFSET > 0 ? '+' : ''}${WEEK_OFFSET} hafta`;
  bar.innerHTML = `<button class="wkbtn" id="prev">‹</button><button class="wkbtn" id="today">Bugün</button><button class="wkbtn" id="next">›</button>
    <h1>${label}</h1>
    <span class="wk">${dates[0].getDate()} ${MON_SHORT[dates[0].getMonth()]} – ${dates[6].getDate()} ${MON_SHORT[dates[6].getMonth()]} ${dates[6].getFullYear()}</span>`;
  bar.querySelector('#prev').onclick = () => { WEEK_OFFSET--; takvim(); };
  bar.querySelector('#next').onclick = () => { WEEK_OFFSET++; takvim(); };
  bar.querySelector('#today').onclick = () => { WEEK_OFFSET = 0; takvim(); };
  d.appendChild(bar);

  const cal = el('div', 'cal');
  const head = el('div', 'calhead');
  head.appendChild(el('div', 'gh'));
  dates.forEach((dt, i) => head.appendChild(el('div', 'dh' + (dstr(dt) === tstr ? ' today' : ''), `<b>${WD_SHORT[i]}</b><span>${dt.getDate()}</span>`)));
  cal.appendChild(head);

  const scroll = el('div', 'calscroll');
  const matrix = el('div', 'calmatrix');
  HOURS.forEach(h => {
    matrix.appendChild(el('div', 'hr', `${h}:00`));
    dates.forEach(dt => {
      const ds = dstr(dt);
      const cell = el('div', 'cell' + (ds === tstr ? ' today' : ''));
      cell.dataset.date = ds; cell.dataset.h = h;
      cell.ondragover = e => { e.preventDefault(); cell.classList.add('over'); };
      cell.ondragleave = () => cell.classList.remove('over');
      cell.ondrop = e => {
        e.preventDefault(); cell.classList.remove('over');
        const data = e.dataTransfer.getData('text/plain');
        if (data.startsWith('pool:')) S.events.push({ id: 'e' + Date.now() + Math.floor(Math.random() * 999), date: ds, h, code: data.slice(5), author: 'student', done: false });
        else if (data.startsWith('move:')) { const ev = S.events.find(x => x.id === data.slice(5)); if (ev) { ev.date = ds; ev.h = h; } }
        save(); refresh();
      };
      S.events.filter(x => x.date === ds && x.h === h).forEach(ev => {
        const z = findKaz(ev.code);
        const card = el('div', 'evt ' + ev.author + (ev.done ? ' done' : '')); card.draggable = true;
        card.innerHTML = `<span class="edot">${ev.done ? ICON.check : ''}</span><span class="et">${esc(z ? z.title : ev.code)}</span><span class="ex">×</span>`;
        card.title = (z ? z.title : ev.code) + '  ·  ' + (ev.author === 'coach' ? 'çilek ekledi' : 'sen ekledin') + (ev.done ? ' · yapıldı' : ' · bekliyor');
        card.ondragstart = e => { e.dataTransfer.setData('text/plain', 'move:' + ev.id); e.dataTransfer.effectAllowed = 'move'; };
        card.onclick = e => { if (e.target.closest('.ex')) return; ev.done = !ev.done; ev.done ? bump() : unbump(); save(); refresh(); };
        card.querySelector('.ex').onclick = e => { e.stopPropagation(); S.events = S.events.filter(x => x.id !== ev.id); save(); refresh(); };
        cell.appendChild(card);
      });
      matrix.appendChild(cell);
    });
  });
  scroll.appendChild(matrix); cal.appendChild(scroll); d.appendChild(cal);
  d.appendChild(el('div', 'hint', 'Havuzdan sürükle ya da dokun (ilk boş saate eklenir) · kartı taşı · kart tıkla = ✓ yapıldı · × = kaldır. Pembe = çilek, yeşil = sen.'));
}
