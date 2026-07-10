// Bugün — lean home for the public-service tool (Damla, 2026-07-10: no coach organs).
// Sadece: kimlik + büyüyen corpus sayaçları + bugünün takvim konuları + iki kapı (konular/takvim).
import { S, save, bump, unbump, dstr } from '../state.js';
import { totals, findKaz, corpusStats } from '../data.js';
import { EXAM } from '../engine.js';
import { el, esc, cnt, page } from '../ui.js';
import { refresh } from '../router.js';

export function taskRow(x) {
  const z = findKaz(x.code);
  const r = el('div', 'task' + (x.done ? ' done' : ''));
  r.innerHTML = `<span class="tt">${esc(z ? z.title : x.code)}</span>${z ? ` <span class="tcode">${z.code}</span>` : ''}<button class="tdone">${x.done ? 'geri al' : 'yaptım'}</button>`;
  r.querySelector('.tt').onclick = () => { if (z) location.hash = '#/konular/' + z.uid; };
  r.querySelector('.tdone').onclick = e => { e.stopPropagation(); x.done = !x.done; x.done ? bump() : unbump(); save(); refresh(); };
  return r;
}

export function bugun() {
  const ts = dstr(new Date());
  const t = totals();
  const cs = corpusStats();
  const days = EXAM > new Date() ? Math.ceil((EXAM - new Date()) / 864e5) : 0;
  const today = S.events.filter(x => x.date === ts);
  const nm = (S.user && S.user.name || '').trim().split(' ')[0];

  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('h1', null, nm ? `merhaba ${esc(nm.toLocaleLowerCase('tr'))}` : 'merhaba'));
  d.appendChild(el('p', 'meta', `resmi MEB kazanımları ve ders kitaplarından çıkarılan anahtar kelimeler — tek yerde, ücretsiz. sınava ${days} gün.`));

  // büyüyen corpus sayaçları — ürünün kalbi, hepsi gerçek
  const feed = el('div', 'homefeed');
  feed.innerHTML = `
    <a class="hstat" href="#/konular"><b style="color:var(--orange)">${cnt(cs.kazanim)}</b><span>MEB kazanımı</span></a>
    <div class="hstat"><b style="color:var(--green)">${cnt(cs.sayfa)}</b><span>kitap sayfası tarandı</span></div>
    <div class="hstat"><b style="color:var(--blue)">${cnt(cs.terim)}</b><span>anahtar kelime çıkarıldı</span></div>
    <div class="hstat"><b style="color:var(--pink)">${cnt(cs.taranan)}</b><span>konu işlendi · artıyor</span></div>`;
  d.appendChild(feed);

  // bugünün takvim konuları
  d.appendChild(el('div', 'seclabel', 'bugün çalışacakların'));
  if (!today.length) {
    const e = el('div', 'homeempty');
    e.innerHTML = `takvimin bugün için boş. <a href="#/takvim">takvime konu ekle →</a>`;
    d.appendChild(e);
  } else {
    today.forEach(x => d.appendChild(taskRow(x)));
    d.appendChild(el('div', 'homeprog', `${today.filter(x => x.done).length}/${today.length} tamam`));
  }

  // iki kapı
  const doors = el('div', 'homedoors');
  doors.innerHTML = `
    <a class="door" href="#/konular"><b>konular</b><span>${cnt(t.total)} kazanım · ara, filtrele, anahtar kelimeleri gör</span></a>
    <a class="door" href="#/takvim"><b>takvim</b><span>çalışacağın konuları günlere yerleştir</span></a>`;
  d.appendChild(doors);
}
