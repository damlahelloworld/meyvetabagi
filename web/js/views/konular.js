// Konular — MEB kazanım checklist: search, filters, R/Y/G marking, reps (1/day), notes.
import { S, save, saveSoon, bump, addRep } from '../state.js';
import { DB, allKaz, findKaz, unitProgress, kuid } from '../data.js';
import { el, esc, norm, ICON, page, dersColor } from '../ui.js';
import { refresh, param } from '../router.js';

const FILT = { q: '', status: 'all', ders: 'all', sinif: 'all' };
const STATUS = ['red', 'amber', 'green'];
const STAT_LBL = { red: 'Bilmiyorum', amber: 'Tekrar', green: 'Öğrendim' };

function matchKaz(z, dersName) {
  const st = S.status[z.uid || kuid(dersName, z.code)] || 'none';
  if (FILT.status === 'red' && st !== 'red' && st !== 'none') return false;
  if (FILT.status !== 'all' && FILT.status !== 'red' && st !== FILT.status) return false;
  const dn = dersName || (z.ders && z.ders.ders);
  if (FILT.ders !== 'all' && dn !== FILT.ders) return false;
  if (FILT.q) { const q = norm(FILT.q); if (!norm(z.title).includes(q) && !z.code.includes(FILT.q)) return false; }
  return true;
}

export function konular() {
  // single full-width page (Damla: "columnlu tasarımı bırak"): list page ↔ detail page via hash param
  const sel0 = param();
  if (sel0) return kazDetail(sel0);
  const d = el('div', 'pagein'); page().appendChild(d);
  d.innerHTML = `<div class="crumb">KONULAR</div><h1>Konular</h1><p class="meta">${allKaz().length} MEB kazanımı · ara, filtrele, işaretle</p>`;
  const lpane = d;
  const tools = el('div', 'tools flat'); lpane.appendChild(tools);
  lpane.appendChild(el('div', 'list'));
  const counts = { all: 0, red: 0, amber: 0, green: 0, none: 0 };
  allKaz().forEach(z => { counts.all++; counts[S.status[z.uid] || 'none']++; });
  tools.innerHTML = `
    <div class="search${FILT.q ? ' has' : ''}"><span class="mag">${ICON.mag}</span>
      <input placeholder="Kazanım ara — “türev”, “9.1.1.1”…" value="${esc(FILT.q)}">
      <span class="clr">×</span></div>
    <div class="chips" data-grp="status">
      <button class="chip${FILT.status === 'all' ? ' on' : ''}" data-v="all">Tümü <span class="c">${counts.all}</span></button>
      <button class="chip${FILT.status === 'red' ? ' on' : ''}" data-v="red"><span class="d red"></span>Kırmızı <span class="c">${counts.red + counts.none}</span></button>
      <button class="chip${FILT.status === 'amber' ? ' on' : ''}" data-v="amber"><span class="d amber"></span>Sarı <span class="c">${counts.amber}</span></button>
      <button class="chip${FILT.status === 'green' ? ' on' : ''}" data-v="green"><span class="d green"></span>Yeşil <span class="c">${counts.green}</span></button>
    </div>
    <div class="chips gap-top" data-grp="sinif">
      <button class="chip${FILT.sinif === 'all' ? ' on' : ''}" data-v="all">Tüm sınıflar</button>
      ${['9', '10', '11', '12'].map(g => `<button class="chip${FILT.sinif === g ? ' on' : ''}" data-v="${g}">${g}. sınıf</button>`).join('')}
    </div>
    <div class="chips gap-top" data-grp="ders">
      <button class="chip${FILT.ders === 'all' ? ' on' : ''}" data-v="all">Tüm dersler</button>
      ${DB.dersler.map(d => `<button class="chip dersc dc-${dersColor(d.ders)}${FILT.ders === d.ders ? ' on' : ''}" data-v="${esc(d.ders)}">${esc(d.ders)}</button>`).join('')}
    </div>
    <div class="res"></div>`;
  const input = tools.querySelector('input');
  input.oninput = () => { FILT.q = input.value; tools.querySelector('.search').classList.toggle('has', !!FILT.q); paintList(); };
  tools.querySelector('.clr').onclick = () => { FILT.q = ''; konular(); input.focus(); };
  tools.querySelectorAll('.chips').forEach(grp => grp.querySelectorAll('.chip').forEach(c =>
    c.onclick = () => { FILT[grp.dataset.grp] = c.dataset.v; konular(); }));

  const list = lpane.querySelector('.list');
  function paintList() {
    const sel = param();
    list.innerHTML = '';
    let shown = 0;
    DB.dersler.forEach(ders => {
      const dersKaz = ders.units.filter(u => FILT.sinif === 'all' || String(u.grade) === FILT.sinif)
        .flatMap(u => u.konular.flatMap(k => k.kazanimlar)).filter(z => matchKaz(z, ders.ders));
      if (!dersKaz.length) return;
      list.appendChild(el('div', 'dersrow dc-' + dersColor(ders.ders), esc(ders.ders)));
      ders.units.forEach(u => {
        if (FILT.sinif !== 'all' && String(u.grade) !== FILT.sinif) return;
        const kz = u.konular.flatMap(k => k.kazanimlar).filter(z => matchKaz(z, ders.ders));
        if (!kz.length) return;
        const pct = unitProgress(u, ders.ders);
        const ur = el('div', 'unitrow');
        ur.innerHTML = `<span>${u.grade ? u.grade + '. sınıf · ' : ''}${esc(u.name)}</span><span class="bar"><i style="width:${pct}%"></i></span><span class="pct">%${pct}</span>`;
        list.appendChild(ur);
        kz.forEach(z => {
          shown++;
          const uid = kuid(ders.ders, z.code);
          const st = S.status[uid] || 'none';
          const row = el('div', 'row' + (uid === sel ? ' active' : ''));
          const note = S.notes[uid];
          row.innerHTML = `<span class="stat ${st === 'none' ? '' : st}"></span>
            <div class="rtext"><div class="code">${z.code}</div><div class="title">${hl(z.title)}</div>
            ${note ? `<div class="npreview">${esc(note)}</div>` : ''}</div>`;
          row.onclick = () => { location.hash = '#/konular/' + uid; };
          list.appendChild(row);
        });
      });
    });
    if (!shown) list.appendChild(el('div', 'empty', 'Eşleşen kazanım yok'));
    tools.querySelector('.res').textContent = shown === counts.all ? '' : `${shown} kazanım gösteriliyor`;
  }
  function hl(t) {
    if (!FILT.q) return esc(t);
    const i = norm(t).indexOf(norm(FILT.q));
    if (i < 0) return esc(t);
    const n = FILT.q.length;
    return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + n)) + '</mark>' + esc(t.slice(i + n));
  }
  paintList();

}

function kazDetail(sel) {
  const z = findKaz(sel);
  const d = el('div', 'pagein'); page().appendChild(d);
  if (!z) { d.appendChild(el('div', 'empty', 'Kazanım bulunamadı')); return; }
  const back = el('a', 'backlink', '‹ konular'); back.href = '#/konular'; d.appendChild(back);

  d.appendChild(el('div', 'crumb', `${esc(z.ders.ders.toUpperCase())}${z.unit.grade ? ' · ' + z.unit.grade + '. SINIF' : ''} · ${esc((z.unit.name || '').toUpperCase())}`));
  d.appendChild(el('h1', null, esc(z.title)));
  d.appendChild(el('p', 'meta', `Kazanım ${z.code}`));

  const st = S.status[z.uid] || 'none';  // unmarked = none: no segment pre-selected (data and display agree)
  const n = S.reps[z.uid] || 0;
  const segwrap = el('div', 'segwrap');
  const segs = el('div', 'segs');
  STATUS.forEach(v => {
    const label = v === 'green' ? (n > 0 ? `Öğrendim · ${n}×` : 'Öğrendim') : STAT_LBL[v];
    const b = el('button', v === st ? 'on ' + v : '', label);
    b.onclick = () => {
      S.status[z.uid] = v;
      if (v === 'green' && addRep(z.uid)) bump();  // at most one rep per day counts
      save(); refresh();
    };
    segs.appendChild(b);
  });
  segwrap.appendChild(segs);
  if (n > 0) { const m = el('button', 'repminus', '− tekrar'); m.onclick = () => { S.reps[z.uid] = Math.max(0, n - 1); save(); refresh(); }; segwrap.appendChild(m); }
  d.appendChild(segwrap);
  d.appendChild(el('div', 'hint seg', 'Öğrendim tekrar sayacı işletir — aynı kazanım günde en fazla bir tekrar sayılır, yarın yine çalışabilirsin.'));

  if (z.aciklama) d.appendChild(el('div', 'aciklama', `<b>MEB açıklaması</b>${esc(z.aciklama)}`));

  const ta = el('textarea', 'note');
  ta.placeholder = 'Kendi notun — formül, sık yaptığın hata, ipucu…';
  ta.value = S.notes[z.uid] || '';
  ta.oninput = () => { S.notes[z.uid] = ta.value; saveSoon(); };
  d.appendChild(ta);
  d.appendChild(el('div', 'hint', 'Notun otomatik kaydedilir.'));
}
