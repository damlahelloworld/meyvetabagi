// Sıra Puanı — multi-parameter score from the student's own data. Real multi-user board needs backend.
import { siraPuani } from '../engine.js';
import { el, cnt, ICON, page } from '../ui.js';

export function siralama() {
  const sp = siraPuani();
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('div', 'crumb', 'SIRA PUANI'));
  d.appendChild(el('h1', null, 'Senin Sıra Puanın'));
  d.appendChild(el('p', 'meta', 'Tek metrik değil — dört eksenin ağırlıklı toplamı. Hepsi kendi gerçek verinden.'));

  const est = el('div', 'est mt0');
  est.innerHTML = `<div class="l">Toplam Sıra Puanı</div><div class="r">${cnt(sp.total)}</div>`;
  d.appendChild(est);

  const set = el('div', 'setcard gap-top');
  const AXIS = ['m-pink', 'm-orange', 'm-green', 'm-blue'];
  sp.parts.forEach((p, i) => {
    const row = el('div', 'setrow');
    row.innerHTML = `<div class="lbl"><b>${p.k}</b><span>değer ${p.raw} · ağırlık ×${p.w}</span></div><div class="metric ${AXIS[i] || ''}">${p.val}</div>`;
    set.appendChild(row);
  });
  d.appendChild(set);

  d.appendChild(el('div', 'seclabel', 'Yarış'));
  const note = el('div', 'coachbox');
  note.innerHTML = `<div class="h"><span class="av">${ICON.spark}</span>Genel tablo & ligler</div>
    <p>Gerçek kullanıcı sıralaması ve haftalık ligler <em>backend + canlı etkinliklerle</em> gelir —
    uydurma isimlerle sahte tablo göstermiyoruz. Yarış ekseni: etkinlik netleri (doğrulanmış) + istikrar.</p>`;
  d.appendChild(note);
  d.appendChild(el('div', 'hint', 'Yeşil oranın (özel/arkadaş) kopyalanabilir olduğu için genel yarışta değil; yarış doğrulanmış net + seri üzerinden. Tekrar sayacı günde kazanım başına en fazla 1 artar.'));
}
