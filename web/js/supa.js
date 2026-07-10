// meyvetabagi — Supabase layer: auth + two-way sync.
// Inactive when config.js is empty (app stays local). Server wins on login;
// guest data migrates to the account on signUp. Debounced push after every save().
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { S, save, setOnSave, todayKey } from './state.js';

export const online = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
let client = null, user = null, pushT = null;

export const currentUser = () => user;

// ---- sync status: ok | pending | error (UI listens via 'syncstate' window event) ----
let syncState = 'ok', retryT = null, retryDelay = 5000;
export const syncStatus = () => syncState;
function setSync(st) { if (syncState !== st) { syncState = st; window.dispatchEvent(new CustomEvent('syncstate', { detail: st })); } }

// map raw auth/api errors to honest Turkish (wrong password vs no such user vs network)
export function authErrMsg(e) {
  const m = (e && e.message) || '';
  if (/invalid login credentials/i.test(m)) return 'E-posta ya da şifre hatalı';
  if (/email not confirmed/i.test(m)) return 'E-postanı doğrulaman gerekiyor — gelen kutunu kontrol et';
  if (/already registered/i.test(m)) return 'Bu e-postayla zaten hesap var — giriş yapmayı dene';
  if (/rate limit|too many/i.test(m)) return 'Çok fazla deneme — biraz bekleyip tekrar dene';
  if (/failed to fetch|network|load failed|fetch failed/i.test(m)) return 'Bağlantı kurulamadı — internetini kontrol et';
  if (/password should be|at least 6/i.test(m)) return 'Şifre en az 6 karakter olmalı';
  if (/invalid.*email|unable to validate email/i.test(m)) return 'E-posta adresi geçersiz görünüyor';
  return m || 'Bir şeyler ters gitti — tekrar dene';
}

export async function initSupa() {
  if (!online()) return null;
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await client.auth.getSession();
  user = (data.session && data.session.user) || null;
  // session lifecycle: token revoked/expired elsewhere -> back to login, local copy kept.
  // our own signOut() nulls `user` first, so this only fires for unexpected sign-outs.
  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT' && user) {
      user = null; setOnSave(null);
      window.dispatchEvent(new Event('authgone'));
    }
  });
  if (user) { await pullAll(); setOnSave(queuePush); }
  return user;
}

export async function signUp(email, password, prof) {
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.session) {                   // email confirmation is ON: try direct sign-in, else surface it
    const s2 = await client.auth.signInWithPassword({ email, password });
    if (s2.error) throw new Error('E-posta doğrulaması gerekiyor — gelen kutunu kontrol et');
    user = s2.data.user;
  } else {
    user = data.user;
  }
  await client.from('profiles').upsert({ id: user.id, ...prof });
  await pushAll();                       // guest data migrates to the account
  setOnSave(queuePush);
  return user;
}

export async function signIn(email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  user = data.user;
  await pullAll();                       // account is the source of truth
  setOnSave(queuePush);
  return user;
}

export async function signOut() {
  user = null; setOnSave(null);          // before the await so onAuthStateChange sees an expected sign-out
  if (client) await client.auth.signOut();
}

export async function resetPassword(email) {
  const dir = location.origin + location.pathname.replace(/[^/]*$/, '');
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: dir + 'sifre-yenile.html' });
  if (error) throw error;
}

// KVKK: permanent in-app deletion — delete_me() RPC removes auth.users row, FKs cascade everything
export async function deleteAccount() {
  const { error } = await client.rpc('delete_me');
  if (error) throw error;
  user = null; setOnSave(null);
  await client.auth.signOut().catch(() => {});
}

// ---- pull: server -> S ----
async function pullAll() {
  const uid = user.id;
  const [prof, sts, nts, evs, dns, act, dly] = await Promise.all([
    client.from('profiles').select('*').eq('id', uid).maybeSingle(),
    client.from('statuses').select('*').eq('user_id', uid),
    client.from('notes').select('*').eq('user_id', uid),
    client.from('events').select('*').eq('user_id', uid),
    client.from('denemeler').select('*').eq('user_id', uid),
    client.from('activity').select('*').eq('user_id', uid),
    client.from('dailies').select('*').eq('user_id', uid).eq('day', todayKey()),
  ]);
  if (prof.data) S.user = { name: prof.data.name, email: user.email, target: prof.data.target, grade: prof.data.grade, hours: prof.data.hours };
  if (prof.data) S.theme = prof.data.theme || S.theme;
  S.status = {}; S.reps = {}; S.repDay = {};
  (sts.data || []).forEach(r => { S.status[r.code] = r.status; if (r.reps) S.reps[r.code] = r.reps; if (r.rep_day) S.repDay[r.code] = r.rep_day; });
  S.notes = {}; (nts.data || []).forEach(r => { S.notes[r.code] = r.body; });
  S.events = (evs.data || []).map(r => ({ id: r.id, date: r.date, h: r.hour, code: r.code, author: r.author, done: r.done }));
  S.denemeler = (dns.data || []).map(r => ({ id: r.id, date: r.date, type: r.type, net: +r.net }));
  S.activity = {}; (act.data || []).forEach(r => { S.activity[r.day] = r.count; });
  const d0 = (dly.data || [])[0];
  if (d0) { S.dailyKaz = { date: d0.day, code: d0.code }; S.dailyGraded = d0.graded ? d0.day : ''; }
  save();
}

// ---- push: S -> server (full mirror; local deletions delete server rows too) ----
// On failure (offline, server hiccup): state -> error, retry with backoff + on 'online' event. No silent loss.
async function pushAll() {
  if (!user) return;
  setSync('pending');
  try { await doPush(); retryDelay = 5000; setSync('ok'); }
  catch (e) {
    console.warn('sync push error:', e.message);
    setSync('error');
    clearTimeout(retryT);
    retryT = setTimeout(pushAll, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60000);
  }
}

async function doPush() {
  const uid = user.id;
  const stRows = Object.keys(S.status).map(code => ({
    user_id: uid, code, status: S.status[code], reps: S.reps[code] || 0, rep_day: S.repDay[code] || null,
  }));
  const ntRows = Object.entries(S.notes).filter(([, b]) => b && b.trim()).map(([code, body]) => ({ user_id: uid, code, body }));
  const evRows = S.events.map(e => ({ id: e.id, user_id: uid, code: e.code, date: e.date, hour: e.h, author: e.author, done: e.done }));
  const dnRows = S.denemeler.map(d => ({ id: d.id, user_id: uid, date: d.date, type: d.type, net: d.net }));
  const acRows = Object.entries(S.activity).map(([day, count]) => ({ user_id: uid, day, count }));
  const ops = [
    client.from('profiles').upsert({ id: uid, name: (S.user && S.user.name) || '', target: S.user && S.user.target, grade: S.user && S.user.grade, hours: S.user && S.user.hours, theme: S.theme }),
  ];
  if (stRows.length) ops.push(client.from('statuses').upsert(stRows));
  if (ntRows.length) ops.push(client.from('notes').upsert(ntRows));
  if (evRows.length) ops.push(client.from('events').upsert(evRows));
  if (dnRows.length) ops.push(client.from('denemeler').upsert(dnRows));
  if (acRows.length) ops.push(client.from('activity').upsert(acRows));
  if (S.dailyKaz) ops.push(client.from('dailies').upsert({ user_id: uid, day: S.dailyKaz.date, code: S.dailyKaz.code, graded: S.dailyGraded === S.dailyKaz.date }));
  // id-based cleanup so calendar × and deneme deletes propagate
  const evIds = S.events.map(e => e.id), dnIds = S.denemeler.map(d => d.id);
  ops.push(evIds.length
    ? client.from('events').delete().eq('user_id', uid).not('id', 'in', `(${evIds.map(i => `"${i}"`).join(',')})`)
    : client.from('events').delete().eq('user_id', uid));
  ops.push(dnIds.length
    ? client.from('denemeler').delete().eq('user_id', uid).not('id', 'in', `(${dnIds.map(i => `"${i}"`).join(',')})`)
    : client.from('denemeler').delete().eq('user_id', uid));
  const results = await Promise.all(ops);
  const err = results.find(r => r.error);
  if (err) throw new Error(err.error.message);
}

function queuePush() { clearTimeout(pushT); setSync('pending'); pushT = setTimeout(pushAll, 1500); }
window.addEventListener('beforeunload', () => { if (pushT) { clearTimeout(pushT); pushAll(); } });
window.addEventListener('online', () => { if (user && syncState === 'error') { clearTimeout(retryT); pushAll(); } });
