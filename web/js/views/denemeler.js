// Denemeler — TYT/AYT entry with real question limits, net = D − Y/4 (negative allowed).
// Rank estimate is PARKED (Damla, 2026-07-10): mechanic undesigned + no sourced ÖSYM table. Net only.
import { S, save, todayKey } from '../state.js';
import { DENEME } from '../engine.js';
import { el, page } from '../ui.js';
import { refresh } from '../router.js';

let TYPE = 'TYT';

export function denemeler() {
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('div', 'crumb', 'DENEMELER'));
  d.appendChild(el('h1', null, 'Yeni deneme'));
  d.appendChild(el('p', 'meta', 'net = D − Y/4 · boşlar otomatik'));

  // TYT / AYT selector
  const segs = el('div', 'segs');
  Object.keys(DENEME).forEach(tp => {
    const b = el('button', tp === TYPE ? 'on' : '', tp);
    b.onclick = () => { TYPE = tp; refresh(); };
    segs.appendChild(b);
  });
  d.appendChild(segs);

  const wrap = el('div');
  const head = el('div', 'dyrow');
  head.innerHTML = `<div class="sub colh">DERS</div><div class="colh c">Doğru</div><div class="colh c">Yanlış</div><div class="colh c">Net</div>`;
  wrap.appendChild(head);
  const inputs = {};
  DENEME[TYPE].forEach(([s, max]) => {
    const row = el('div', 'dyrow');
    row.innerHTML = `<div class="sub">${s} <span class="pill">${max} soru</span></div>`;
    const di = el('input'); di.type = 'number'; di.min = 0; di.max = max; di.placeholder = '0';
    const yi = el('input'); yi.type = 'number'; yi.min = 0; yi.max = max; yi.placeholder = '0';
    const net = el('div', 'net', '0');
    inputs[s] = { di, yi, net, max };
    row.appendChild(di); row.appendChild(yi); row.appendChild(net);
    wrap.appendChild(row);
    [di, yi].forEach(inp => inp.oninput = recalc);
  });
  d.appendChild(wrap);

  const est = el('div', 'est'); est.innerHTML = `<div class="l">Toplam net</div><div class="r" id="tnet">0</div>`;
  d.appendChild(est);

  function totalNet() {
    let tot = 0;
    DENEME[TYPE].forEach(([s]) => {
      const f = inputs[s];
      let dv = Math.max(0, Math.min(f.max, +f.di.value || 0));
      let yv = Math.max(0, Math.min(f.max - dv, +f.yi.value || 0));  // D + Y asla soru sayısını aşamaz
      if (f.di.value && +f.di.value !== dv) f.di.value = dv;
      if (f.yi.value && +f.yi.value !== yv) f.yi.value = yv;
      const net = dv - yv / 4;  // negatif net gerçektir, sıfıra yuvarlamayız
      f.net.textContent = net.toFixed(2); tot += net;
    });
    return tot;
  }
  function recalc() { d.querySelector('#tnet').textContent = totalNet().toFixed(1); }
  const btnRow = el('div', 'mt18');
  const btn = el('button', 'btn', 'Denemeyi kaydet');
  btn.onclick = () => {
    const tot = totalNet();
    if (!Object.values(inputs).some(f => f.di.value || f.yi.value)) return;
    S.denemeler.push({ id: 'd' + Date.now(), date: todayKey(), type: TYPE, net: +tot.toFixed(1) }); save(); refresh();
  };
  btnRow.appendChild(btn);
  d.appendChild(btnRow);
  d.appendChild(el('div', 'hint', 'Detaylı modda yanlışını kazanıma bağlayınca o kazanım kırmızıya döner (v1 sonrası).'));

  d.appendChild(el('div', 'seclabel gap-top', 'Geçmiş denemeler'));
  const hist = el('div', 'setcard');
  if (!S.denemeler.length) hist.appendChild(el('div', 'empty', 'Henüz deneme girmedin'));
  S.denemeler.slice().reverse().forEach(dn => {
    const row = el('div', 'setrow');
    row.innerHTML = `<div class="lbl"><b>${dn.type} · net ${dn.net}</b><span>${dn.date}</span></div>`;
    const x = el('button', 'repminus', 'Sil');
    x.onclick = () => { S.denemeler = S.denemeler.filter(q => q.id !== dn.id); save(); refresh(); };
    row.appendChild(x); hist.appendChild(row);
  });
  d.appendChild(hist);
}
