// Denemeler — TYT/AYT entry with real question limits, net = D − Y/4 (negative allowed), honest ranking.
// AYT shows net only: we have no sourced AYT ranking table and we don't invent one.
import { S, save, todayKey } from '../state.js';
import { DENEME, estimateRank } from '../engine.js';
import { $, el, fmt, setMid } from '../ui.js';
import { refresh } from '../router.js';

let TYPE = 'TYT';

export function denemeler() {
  const list = setMid('Denemeler', 'D/Y gir → net → tahmini sıralama');
  S.denemeler.forEach((dn, i) => {
    const r = el('div', 'row');
    r.innerHTML = `<div class="rtext"><div class="title">${dn.type} · net ${dn.net}</div><div class="code">${dn.date}</div></div><span class="ex" title="Sil">×</span>`;
    r.querySelector('.ex').onclick = e => { e.stopPropagation(); S.denemeler.splice(i, 1); save(); refresh(); };
    list.prepend(r);  // newest first
  });
  if (!S.denemeler.length) list.appendChild(el('div', 'empty', 'Henüz deneme girmedin'));

  const d = $('#detail'); d.innerHTML = '';
  d.appendChild(el('div', 'crumb', 'DENEME EKLE'));
  d.appendChild(el('h1', null, 'Yeni deneme'));
  d.appendChild(el('p', 'meta', 'net = D − Y/4 · boşlar otomatik · sıralama tahmindir'));

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

  const est = el('div', 'est'); est.innerHTML = `<div class="l">Toplam net</div><div class="r" id="tnet">0</div><div class="l gap">Tahmini sıralama</div><div class="r" id="trank">—</div>`;
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
  function recalc() {
    const tot = totalNet();
    $('#tnet').textContent = tot.toFixed(1);
    if (TYPE === 'TYT' && tot > 0) {
      const [lo, hi] = estimateRank(tot);
      $('#trank').textContent = `~${fmt(lo)} – ${fmt(hi)}`;
    } else {
      $('#trank').textContent = '—';
    }
  }
  const btnRow = el('div', 'mt18');
  const btn = el('button', 'btn', 'Denemeyi kaydet');
  btn.onclick = () => {
    const tot = totalNet();
    if (!Object.values(inputs).some(f => f.di.value || f.yi.value)) return;
    S.denemeler.push({ id: 'd' + Date.now(), date: todayKey(), type: TYPE, net: +tot.toFixed(1) }); save(); refresh();
  };
  btnRow.appendChild(btn);
  d.appendChild(btnRow);
  d.appendChild(el('div', 'hint', TYPE === 'AYT'
    ? 'AYT sıralaması için kaynaklı ÖSYM tablosu gerekiyor — uydurma tahmin göstermiyoruz, net kaydedilir.'
    : 'Detaylı modda yanlışını kazanıma bağlayınca o kazanım kırmızıya döner (v1 sonrası).'));
}
