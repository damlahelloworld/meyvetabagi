// Takvim — one self-contained full-width page (Damla, 2026-07-10: no side panes anywhere).
// Order: week nav → 7-day calendar board → günlük program (selected day, hours optional) → kazanım havuzu.
// Task chips are grey; the ONLY color is state (done green / not done). Drop targets = whole day.
import { S, save, bump, unbump, dstr } from '../state.js';
import { DB, allKaz, findKaz } from '../data.js';
import { el, esc, norm, ICON, WD_SHORT, WD_LONG, MON_SHORT, HOURS, weekDates, page } from '../ui.js';
import { refresh } from '../router.js';

const POOLFILT = { q: '', ders: 'all', only: false };
let WEEK_OFFSET = 0;
let SEL_DAY = null;  // dstr — day whose program is open; defaults to today

function addToDay(code, ds) {
  S.events.push({ id: 'e' + Date.now() + Math.floor(Math.random() * 999), date: ds, h: null, code, author: 'student', done: false });
  save(); refresh();
}

function dayEvents(ds) {
  // houred tasks first (by hour), then day-level ones in insertion order
  return S.events.filter(x => x.date === ds)
    .sort((a, b) => (a.h == null) - (b.h == null) || (a.h || 0) - (b.h || 0));
}

export function takvim() {
  const tstr = dstr(new Date());
  if (!SEL_DAY) SEL_DAY = tstr;
  const dates = weekDates(WEEK_OFFSET);

  const d = el('div', 'pagein'); page(true).appendChild(d);

  // week nav — lives in the page, not the topbar
  const label = WEEK_OFFSET === 0 ? 'Bu hafta' : WEEK_OFFSET === -1 ? 'Geçen hafta' : WEEK_OFFSET === 1 ? 'Gelecek hafta' : `${WEEK_OFFSET > 0 ? '+' : ''}${WEEK_OFFSET} hafta`;
  const bar = el('div', 'calbar');
  bar.innerHTML = `<button class="wkbtn" id="wprev">‹</button><button class="wkbtn" id="wtoday">Bugün</button><button class="wkbtn" id="wnext">›</button>
    <span class="wk">${label} · ${dates[0].getDate()} ${MON_SHORT[dates[0].getMonth()]} – ${dates[6].getDate()} ${MON_SHORT[dates[6].getMonth()]}</span>`;
  bar.querySelector('#wprev').onclick = () => { WEEK_OFFSET--; SEL_DAY = dstr(weekDates(WEEK_OFFSET)[0]); refresh(); };
  bar.querySelector('#wnext').onclick = () => { WEEK_OFFSET++; SEL_DAY = dstr(weekDates(WEEK_OFFSET)[0]); refresh(); };
  bar.querySelector('#wtoday').onclick = () => { WEEK_OFFSET = 0; SEL_DAY = tstr; refresh(); };
  d.appendChild(bar);

  // ---- week board: 7 day cells, whole cell is the drop target ----
  const board = el('div', 'board');
  dates.forEach((dt, i) => {
    const ds = dstr(dt);
    const evs = dayEvents(ds);
    const card = el('div', 'dayc' + (ds === tstr ? ' today' : '') + (ds === SEL_DAY ? ' sel' : ''));
    const head = el('button', 'dh', `<b>${WD_SHORT[i]}</b><span>${dt.getDate()} ${MON_SHORT[dt.getMonth()]}</span>${evs.length ? `<i>${evs.filter(e => e.done).length}/${evs.length}</i>` : ''}`);
    head.onclick = () => { SEL_DAY = ds; refresh(); };
    card.appendChild(head);
    const body = el('div', 'dbody');
    evs.forEach(ev => body.appendChild(tsk(ev)));
    if (!evs.length) body.appendChild(el('div', 'dempty', 'boş'));
    card.appendChild(body);
    card.ondragover = e => { e.preventDefault(); card.classList.add('over'); };
    card.ondragleave = () => card.classList.remove('over');
    card.ondrop = e => {
      e.preventDefault(); card.classList.remove('over');
      const data = e.dataTransfer.getData('text/plain');
      if (data.startsWith('pool:')) { SEL_DAY = ds; addToDay(data.slice(5), ds); return; }
      if (data.startsWith('move:')) { const ev = S.events.find(x => x.id === data.slice(5)); if (ev && ev.date !== ds) { ev.date = ds; ev.h = null; save(); } refresh(); }
    };
    board.appendChild(card);
  });
  d.appendChild(board);

  // ---- günlük program: the selected day in detail, hours live HERE ----
  const [sy, sm, sday] = SEL_DAY.split('-').map(Number);
  const sd = new Date(sy, sm - 1, sday);  // local-time parse; new Date('YYYY-MM-DD') would be UTC
  const sevs = dayEvents(SEL_DAY);
  const panel = el('div', 'daypanel');
  panel.appendChild(el('div', 'seclabel', 'GÜNLÜK PROGRAM'));
  panel.appendChild(el('h1', 'sec', `${WD_LONG[(sd.getDay() + 6) % 7]} · ${sd.getDate()} ${MON_SHORT[sd.getMonth()]}`));
  if (!sevs.length) panel.appendChild(el('div', 'empty', 'Bu güne henüz kazanım eklemedin — aşağıdaki havuzdan seç.'));
  sevs.forEach(ev => {
    const z = findKaz(ev.code);
    const row = el('div', 'prow' + (ev.done ? ' done' : ''));
    const sel = el('select', 'hsel');
    sel.innerHTML = `<option value="">saatsiz</option>` + HOURS.map(h => `<option value="${h}"${ev.h === h ? ' selected' : ''}>${String(h).padStart(2, '0')}:00</option>`).join('');
    sel.onchange = () => { ev.h = sel.value === '' ? null : +sel.value; save(); refresh(); };
    row.appendChild(sel);
    const cb = el('button', 'pcheck', ICON.check);
    cb.onclick = () => { ev.done = !ev.done; ev.done ? bump() : unbump(); save(); refresh(); };
    row.appendChild(cb);
    const txt = el('div', 'ptext');
    txt.innerHTML = `<div class="title">${esc(z ? z.title : ev.code)}</div><div class="code">${z ? z.code + ' · ' + esc(z.ders.ders.split(' ')[0]) : ''}${ev.author === 'coach' ? ' · çilek ekledi' : ''}</div>`;
    if (z) txt.onclick = () => { location.hash = '#/konular/' + z.uid; };
    row.appendChild(txt);
    const x = el('button', 'px', '×');
    x.onclick = () => { S.events = S.events.filter(q => q.id !== ev.id); save(); refresh(); };
    row.appendChild(x);
    panel.appendChild(row);
  });
  d.appendChild(panel);

  // ---- kazanım havuzu: inside the page, feeds the selected day ----
  d.appendChild(el('div', 'seclabel gap-top', 'KAZANIM HAVUZU'));
  d.appendChild(el('p', 'meta', `Dokun → seçili güne eklenir (${sd.getDate()} ${MON_SHORT[sd.getMonth()]}) · sürükleyip herhangi bir güne bırakabilirsin`));
  const tools = el('div', 'tools flat');
  tools.innerHTML = `<div class="search${POOLFILT.q ? ' has' : ''}"><span class="mag">${ICON.mag}</span>
    <input placeholder="Havuzda ara…" value="${esc(POOLFILT.q)}"><span class="clr">×</span></div>
    <div class="chips" data-grp="ders">
      <button class="chip${POOLFILT.ders === 'all' ? ' on' : ''}" data-v="all">Tümü</button>
      ${DB.dersler.map(x => `<button class="chip${POOLFILT.ders === x.ders ? ' on' : ''}" data-v="${esc(x.ders)}">${esc(x.ders.split(' ')[0])}</button>`).join('')}
    </div>
    <div class="chips gap-top">
      <button class="chip${POOLFILT.only ? ' on' : ''}" id="onlyred">Sadece çalışılmamış</button>
    </div>`;
  d.appendChild(tools);
  const list = el('div', 'list pool'); d.appendChild(list);
  function paintPool() {
    list.innerHTML = '';
    let n = 0, total = 0;
    allKaz().forEach(z => {
      const st = S.status[z.uid] || 'none';
      if (POOLFILT.ders !== 'all' && z.ders.ders !== POOLFILT.ders) return;
      if (POOLFILT.only && (st === 'green')) return;
      if (POOLFILT.q && !norm(z.title).includes(norm(POOLFILT.q)) && !z.code.includes(POOLFILT.q)) return;
      total++;
      if (n++ > 60) return;
      const row = el('div', 'row'); row.draggable = true;
      row.innerHTML = `<span class="grip">⠿</span><span class="stat ${st === 'none' ? '' : st}"></span>
        <div class="rtext"><div class="code">${z.code} · ${esc(z.ders.ders.split(' ')[0])}</div><div class="title">${esc(z.title)}</div></div>`;
      row.ondragstart = e => { e.dataTransfer.setData('text/plain', 'pool:' + z.uid); e.dataTransfer.effectAllowed = 'copy'; row.classList.add('dragging'); };
      row.ondragend = () => row.classList.remove('dragging');
      row.onclick = () => addToDay(z.uid, SEL_DAY);   // touch has no HTML5 drag: tap → selected day
      list.appendChild(row);
    });
    if (total > 60) list.appendChild(el('div', 'hint', `${total} kazanım · ilk 60 gösteriliyor, aramayla daralt`));
    if (!total) list.appendChild(el('div', 'empty', 'Eşleşen kazanım yok'));
  }
  tools.querySelector('input').oninput = e => { POOLFILT.q = e.target.value; tools.querySelector('.search').classList.toggle('has', !!POOLFILT.q); paintPool(); };
  tools.querySelector('.clr').onclick = () => { POOLFILT.q = ''; refresh(); };
  tools.querySelector('#onlyred').onclick = () => { POOLFILT.only = !POOLFILT.only; refresh(); };
  tools.querySelector('[data-grp="ders"]').querySelectorAll('.chip').forEach(c => c.onclick = () => { POOLFILT.ders = c.dataset.v; refresh(); });
  paintPool();
}

// grey task chip on the board — color only means state (done / pending)
function tsk(ev) {
  const z = findKaz(ev.code);
  const card = el('div', 'tsk' + (ev.done ? ' done' : '')); card.draggable = true;
  card.innerHTML = `<span class="tdot">${ev.done ? ICON.check : ''}</span><span class="tt">${esc(z ? z.title : ev.code)}</span><span class="tx">×</span>`;
  card.title = (z ? z.title : ev.code) + '  ·  ' + (ev.author === 'coach' ? 'çilek ekledi' : 'sen ekledin') + (ev.done ? ' · yapıldı' : ' · bekliyor');
  card.ondragstart = e => { e.dataTransfer.setData('text/plain', 'move:' + ev.id); e.dataTransfer.effectAllowed = 'move'; };
  card.onclick = e => { if (e.target.closest('.tx')) return; ev.done = !ev.done; ev.done ? bump() : unbump(); save(); refresh(); };
  card.querySelector('.tx').onclick = e => { e.stopPropagation(); S.events = S.events.filter(x => x.id !== ev.id); save(); refresh(); };
  return card;
}
