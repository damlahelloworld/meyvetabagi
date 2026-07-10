// Konular — MEB kazanım checklist: search, filters, R/Y/G marking, reps (1/day), notes.
import { S, save, saveSoon, bump, addRep, dstr } from '../state.js';
import { DB, allKaz, findKaz, unitProgress, kuid, sorularFor, terimlerFor } from '../data.js';
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

  const list = lpane.querySelector('.list'); list.className = 'list';
  function paintList() {
    const sel = param();
    list.innerHTML = '';
    let shown = 0;
    const kazRow = (ders, z) => {
      shown++;
      const uid = kuid(ders.ders, z.code);
      const st = S.status[uid] || 'none';
      const row = el('div', 'row' + (uid === sel ? ' active' : ''));
      // no dot (Damla): the status colors the code itself
      row.innerHTML = `<div class="rtext"><div class="code cst-${st}">${z.code}</div><div class="title">${hl(z.title)}</div></div>`;
      row.onclick = () => { location.hash = '#/konular/' + uid; };
      return row;
    };
    const unitBlock = (ders, u, showGrade) => {
      const kz = u.konular.flatMap(k => k.kazanimlar).filter(z => matchKaz(z, ders.ders));
      if (!kz.length) return null;
      const wrap = el('div', 'ublock');
      const ur = el('div', 'unitrow');
      ur.innerHTML = `<span>${showGrade && u.grade ? u.grade + '. sınıf · ' : ''}${esc(u.name)}</span><span class="pct">%${unitProgress(u, ders.ders)}</span>`;
      wrap.appendChild(ur);
      kz.forEach(z => wrap.appendChild(kazRow(ders, z)));
      return wrap;
    };
    DB.dersler.forEach(ders => {
      const visUnits = ders.units.filter(u => FILT.sinif === 'all' || String(u.grade) === FILT.sinif);
      const dersKaz = visUnits.flatMap(u => u.konular.flatMap(k => k.kazanimlar)).filter(z => matchKaz(z, ders.ders));
      if (!dersKaz.length) return;
      const allDers = ders.units.flatMap(u => u.konular.flatMap(k => k.kazanimlar));
      const dersGreen = allDers.filter(z => S.status[kuid(ders.ders, z.code)] === 'green').length;
      const dersPct = allDers.length ? Math.round(dersGreen / allDers.length * 100) : 0;
      list.appendChild(el('div', 'dersrow dc-' + dersColor(ders.ders), `${esc(ders.ders)} <span class="dpct">%${dersPct}</span>`));
      list.appendChild(el('div', 'dersbar', `<i class="db-${dersColor(ders.ders)}" style="width:${dersPct}%"></i>`));
      const grades = [...new Set(visUnits.map(u => u.grade).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
      if (grades.length) {
        // columns ARE the grades: 9 | 10 | 11 | 12 (Damla, 2026-07-10)
        const gg = el('div', 'gradegrid');
        gg.style.gridTemplateColumns = `repeat(${grades.length}, minmax(0,1fr))`;
        grades.forEach(g => {
          const col = el('div', 'gcol');
          col.appendChild(el('div', 'ghead', g + '. sınıf'));
          ders.units.filter(u => u.grade === g).forEach(u => {
            const b = unitBlock(ders, u, false); if (b) col.appendChild(b);
          });
          gg.appendChild(col);
        });
        list.appendChild(gg);
        // gradeless leftovers of a graded ders (rare) flow full width below
        visUnits.filter(u => !u.grade).forEach(u => { const b = unitBlock(ders, u, false); if (b) list.appendChild(b); });
      } else {
        // ders without grades (Türk Dili A.x codes): flowing dense columns
        const flow = el('div', 'kzcols');
        visUnits.forEach(u => { const b = unitBlock(ders, u, false); if (b) flow.appendChild(b); });
        list.appendChild(flow);
      }
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

// terim detayını ekranın ortasında bir kutuda aç (Damla: altında değil, message on screen)
function openTerim(t, z) {
  document.querySelectorAll('.termov').forEach(o => o.remove());
  const ov = el('div', 'termov');
  const box = el('div', 'termbox');
  box.innerHTML = `
    <button class="termx">×</button>
    <h3>${esc(t.terim.toLocaleLowerCase('tr'))}</h3>
    <div class="tp-q">ne?</div><div class="tp-a">${esc(t.tanim)}</div>
    ${t.image ? `<img class="tp-img" src="${esc(t.image)}" alt="">` : ''}
    ${t.video ? `<a class="tp-vid" href="${esc(t.video)}" target="_blank" rel="noopener">videoyu izle ↗</a>` : ''}
    <div class="tp-src">kaynak: ${esc(t.source)}</div>`;
  const add = el('button', 'tp-add', '+ çalışmama ekle');
  add.onclick = () => {
    S.events.push({ id: 'e' + Date.now() + Math.floor(Math.random() * 999), date: dstr(new Date()), h: null, code: z.uid, author: 'student', done: false });
    save(); add.textContent = 'eklendi ✓'; add.disabled = true;
  };
  box.appendChild(add);
  ov.appendChild(box);
  box.querySelector('.termx').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { ov.remove(); document.removeEventListener('keydown', esc2); } });
  document.body.appendChild(ov);
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

  // anahtar terimler — kitaptan; calicocat gibi akan renkli küçük harf liste, tıkla → açılır (Damla, 2026-07-10)
  const terms = terimlerFor(z.uid);
  if (terms.length) {
    d.appendChild(el('div', 'seclabel', `anahtar terimler · ${terms.length} (kitaptan)`));
    const wrap = el('div', 'terimler');
    const PAL = ['t-red', 't-pink', 't-orange', 't-yellow', 't-green', 't-blue', 't-purple', 't-teal', 't-brown'];
    terms.forEach((t, ti) => {
      const tm = el('button', 'terim ' + PAL[ti % PAL.length], t.terim.toLocaleLowerCase('tr'));
      tm.onclick = () => openTerim(t, z);
      wrap.appendChild(tm);
    });
    d.appendChild(wrap);
  }

  const ta = el('textarea', 'note');
  ta.placeholder = 'Kendi notun — formül, sık yaptığın hata, ipucu…';
  ta.value = S.notes[z.uid] || '';
  ta.oninput = () => { S.notes[z.uid] = ta.value; saveSoon(); };
  d.appendChild(ta);
  d.appendChild(el('div', 'hint', 'Notun otomatik kaydedilir.'));

  // bu kazanımdan sorular — statik, kitap kaynaklı, kaynaklı (Damla: birsürü soru)
  const qs = sorularFor(z.uid);
  if (qs.length) {
    d.appendChild(el('div', 'seclabel', `BU KAZANIMDAN ${qs.length} SORU`));
    qs.forEach((q, qi) => {
      const box = el('div', 'soru');
      box.innerHTML = `<div class="qstem"><b>${qi + 1}.</b> ${esc(q.stem)}</div>`;
      const opts = el('div', 'qopts');
      q.choices.forEach((ch, ci) => {
        const b = el('button', 'qopt', `${String.fromCharCode(65 + ci)}) ${esc(ch)}`);
        b.onclick = () => {
          if (box.classList.contains('answered')) return;
          box.classList.add('answered');
          opts.querySelectorAll('.qopt').forEach((o, oi) => {
            if (oi === q.answer) o.classList.add('correct');
            else if (oi === ci) o.classList.add('wrong');
          });
          if (ci !== q.answer && S.status[z.uid] !== 'red') { S.status[z.uid] = 'amber'; save(); }  // yanlış → sarı
          const ex = el('div', 'qexp');
          ex.innerHTML = `<div class="qexpl">${esc(q.explanation)}</div><div class="qsrc">Kaynak: ${esc(q.source)}</div>`;
          box.appendChild(ex);
        };
        opts.appendChild(b);
      });
      box.appendChild(opts);
      d.appendChild(box);
    });
  }
}
