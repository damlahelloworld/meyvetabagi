// inkbee - çilek engine (rule-based) + exam math. Grounded in the student's real data, no fabrication.
import { S, save, dstr, todayKey, streak } from './state.js';
import { DB, allKaz, findKaz, totals, kuid } from './data.js';

export const EXAM = new Date('2026-06-20'); // YKS 2026 TYT date; becomes per-season config with backend

// KAYNAK YOK - placeholder anchors, must be replaced with a real ÖSYM year table before launch.
// Kept only so the prototype flow works; UI always labels the output "tahmini".
const RANK_ANCHORS = [[0, 2400000], [20, 1200000], [40, 650000], [60, 300000], [80, 120000], [100, 35000], [110, 12000], [120, 3000]];

// PARKED (Damla, 2026-07-10): rank mechanic undesigned - no view calls this until she designs it
// (and RANK_ANCHORS must be replaced with a sourced ÖSYM table before it ever renders again).
export function estimateRank(net) {
  net = Math.max(0, Math.min(120, net));
  for (let i = 0; i < RANK_ANCHORS.length - 1; i++) {
    const [n1, r1] = RANK_ANCHORS[i], [n2, r2] = RANK_ANCHORS[i + 1];
    if (net >= n1 && net <= n2) {
      const t = (net - n1) / (n2 - n1), mid = Math.round(r1 + (r2 - r1) * t);
      return [Math.round(mid * 0.9), Math.round(mid * 1.12)];
    }
  }
  return [3000, 4000];
}

// deneme sections with real question counts (blank = auto); net may be negative
export const DENEME = {
  TYT: [['Türkçe', 40], ['Sosyal Bilimler', 20], ['Temel Matematik', 40], ['Fen Bilimleri', 20]],
  AYT: [['Türk Dili ve Edebiyatı - Sosyal 1', 40], ['Sosyal Bilimler 2', 40], ['Matematik', 40], ['Fen Bilimleri', 40]],
};

// which dersler matter for each alan (onboarding answer drives çilek)
const ALAN_DERS = {
  'Sayısal': ['Matematik', 'Fizik', 'Kimya', 'Biyoloji'],
  'Eşit Ağırlık': ['Matematik', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya'],
  'Sözel': ['Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü ve Ahlak Bilgisi'],
  'Dil': ['Türk Dili ve Edebiyatı', 'Matematik', 'Tarih', 'Coğrafya'],
};

const PER_DAY = { '2 saat': 1, '4 saat': 2, '6 saat': 3, '8+ saat': 4 };
const perDay = () => PER_DAY[(S.user && S.user.hours) || ''] || 2;

// ---- prerequisite chains (Damla, 2026-07-10: "bir prerequisite zinciri kur") ----
// Keys are "grade|unit name" within a ders; a unit is UNLOCKED when every prereq is ≥50% green.
// Units with no entry have no prereqs (always unlocked). Standard YKS pedagogy, unit level only.
// Foundational units (many dependents) rank first, dead-ends like Mantık (no dependents) sink - // fixes the "sürekli mantık öneriyor" loop.
const PREREQ = {
  'Matematik': {
    '10|Fonksiyonlar': ['9|Kümeler', '9|Denklemler ve Eşitsizlikler'],
    '10|Polinomlar': ['9|Denklemler ve Eşitsizlikler'],
    '10|İkinci Dereceden Denklemler': ['10|Polinomlar'],
    '10|Sayma ve Olasılık': ['9|Kümeler'],
    '10|Dörtgenler ve Çokgenler': ['9|Üçgenler'],
    '10|Uzay Geometri': ['10|Dörtgenler ve Çokgenler'],
    '11|Trigonometri': ['9|Üçgenler', '10|Fonksiyonlar'],
    '11|Analitik Geometri': ['9|Denklemler ve Eşitsizlikler', '9|Üçgenler'],
    '11|Fonksiyonlarda Uygulamalar': ['10|Fonksiyonlar', '10|İkinci Dereceden Denklemler'],
    '11|Denklem ve Eşitsizlik Sistemleri': ['10|İkinci Dereceden Denklemler'],
    '11|Çember ve Daire': ['9|Üçgenler'],
    '11|Uzay Geometri': ['10|Uzay Geometri'],
    '11|Olasılık': ['10|Sayma ve Olasılık'],
    '12|Üstel ve Logaritmik Fonksiyonlar': ['10|Fonksiyonlar'],
    '12|Diziler': ['10|Fonksiyonlar'],
    '12|Trigonometri': ['11|Trigonometri'],
    '12|Dönüşümler': ['11|Analitik Geometri'],
    '12|Türev': ['11|Fonksiyonlarda Uygulamalar', '12|Üstel ve Logaritmik Fonksiyonlar'],
    '12|İntegral': ['12|Türev'],
    '12|Analitik Geometri': ['11|Analitik Geometri'],
  },
  'Fizik': {
    '9|HAREKET VE KUVVET': ['9|FİZİK BİLİMİNE GİRİŞ'],
    '9|ENERJİ': ['9|HAREKET VE KUVVET'],
    '10|ELEKTRİK VE MANYETİZMA': ['9|ELEKTROSTATİK'],
    '11|KUVVET VE HAREKET': ['9|HAREKET VE KUVVET', '9|ENERJİ'],
    '11|ELEKTRİK VE MANYETİZMA': ['10|ELEKTRİK VE MANYETİZMA'],
    '12|ÇEMBERSEL HAREKET': ['11|KUVVET VE HAREKET'],
    '12|BASİT HARMONİK HAREKET': ['11|KUVVET VE HAREKET'],
    '12|DALGA MEKANİĞİ': ['10|DALGALAR'],
    '12|MODERN FİZİK': ['12|ATOM FİZİĞİNE GİRİŞ VE RADYOAKTİVİTE'],
  },
};

const ukey = u => `${u.grade || ''}|${u.name}`;

function unitGreenPct(ders, u) {
  const kz = u.konular.flatMap(k => k.kazanimlar);
  if (!kz.length) return 100;
  const green = kz.filter(z => S.status[kuid(ders.ders, z.code)] === 'green').length;
  return green / kz.length * 100;
}

// dependents count per unit (how many other units need me) - foundational value
function dependents(dersName) {
  const map = PREREQ[dersName] || {};
  const cnt = {};
  Object.values(map).forEach(reqs => reqs.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; }));
  return cnt;
}

// order a ders's units: unlocked first; among unlocked, more dependents first (foundations),
// then curriculum order. Locked units wait for their prereqs.
export function orderedUnits(ders) {
  const map = PREREQ[ders.ders] || {};
  const dep = dependents(ders.ders);
  const pct = {}; ders.units.forEach(u => { pct[ukey(u)] = unitGreenPct(ders, u); });
  const unlocked = u => (map[ukey(u)] || []).every(r => (pct[r] ?? 100) >= 50);
  return ders.units
    .map((u, i) => ({ u, i, open: unlocked(u), dep: dep[ukey(u)] || 0 }))
    .sort((a, b) => (b.open - a.open) || (b.dep - a.dep) || (a.i - b.i))
    .map(x => x.u);
}

export function analyzeWeak() {
  const alan = (S.user && S.user.target) || '';
  const primary = new Set(ALAN_DERS[alan] || DB.dersler.map(d => d.ders));
  const rows = DB.dersler.map(ders => {
    const kz = ders.units.flatMap(u => u.konular.flatMap(k => k.kazanimlar));
    const green = kz.filter(z => S.status[kuid(ders.ders, z.code)] === 'green').length;
    const pct = kz.length ? Math.round(green / kz.length * 100) : 100;
    return { ders: ders.ders, dersObj: ders, pct, remaining: kz.length - green, prim: primary.has(ders.ders) };
  });
  const open = rows.filter(r => r.remaining > 0);
  const pool = open.filter(r => r.prim);
  const best = (pool.length ? pool : open.length ? open : rows).sort((a, b) => a.pct - b.pct)[0];
  const scheduled = new Set(S.events.map(e => e.code));
  // prerequisite-aware ordering: foundations first, locked units wait (Damla, 2026-07-10)
  const cands = orderedUnits(best.dersObj).flatMap(u => u.konular.flatMap(k => k.kazanimlar.map(z => ({ ...z, uid: kuid(best.dersObj.ders, z.code) }))))
    .filter(z => (S.status[z.uid] || 'none') !== 'green' && !scheduled.has(z.uid));
  // review-due ambers first (spaced repetition), then untouched ones in curriculum order
  const amber = cands.filter(z => S.status[z.uid] === 'amber');
  const fresh = cands.filter(z => S.status[z.uid] !== 'amber');
  const plan = [...amber, ...fresh].slice(0, Math.min(perDay() * 5, 15));  // weekly load = daily pace x 5 days
  return { ...best, plan };
}

export function dailyKaz() {
  const today = todayKey();
  if (S.dailyKaz && S.dailyKaz.date === today) { const z = findKaz(S.dailyKaz.code); if (z) return z; }
  const w = analyzeWeak();
  const pick = w.plan[0] || allKaz().find(z => (S.status[z.uid] || 'none') !== 'green') || allKaz()[0];
  S.dailyKaz = { date: today, code: pick.uid }; save();
  return findKaz(pick.uid) || pick;  // plan items are raw (no .ders); findKaz returns the enriched record
}

// day-based scheduling (takvim is day-level; hours are optional and picked in the daily program).
// Fills days from today forward, at most perDay() tasks per day counting what's already there.
function daydSlots(count, startBusy) {
  const load = { ...startBusy };
  const n = perDay(), out = [];
  for (let d = 0; out.length < count && d < 90; d++) {
    const dt = new Date(); dt.setHours(0, 0, 0, 0); dt.setDate(dt.getDate() + d);
    const ds = dstr(dt);
    while ((load[ds] || 0) < n && out.length < count) { load[ds] = (load[ds] || 0) + 1; out.push(ds); }
  }
  return out;
}
function dayLoad(fromDate) {
  const load = {};
  S.events.forEach(e => { if (e.date >= fromDate) load[e.date] = (load[e.date] || 0) + 1; });
  return load;
}

export function generatePlan(kazList) {
  const slots = daydSlots(kazList.length, dayLoad(todayKey()));
  kazList.slice(0, slots.length).forEach((z, i) => {
    S.events.push({ id: 'e' + Date.now() + i, date: slots[i], h: null, code: z.uid, author: 'coach', done: false });
  });
  save();
}

// missed-day rebalance: undone past tasks move forward into open days starting today
export function rebalance() {
  const today = todayKey();
  const missed = S.events.filter(e => !e.done && e.date < today);
  if (!missed.length) return 0;
  const slots = daydSlots(missed.length, dayLoad(today));
  missed.forEach((e, i) => { if (slots[i]) { e.date = slots[i]; e.h = null; } });
  S.rebalanced = { date: today, n: missed.length };  // user informed once on the Bugün screen
  save();
  return missed.length;
}

// ---- çilek explain-evaluation (Damla: "oha" tool, zero API) ----
// HONEST METHOD, heavily sourced: rule-based concept-coverage against the OFFICIAL MEB açıklama
// of the kazanım - no LLM, no fabrication. Key concepts = content words of the MEB text;
// coverage = does the student's text mention them (Turkish-suffix-tolerant stem match).
const STOP = new Set(('ve veya ile için gibi göre kadar sonra önce üzerinde arasında bu şu o bir iki üç dört beş her tüm bazı diğer aynı farklı olan olarak olduğu olduğunu vurgulanır belirtilir verilir yapılır sağlanır edilir ele alınır alır değinilir üzerinde durulur kısaca ayrıca örneklerle örnekler açıklanır açıklar ilişkin ilgili genel özel konusunda hakkında yer alan almaz').split(' '));
const stem = w => { const n = (w || '').toLocaleLowerCase('tr').replace(/[^a-zçğıöşü]/g, ''); return n.slice(0, Math.max(4, Math.min(6, n.length))); };
const contentWords = t => (t || '').split(/[\s,;.:()'" -  - -]+/).map(w => w.toLocaleLowerCase('tr')).filter(w => w.length > 3 && !STOP.has(w));

export function cilekEvaluate(studentText, kaz) {
  const src = (kaz.aciklama || kaz.title || '');
  const terms = [...new Map(contentWords(src).map(w => [stem(w), w])).values()].slice(0, 18);
  const studentStems = new Set(contentWords(studentText).map(stem));
  const found = terms.filter(t => studentStems.has(stem(t)));
  const missing = terms.filter(t => !studentStems.has(stem(t)));
  const score = terms.length ? Math.round(found.length / terms.length * 100) : 0;
  return {
    score, found, missing,
    verdict: score >= 70 ? 'green' : score >= 35 ? 'amber' : 'red',
    // sources actually used for THIS evaluation - shown to the user, always
    sources: [
      { name: `MEB kazanım ${kaz.code} açıklaması`, detail: src || '(bu kazanımın ek açıklaması yok - başlık esas alındı)' },
      { name: 'TTKB "2026 YKS\'ye esas konu ve kazanımlar" (resmî PDF)', detail: 'ttkb.meb.gov.tr - projedeki kopya: data/kazanimlar/2026_yks_kazanimlar.pdf' },
    ],
    method: 'Kural tabanlı kavram kapsama analizi: resmî MEB açıklamasındaki içerik kelimeleri çıkarılır, senin metninde geçip geçmediğine bakılır (ek toleranslı kök eşleme). Yapay zekâ modeli KULLANILMAZ; internete hiçbir şey gönderilmez, her şey tarayıcında hesaplanır.',
  };
}

export function siraPuani() {
  const t = totals();
  const lastTyt = S.denemeler.filter(d => d.type === 'TYT').slice(-1)[0];
  const net = lastTyt ? lastTyt.net : 0;
  const st = streak();
  const reps = Object.values(S.reps).reduce((a, b) => a + b, 0);
  const parts = [
    { k: 'Net', raw: net, w: 4, val: Math.round(net * 4) },
    { k: 'İstikrar (seri)', raw: st, w: 3, val: st * 3 },
    { k: 'Kazanım ilerlemesi', raw: t.greenPct + '%', w: 2, val: t.greenPct * 2 },
    { k: 'Çalışma tekrarı', raw: reps, w: 1, val: reps * 1 },
  ];
  return { total: parts.reduce((a, p) => a + p.val, 0), parts };
}
