// Bugün — daily home: countdown, last net, daily kazanım explain (active recall), çilek suggestion, today's tasks.
import { S, save, bump, unbump, addRep, dstr } from '../state.js';
import { totals, findKaz } from '../data.js';
import { EXAM, analyzeWeak, dailyKaz, generatePlan } from '../engine.js';
import { $, el, esc, cnt, ICON, WD_LONG, setMid } from '../ui.js';
import { refresh } from '../router.js';

export function taskRow(x, big) {
  const z = findKaz(x.code);
  const title = z ? z.title : x.code;
  const r = el('div', 'task' + (x.done ? ' done' : ''));
  r.innerHTML = `<div class="cb">${ICON.check}</div><div class="tt">${esc(title)}${z ? ` <span class="pill">${z.code}</span>` : ''}</div>
    <div class="who ${x.author}">${x.author === 'coach' ? 'çilek' : 'Sen'}</div>`;
  r.querySelector('.cb').onclick = e => { e.stopPropagation(); x.done = !x.done; x.done ? bump() : unbump(); save(); refresh(); };
  if (big) r.querySelector('.tt').onclick = () => { if (z) location.hash = '#/konular/' + z.uid; };
  return r;
}

export function bugun() {
  const t = totals();
  const ts = dstr(new Date());
  const list = setMid('Bugün', WD_LONG[(new Date().getDay() + 6) % 7] + ' · takvimdeki bugünkü kazanımlar');
  const today = S.events.filter(x => x.date === ts).sort((a, b) => a.h - b.h);
  if (!today.length) list.appendChild(el('div', 'empty', 'Bugün için görev yok'));
  today.forEach(x => list.appendChild(taskRow(x)));

  const days = EXAM > new Date() ? Math.ceil((EXAM - new Date()) / 864e5) : 0;
  const last = S.denemeler[S.denemeler.length - 1];
  const d = $('#detail'); d.innerHTML = '';
  const nm = (S.user && S.user.name || '').trim().split(' ')[0];
  d.appendChild(el('div', 'crumb', 'ANA SAYFA'));
  d.appendChild(el('h1', null, nm ? `Merhaba ${esc(nm)}, devam edelim` : 'Merhaba, devam edelim'));
  d.appendChild(el('p', 'meta', 'Her gün açtığın yer — ne çalışacağını buradan görürsün.'));
  if (S.rebalanced && S.rebalanced.date === ts && S.rebalanced.n > 0)
    d.appendChild(el('div', 'hint', `Kaçan ${S.rebalanced.n} görev bugünden itibaren yeniden dağıtıldı.`));

  const cards = el('div', 'grid cards mb26');
  cards.appendChild(el('div', 'card c-pink', `<div class="k">Sınava kalan</div><div class="v">${cnt(days)}<small> gün</small></div>`));
  cards.appendChild(el('div', 'card c-purple', `<div class="k">Son net (${last ? last.type : 'TYT'})</div><div class="v">${last ? cnt(last.net) : '—'}</div>`));
  cards.appendChild(el('div', 'card c-teal', `<div class="k">Yeşil kazanım</div><div class="v">%${cnt(t.greenPct)}<small> · ${t.green}/${t.total}</small></div>`));
  d.appendChild(cards);

  // günün kazanımı — açıkla (aktif hatırlama, MEB açıklamasıyla karşılaştır)
  const dz = dailyKaz();
  const daily = el('div', 'coachbox');
  if (S.dailyGraded === ts) {
    daily.innerHTML = `<div class="h"><span class="av">${ICON.spark}</span>Günün kazanımı</div>
      <p>Bugünkü kazanımı açıkladın — yarın yenisi gelir. <span class="pill">${dz.code}</span></p>`;
  } else {
    daily.innerHTML = `<div class="h"><span class="av">${ICON.spark}</span>Günün kazanımı · kendi cümlelerinle açıkla</div>
      <p class="tight"><b>${esc(dz.title)}</b> <span class="pill">${dz.code} · ${esc(dz.ders.ders.split(' ')[0])}</span></p>`;
    const ta = el('textarea', 'note short'); ta.placeholder = 'Bu kazanımı bilmeyen birine anlatır gibi yaz…';
    daily.appendChild(ta);
    const btn = el('button', 'btn mt10', 'Kontrol et');
    btn.onclick = () => {
      if (!ta.value.trim()) { ta.focus(); return; }
      btn.remove();
      const rev = el('div', 'aciklama daily');
      rev.innerHTML = `<b>MEB açıklaması · doğrusu</b>${esc(dz.aciklama || dz.title)}`;
      daily.appendChild(rev);
      const g = el('div', 'segwrap');
      const ok = el('button', 'btn', 'Doğru bildim');
      const no = el('button', 'btn ghost', 'Eksik kaldı');
      ok.onclick = () => { S.status[dz.uid] = 'green'; if (addRep(dz.uid)) bump(); S.dailyGraded = ts; save(); refresh(); };
      no.onclick = () => { S.status[dz.uid] = 'amber'; S.dailyGraded = ts; save(); refresh(); };
      g.appendChild(ok); g.appendChild(no); daily.appendChild(g);
    };
    daily.appendChild(btn);
  }
  d.appendChild(daily);

  const w = analyzeWeak();
  const coach = el('div', 'coachbox');
  coach.innerHTML = `<div class="h"><span class="av">${ICON.spark}</span>çilek önerisi</div>
    <p>En zayıf dersin <em>${esc(w.ders)}</em> (%${w.pct} yeşil, ${w.remaining} kazanım eksik).
    Sana bu haftaya <em>${w.plan.length} kazanım</em> önerdim — hepsi MEB kazanımına dayalı.
    <span class="pill">verinden hesaplandı</span></p>`;
  if (w.plan.length) {
    const btn = el('button', 'btn mt12', 'Bu haftanın programını oluştur');
    btn.onclick = () => { generatePlan(w.plan); location.hash = '#/takvim'; };
    coach.appendChild(btn);
  }
  d.appendChild(coach);

  d.appendChild(el('h1', 'sec', 'Günün görevleri'));
  today.forEach(x => d.appendChild(taskRow(x, true)));
  if (!today.length) d.appendChild(el('div', 'empty', 'Boş — Takvim’den ekleyebilirsin'));
}
