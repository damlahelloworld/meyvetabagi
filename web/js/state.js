// inkbee - localStorage state: load/save, migrations, activity, streak, theme.
const KEY = 'inkbee.v1';

export let S = load();
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
let _onSave = null;
export function setOnSave(fn) { _onSave = fn; }  // supabase sync hooks in here

export function wipeLocal() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch { /* storage full or blocked (Safari private mode) - keep running in-memory */ }
  if (_onSave) _onSave();
}

// debounced save (for per-keystroke flows like notes); flush pending save on tab close
let _saveT = null;
export function saveSoon() { clearTimeout(_saveT); _saveT = setTimeout(save, 300); }
window.addEventListener('beforeunload', () => { if (_saveT) { clearTimeout(_saveT); save(); } });

// defaults + migrations
S.status = S.status || {};        // code -> red|amber|green
S.notes = S.notes || {};          // code -> text
S.reps = S.reps || {};            // code -> times studied
S.repDay = S.repDay || {};        // code -> 'YYYY-MM-DD' last rep (max one rep per day per kazanım)
S.theme = S.theme || 'light';
if (!S._themeReset) { S.theme = 'light'; S._themeReset = true; }  // one-time reset to the new white default
S.user = S.user || null;          // {name, email, target, grade, hours}
S.activity = S.activity || {};    // 'YYYY-MM-DD' -> completed count
S.randevu = S.randevu || [];      // [{id, date, time}] booked coach appointments
S.dailyKaz = S.dailyKaz || null;  // {date, code} - the day's kazanım to explain
S.dailyGraded = S.dailyGraded || ''; // 'YYYY-MM-DD' the daily explain was graded
S.messages = S.messages || [{ from: 'coach', text: 'Merhaba! Takıldığın yeri buraya yazabilirsin - Damla bağlandığında burada görecek.' }];
if (S.events && S.events[0] && S.events[0].date === undefined) S.events = [];  // migrate old weekday model
S.events = (S.events || []).filter(e => !/^e[0-4]$/.test(e.id));               // migrate: drop old fabricated seed events
S.denemeler = (S.denemeler || []).filter(d => !(d.date === '2026-06-15' && d.net === 78.5)); // migrate: drop fabricated seed deneme
S.denemeler.forEach((d, i) => { if (!d.id) d.id = 'd' + Date.now() + i; });                 // migrate: stable ids for sync

export function applyTheme() { document.body.classList.toggle('dark', S.theme === 'dark'); }

export const dstr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayKey = () => dstr(new Date());

// activity: bump on completion, unbump when a completion is undone (anti-inflation)
export function bump() { const k = todayKey(); S.activity[k] = (S.activity[k] || 0) + 1; }
export function unbump() { const k = todayKey(); S.activity[k] = Math.max(0, (S.activity[k] || 0) - 1); }

// reps: at most one per kazanım per day; returns whether it counted
export function addRep(code) {
  const t = todayKey();
  if (S.repDay[code] === t) return false;
  S.reps[code] = (S.reps[code] || 0) + 1;
  S.repDay[code] = t;
  return true;
}

// streak: today counts when studied, but an empty today doesn't break yesterday's run (day isn't over)
export function streak() {
  let s = 0; const d = new Date(); d.setHours(0, 0, 0, 0);
  if (!((S.activity[dstr(d)] || 0) > 0)) d.setDate(d.getDate() - 1);
  while ((S.activity[dstr(d)] || 0) > 0) { s++; d.setDate(d.getDate() - 1); }
  return s;
}
