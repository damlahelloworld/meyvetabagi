// Bugün — daily home: countdown, last net, daily kazanım explain (active recall), çilek suggestion, today's tasks.
import { S, save, bump, unbump, addRep, dstr } from '../state.js';
import { totals, findKaz } from '../data.js';
import { EXAM, analyzeWeak, dailyKaz, generatePlan, cilekEvaluate } from '../engine.js';
import { el, esc, cnt, ICON, page } from '../ui.js';
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
  const today = S.events.filter(x => x.date === ts).sort((a, b) => (a.h == null) - (b.h == null) || (a.h || 0) - (b.h || 0));

  const days = EXAM > new Date() ? Math.ceil((EXAM - new Date()) / 864e5) : 0;
  const last = S.denemeler[S.denemeler.length - 1];
  const d = el('div', 'pagein'); page().appendChild(d);
  const nm = (S.user && S.user.name || '').trim().split(' ')[0];
  d.appendChild(el('div', 'crumb', 'ANA SAYFA'));
  d.appendChild(el('h1', null, nm ? `Merhaba ${esc(nm)}, devam edelim` : 'Merhaba, devam edelim'));
  d.appendChild(el('p', 'meta', 'Her gün açtığın yer — ne çalışacağını buradan görürsün.'));
  if (S.rebalanced && S.rebalanced.date === ts && S.rebalanced.n > 0)
    d.appendChild(el('div', 'hint', `Kaçan ${S.rebalanced.n} görev bugünden itibaren yeniden dağıtıldı.`));

  // plain Arial, stacked, chromatic values like the wordmark — no boxes (Damla, 2026-07-10)
  const stats = el('div', 'statlines');
  stats.innerHTML = `
    <div class="statline"><span class="v" style="color:var(--pink)">${cnt(days)} gün</span><span class="k">sınava kalan</span></div>
    <div class="statline"><span class="v" style="color:var(--purple)">${last ? cnt(last.net) : '—'}</span><span class="k">son net${last ? ' (' + last.type + ')' : ''}</span></div>
    <div class="statline"><span class="v" style="color:var(--teal)">%${cnt(t.greenPct)}</span><span class="k">yeşil kazanım · ${t.green}/${t.total}</span></div>`;
  d.appendChild(stats);

  // günün kazanımı — anlat bakalım: çilek kural-tabanlı değerlendirir, HER ŞEY kaynaklı (MLA)
  const dz = dailyKaz();
  const daily = el('div', 'coachbox');
  const kaynakca = () => {
    const k = el('div', 'kaynakca');
    k.innerHTML = `<b>KAYNAKÇA (MLA)</b>
      <p class="cite">Millî Eğitim Bakanlığı, Talim ve Terbiye Kurulu Başkanlığı. <i>2026 Yükseköğretim Kurumları Sınavına Esas Konu ve Kazanımlar.</i> T.C. Millî Eğitim Bakanlığı, 2025, ttkb.meb.gov.tr.</p>
      <p class="cite">Millî Eğitim Bakanlığı. "Kazanım ${esc(dz.code)}: ${esc(dz.title)}." <i>2026 YKS'ye Esas Konu ve Kazanımlar,</i> T.C. MEB, 2025.</p>
      <p class="citenote">çilek'in yöntemi: resmî MEB açıklamasındaki kavramların metninde kapsanma analizi (kural tabanlı, ek toleranslı kök eşleme). Yapay zekâ modeli kullanılmaz; hiçbir veri internete gönderilmez, hesaplama tarayıcında yapılır. Uygulamadaki 955 kazanımın tamamı yukarıdaki resmî PDF'ten ayrıştırılmıştır — üretilmiş/uydurma kazanım yoktur.</p>`;
    return k;
  };
  const kbtn = el('button', 'mini', 'kaynakça');
  let kopen = null;
  kbtn.onclick = () => { if (kopen) { kopen.remove(); kopen = null; } else { kopen = kaynakca(); daily.insertBefore(kopen, daily.children[1]); } };
  if (S.dailyGraded === ts) {
    daily.innerHTML = `<div class="h">Günün kazanımı</div>
      <p>Bugünkü kazanımı açıkladın — yarın yenisi gelir. <span class="pill">${dz.code}</span></p>`;
    daily.querySelector('.h').appendChild(kbtn);
  } else {
    daily.innerHTML = `<div class="h">Günün kazanımı · anlat bakalım</div>
      <p class="tight"><b>${esc(dz.title)}</b> <span class="pill">${dz.code} · ${esc(dz.ders.ders.split(' ')[0])}</span></p>`;
    daily.querySelector('.h').appendChild(kbtn);
    const ta = el('textarea', 'note short'); ta.placeholder = 'Bu kazanımı bilmeyen birine anlatır gibi yaz…';
    daily.appendChild(ta);
    const btn = el('button', 'btn mt10', 'çilek değerlendirsin');
    btn.onclick = () => {
      if (!ta.value.trim()) { ta.focus(); return; }
      btn.remove();
      const ev = cilekEvaluate(ta.value, dz);
      const res = el('div', 'cilekres');
      res.innerHTML = `<div class="score sc-${ev.verdict}">%${ev.score}</div>
        <div class="rdet">
          ${ev.found.length ? `<p class="okline">değindin: ${ev.found.map(esc).join(', ')}</p>` : ''}
          ${ev.missing.length ? `<p class="missline">hiç değinmedin: ${ev.missing.map(esc).join(', ')}</p>` : '<p class="okline">MEB açıklamasındaki her kavrama değinmişsin.</p>'}
          <p class="srcline">çilek bu değerlendirmede şunu kullandı: ${ev.sources.map(s => esc(s.name)).join(' · ')} — <button class="mini" id="evk">yöntem & kaynak</button></p>
        </div>`;
      daily.appendChild(res);
      res.querySelector('#evk').onclick = () => { if (!kopen) kbtn.click(); };
      const rev = el('div', 'aciklama daily');
      rev.innerHTML = `<b>MEB açıklaması · doğrusu</b>${esc(dz.aciklama || dz.title)}`;
      daily.appendChild(rev);
      const g = el('div', 'segwrap');
      const ok = el('button', 'btn', 'Doğru bildim');
      const no = el('button', 'btn ghost', 'Eksik kaldı');
      ok.onclick = () => { S.status[dz.uid] = 'green'; if (addRep(dz.uid)) bump(); S.dailyGraded = ts; save(); refresh(); };
      no.onclick = () => { S.status[dz.uid] = 'amber'; S.dailyGraded = ts; save(); refresh(); };
      g.appendChild(ok); g.appendChild(no); daily.appendChild(g);
      daily.appendChild(el('div', 'hint', `çilek önerisi: ${ev.verdict === 'green' ? 'Doğru bildim' : 'Eksik kaldı'} — ama son söz senin.`));
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
