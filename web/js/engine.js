// meyvetabagi — çilek engine (rule-based) + exam math. Grounded in the student's real data, no fabrication.
import { S, save, dstr, todayKey, streak } from './state.js';
import { DB, allKaz, findKaz, totals, kuid } from './data.js';

export const EXAM = new Date('2026-06-20'); // YKS 2026 TYT date; becomes per-season config with backend

// KAYNAK YOK — placeholder anchors, must be replaced with a real ÖSYM year table before launch.
// Kept only so the prototype flow works; UI always labels the output "tahmini".
const RANK_ANCHORS = [[0, 2400000], [20, 1200000], [40, 650000], [60, 300000], [80, 120000], [100, 35000], [110, 12000], [120, 3000]];

// PARKED (Damla, 2026-07-10): rank mechanic undesigned — no view calls this until she designs it
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
  AYT: [['Türk Dili ve Edebiyatı – Sosyal 1', 40], ['Sosyal Bilimler 2', 40], ['Matematik', 40], ['Fen Bilimleri', 40]],
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
  const cands = best.dersObj.units.flatMap(u => u.konular.flatMap(k => k.kazanimlar.map(z => ({ ...z, uid: kuid(best.dersObj.ders, z.code) }))))
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
