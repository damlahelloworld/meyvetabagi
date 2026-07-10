// meyvetabagi — MEB kazanım DB (official 2026 YKS PDF parse) + lookups. Read-only master list.
// IMPORTANT: raw MEB codes are per-ders and COLLIDE across dersler (367/955 duplicates,
// e.g. Matematik 9.1.1.1 vs Fizik 9.1.1.1). The canonical key everywhere is the UID
// 'slug:code' (e.g. 'mat:9.1.1.1'); bare codes are display-only.
import { S, save } from './state.js';

export const DERS_SLUG = {
  'Matematik': 'mat', 'Fizik': 'fiz', 'Kimya': 'kim', 'Biyoloji': 'biy',
  'Türk Dili ve Edebiyatı': 'ede', 'Tarih': 'tar', 'Coğrafya': 'cog',
  'Felsefe': 'fel', 'Din Kültürü ve Ahlak Bilgisi': 'din',
};
export const kuid = (dersName, code) => (DERS_SLUG[dersName] || 'x') + ':' + code;

export let DB = null;
let _kaz = null, _map = null;
let _sorular = {};  // uid -> [question objects]
let _terimler = {}; // uid -> [ {terim, tanim, source} ]

export async function loadDB() {
  const r = await fetch('data/kazanimlar.json');
  DB = await r.json();
  _kaz = null; _map = null;
  migrateToUid();
  try {
    const sr = await fetch('data/sorular.json');
    const sj = await sr.json();
    _sorular = {};
    (sj.sorular || []).forEach(q => { (_sorular[q.uid] = _sorular[q.uid] || []).push(q); });
  } catch { _sorular = {}; }
  try {
    const tr = await fetch('data/terimler.json');
    _terimler = await tr.json();
  } catch { _terimler = {}; }
  return DB;
}

export function sorularFor(uid) { return _sorular[uid] || []; }
export function soruSayisi() { return Object.values(_sorular).reduce((a, b) => a + b.length, 0); }
export function terimlerFor(uid) { return _terimler[uid] || []; }

export function allKaz() {
  if (_kaz) return _kaz;
  _kaz = DB.dersler.flatMap(d => d.units.flatMap(u => u.konular.flatMap(k =>
    k.kazanimlar.map(z => ({ ...z, uid: kuid(d.ders, z.code), ders: d, unit: u, konu: k })))));
  _map = {}; _kaz.forEach(z => _map[z.uid] = z);
  return _kaz;
}
// resolves a UID; falls back to bare legacy codes (last ders wins — mirrors the old buggy map)
export function findKaz(key) {
  allKaz();
  if (_map[key]) return _map[key];
  let hit = null; _kaz.forEach(z => { if (z.code === key) hit = z; });
  return hit;
}

export function unitProgress(u, dersName) {
  const all = u.konular.flatMap(k => k.kazanimlar);
  const g = all.filter(z => S.status[kuid(dersName, z.code)] === 'green').length;
  return all.length ? Math.round(g / all.length * 100) : 0;
}
export function totals() {
  const all = allKaz();
  const c = { red: 0, amber: 0, green: 0, none: 0 };
  all.forEach(z => c[S.status[z.uid] || 'none']++);
  return { ...c, total: all.length, greenPct: Math.round(c.green / all.length * 100) };
}

// one-time migration: old state used bare codes as keys (collision bug) — remap to UIDs
// using last-ders-wins, which is exactly what the old lookup displayed.
function migrateToUid() {
  if (S._uidMig) return;
  const bare = {};
  DB.dersler.forEach(d => d.units.forEach(u => u.konular.forEach(k =>
    k.kazanimlar.forEach(z => { bare[z.code] = kuid(d.ders, z.code); }))));
  const remapObj = o => {
    const out = {};
    Object.entries(o || {}).forEach(([k, v]) => { out[bare[k] || k] = v; });
    return out;
  };
  S.status = remapObj(S.status); S.notes = remapObj(S.notes);
  S.reps = remapObj(S.reps); S.repDay = remapObj(S.repDay);
  (S.events || []).forEach(e => { if (bare[e.code]) e.code = bare[e.code]; });
  if (S.dailyKaz && bare[S.dailyKaz.code]) S.dailyKaz.code = bare[S.dailyKaz.code];
  S._uidMig = true;
  save();
}
