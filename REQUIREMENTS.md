# Sıra Sende — everything Damla asked (single source)

Compiled 2026-07-09. Status: ✅ done · 🟡 partial · ⬜ not started · ⛔ blocked.
Nothing invented — this is only what Damla said, gathered.

## 1. Vision & positioning
- ⬜ **MEB + kazanım = the whole spine.** Everything anchored to the official MEB kazanım list, traceable, no fabrication. *(principle, holding)*
- ⬜ **Damla = founder-coach.** Her record (Bilkent CS + Medipol Med, cracked YKS twice) IS the brand/trust. Put her story in onboarding/coach card/landing.
- ⬜ **Business model:** money & scale. Coaching hours = prestige/high tier (capped). App subscription = the real scalable money. Content (YT/IG) = distribution. Goal: product scales beyond her hours.
- ⬜ Beat Baykuş **as a product, not a coach-marketplace** (they own coach supply; we own the daily student product).
- ⬜ **First 400 users free, then paid** (launch scarcity; counter flips to paywall after 400).
- ⬜ **Exclusive layer "Damla's Class"** — application-gated premium: kazanım-explanation admission test → tier/class placement. BUT base app stays open (don't gate the whole funnel). plainsight-style prestige aesthetic for premium/landing.
- ⬜ **Free users must genuinely succeed** so they retain (success = retention, not gimmicks).

## 2. Core product — the spine, 4 uses
- ✅ Checklist: each kazanım red/yellow/green.
- ✅ Notes under each kazanım.
- ✅ Calendar + coach (drag-drop).
- 🟡 Leaderboard → became multi-parameter Sıra Puanı (real multi-user board needs backend).
- ✅ **All extractable subjects** — 9 ders / 955 kazanım (Edebiyat, Din, Tarih, Coğrafya, Mat, Fizik, Kimya, Biyoloji, Felsefe) + scroll.
- ✅ **Daily kazanım-explanation** (active recall): explain in a box → compare with real MEB açıklama → self-grade.
- ✅ **"Öğrendim" clickable multiple times** — rep counter (same kazanım studied repeatedly).
- ✅ **Calendar** — Google-Calendar-style drag-drop, real dates, prev/next week.
- 🟡 **Deneme**: D/Y → net = D−Y/4 → estimated ranking range. ⬜ **Detailed mode** (tag wrong → kazanım → turns red → feeds coach) NOT built.
- 🟡 **Ranking** — real multi-parameter Sıra Puanı (net/streak/kazanım/reps); fake names removed. Real cohort needs backend.

## 3. Competition & social (mostly backend)
- ⬜ **Live events** — moderator (Damla) pushes an event (e.g. "2027 MSÜ"), everyone enters nets → live statistics/leaderboard for that event. App stays dynamic.
- ⬜ **Leagues** (Kunduz/Duolingo style) — weekly tiers, XP, streak, promotion/relegation.
- ⬜ **Verification / anti-cheat** — karne photo upload → verified badge; anomaly detection.
- ⬜ **Yüzdelik dilim (percentile)** stat (Baykuş has it).

## 4. Coach side (Damla) + appointments
- 🟡 **Randevu (student books from Damla, Bekir-Avşar style)** — student side done (book/cancel slots). ⬜ **Damla's side** (set availability, see who booked, edit each student's plan drag-drop, see each student's progress %) needs backend/multi-user.
- ✅ Coach recommendation — real, computed from student data (weakest ders) + "generate weekly plan" into calendar.
- ⬜ **Chat** coach↔student (Baykuş has, we don't).

## 5. Features they have, we don't (from Kunduz/Baykuş research)
- ⬜ **Kronometre / study-time tracking** (Baykuş) — we count completions, not hours.
- ⬜ Chat (above).
- ⬜ Yüzdelik dilim (above).
- ⬜ Optik-form deneme entry; ⬜ seviye tespit / diagnostic test.
- ⬜ (expensive, later) question bank, video solutions, live lessons, Deneme Kulübü.

## 6. AI (real, not fake)
- 🟡 Coach engine is real rule-based grounding now. ⬜ **Real Claude API**: grade daily explanations, wrong-answer pattern analysis, plan optimization, (later) question generation. Needs backend.

## 7. Design / UI
- ✅ **Bear.app style** — near-white/clean, NOT sepia/yellow.
- ✅ **Dark mode default + light toggle.**
- ✅ Clean sans font (no system-generic, no serif).
- ✅ **Pink accent (not red)**, toned down (not too pink everywhere).
- ✅ **No colored borders anywhere** (whole site).
- ✅ No emojis.
- ✅ Membership screen + multi-step onboarding (asks name, greets by name; alan/sınıf/hours).
- ✅ Profile / settings / login-logout.
- ✅ Commit-square activity heatmap (per-day intensity).
- ⬜ **Landing redesign** — still generic, needs distinctive frontend pass.
- ⬜ **Resizable/collapsible columns** (fixed-width pool + nav feels cramped).
- ✅ (praise) aesthetics good, drag-drop good.

## 8. Platform / tech
- ⬜ **Not just web — cloud + iOS + Android.**
- ⬜ **Backend: Supabase** (Postgres + auth + realtime), real accounts, multi-user.
- ⬜ **Cross-platform: Expo/React Native** — one codebase → iOS + Android + web.
- Current: browser prototype, localStorage, single user (design/logic/data-model proof; carries over).

## 9. Working-style rules (Damla)
- Don't ask "which next" when told to do everything — do the whole list in order.
- No fabrication, don't add/remove beyond what she said.
- Don't caveat-bomb her business vision — engineer, not brake.

## 10. Blocked (source problem, needs OCR / different extraction)
- ⛔ **Mantık / Sosyoloji / Psikoloji** — garbled embedded font in the PDF ("0DQWÕN"), text unreadable.
- ⛔ **İnkılap** — two columns merged, kazanım texts truncated.
- ⛔ **Foreign languages (İngilizce etc.)** — CEFR prose, no discrete kazanım codes.

---
### Critical path
The wall between prototype and a real Kunduz/Baykuş-grade brand = **Faz 1: Supabase backend + Expo (iOS/Android/web)**. Everything in §3, §4 (coach side), §6 becomes real only after it. Content (§1 distribution) can start in parallel today.
