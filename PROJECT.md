# meyvetabagi — PROJECT

Name: **meyvetabagi** (locked). Amme-hizmeti YKS tool, ücretsiz, no coaching/ranking/paywall.
Status: **CANLI YAYINDA** https://nosey-dewdrop.github.io/meyvetabagi/ (2026-07-10). Design style law + product shape + content pipeline all shipped.

Last session (2026-07-10, marathon): rebrand meyvetabagi, coaching removed, Blok B backend hardened, own public repo, 23 MEB books + 448 key terms, month-grid takvim, full-width konular, design language settled (white+vivid+Arial+rainbow+sparkle, NO purple), SEO (meta/JSON-LD/sitemap), security pass clean, DEPLOYED live to GitHub Pages, fresh landing page.
Open: live 2-device test, Search Console sitemap submit, sozel ders book terms, deeper per-kazanim SEO + question bank (parked).

---

## Brand & positioning (Damla, 2026-07-10)

- Single brand **meyvetabagi** for the whole YKS universe; the earlier name "Sıra Sende" was retired 2026-07-10.
- The word **"koç" is BANNED in product copy**. The AI that suggests and evaluates against kazanımlar is named **çilek** (the strawberry in the fruit bowl — more fruits/AIs will join later, e.g. elma). Internal DB role names ('coach') stay — only user-facing copy is affected.
- **KOÇLUK REMOVED ENTIRELY:** no coaching system, no mentors, no invite codes — "ai ve motorumuz çok güçlü olacak, o yeter de artar". The ONLY human in the product is Damla herself: 1-1 randevu with her stays possible, messages come from her. Guidance = çilek + engine. Koç nav tab deleted; chat + randevu live in Profil under "Damla ile birebir".
- Positioning (why this wins): market is split — ugly-cheap tools (~12 TL, Pandorina/Konu Takip) vs corporate coaching (Kopilot ~3.800 TL/ay, Tonguç 8–13k). The ~200–300 TL/ay band is EMPTY. No whimsy YKS app exists (design = genre-first differentiator). Kazanım granularity is the moat: no competitor exposes the official MEB list as the working surface. **Damla = the only human in the product** (Bilkent CS + Medipol Tıp, cracked YKS twice — her story IS the trust brand). Beat Baykuş as a product, not a coach marketplace.

## Revenue model (parked — paywall dropped globally 2026-07-13; kept for reference)

> 2026-07-09 Damla: monetization mechanism is OPEN (hourly coaching by Damla? bookable randevu? AI subscription?). Pricing parked, must NOT appear as settled anywhere public.

- **Freemium.** Free: kazanım checklist + notes + deneme/net entry — free users must GENUINELY succeed (success = retention). Paid: koç program + detailed sıralama + leaderboard/ligler + chat.
- Price: mid band ~200–300 TL/ay. Never positioned "cheap".
- Launch scarcity: first 400 users free, counter flips after.
- "Damla's Class" — application-gated premium tier (kazanım-explain admission test → class placement), plainsight-style prestige. Base app stays open.
- Coaching hours = high tier, capped (prestige, doesn't scale); app subscription = scalable money; B2B seats (dershane/school multi-student licenses) = second engine.

## Architecture

**Current (done):** static web prototype, `web/`, vanilla ES modules + localStorage, single user. Design/logic/data-model proof, carries over. Run: `scripts/serve.sh` → localhost:8080.

**Faz 1 target (THE wall — nothing else matters before it):**
- Backend: **Supabase** — Postgres + Auth + Realtime + row-level security (clean multi-tenant: student / coach / dershane). LIVE (Frankfurt).
- Cross-platform: **Expo/React Native** — one codebase → iOS + Android + web.
- Two data layers, never mixed: master list (MEB kazanım DB, immutable, read-only) vs personal plan (mutable selection/ordering per student). Coach links to students by invite code; every plan item/task stores `author`; coach edits only from the master list.

Data model proven in the prototype (`js/state.js`): status/notes/reps per kazanım code, events {date, hour, code, author, done}, denemeler {date, type, net}, activity per day, randevu, messages.

**What the backend unlocks (in build order):** 1) real accounts + sync (localStorage → Postgres; KVKK same session). 2) Coach panel (Damla side): availability, bookings, per-student progress %, drag-drop plan editing. 3) Chat coach↔student. 4) Leaderboard/Sıra Puanı + weekly leagues (tiers, XP, promotion). 5) Live events (moderator pushes an event, everyone enters nets, live stats). 6) Verification/anti-cheat: karne photo → verified badge; public rank = net + streak, never self-marked green.

## AI design (real, not fake)

- **Grounding, NEVER fine-tuning.** Claude API with the kazanım DB + student's own data as structured context. The engine arranges the official kazanım pool; never invents topics. Everything traceable to MEB.
- Claude API jobs in order of value: 1) Grade the daily kazanım-explain (explanation vs MEB açıklama → feedback + auto R/Y/G). 2) Weekly plan generation (weaknesses + net trend + hours → calendar), replacing/augmenting the rule engine in `js/engine.js`. 3) Wrong-answer pattern analysis (deneme detailed mode). 4) Question generation — CONFIRMED 2026-07-09 ("kesin üretelim"), priority right after backend. Miss Ducky model: sourced from MEB content, quantitative questions independently answer-verified before publishing. Çıkmış (past ÖSYM) questions serve as CALIBRATION (style, difficulty, distractor logic) only, never hosted/served directly.
- Coach engine today is honest rule-based (`analyzeWeak`/`generatePlan`), labeled as such in the UI.

## Trust rules (non-negotiable — the app lives or dies on these)

1. **2026/2027 YKS = OLD 2018 curriculum.** New Maarif Modeli reaches YKS in **2028**. Wrong curriculum = dead product.
2. No AI fabrication anywhere. Kazanımlar from the official MEB PDF only; online JSONs are AI-fabricated garbage.
3. Sıralama is always "tahmini", always a range, always from a real ÖSYM table. Current `RANK_ANCHORS` in `js/engine.js` are `KAYNAK YOK` = a **launch blocker** — replace with sourced ÖSYM net→rank data per score type (SAY/EA/SÖZ/DİL). AYT shows NO rank until sourced.
4. No hosted ÖSYM past questions (rights unclear) — only public statistics.
5. KVKK: the session that moves user data off-device ships privacy policy + consent + deletion in the SAME session.
6. Anti-gaming: reps max 1/day/kazanım; activity decrements on un-done; public competition only on verifiable metrics.

## Data pipeline

- Source: TTKB "2026 YKS'ye esas konu ve kazanımlar" PDF → `data/kazanimlar/2026_yks_kazanimlar.pdf` (21 MB, official, downloaded). URL: `https://ttkb.meb.gov.tr/meb_iys_dosyalar/2025_11/26164023_2026_yks.pdf`. Codes `sınıf.ünite.konu.kazanım`.
- Parsed: **9 ders / 955 kazanım** (Edebiyat, Din, Tarih, Coğrafya, Mat, Fizik, Kimya, Biyoloji, Felsefe) → `web/data/kazanimlar.json` via `scripts/parse_all.py`.
- Content engine: 23 MEB books fetched (OGM Materyal, ~4537 pages), 448 key terms across 7 dersler; scripts/fetch_kitap.py + build_terimler.py + build_corpus.py. Kaynakça page cites everything (MLA).
- ⛔ Blocked (needs OCR / other extraction): Mantık, Sosyoloji, Psikoloji (garbled embedded font "0DQWÕN"), İnkılap (merged columns), foreign languages (CEFR prose, no discrete codes).

## Code layout & design surface (post 2026-07-09 restructure)

```
web/
  app.html, index.html      static markup only
  css/tokens.css            ALL design tokens — THE theming file (Figma-mappable); dark default + light
  css/base.css              reset, type, 3-column shell
  css/components.css        every component        css/landing.css   landing (extracted)
  js/state.js               localStorage state, migrations, streak/activity/reps
  js/data.js                MEB DB load + lookups
  js/engine.js              coach engine, plan gen, rank estimate (KAYNAK YOK anchors), Sıra Puanı
  js/ui.js  js/router.js    DOM helpers/icons · hash router
  js/views/*.js             bugun konular takvim koc denemeler siralama profil onboard
  refs/throxy.html          design reference
```
Rules: no inline styles in JS (all styling via classes → Damla restyles from CSS/Figma without touching logic); no fabricated data; English in project files; verify with `node --check` + serve, Damla runs visuals herself.

Where to touch what (for Damla): colors/fonts/radius/theme (app-wide) → `web/css/tokens.css` (every color is a variable there). App layout shell (3 cols, sidebar, phone breakpoints) → `web/css/base.css`. Components (cards, buttons, calendar, chips) → `web/css/components.css`. Landing look → `web/css/landing.css` + section markup in `web/index.html`. Landing/legal copy → `web/index.html`, `web/gizlilik.html`. App texts (TR) → inside `web/js/views/*.js` template strings.

## Design

- Current style law (2026-07-10, do NOT redo): white ground + ink, VIVID fruit palette, Arial only, no bold-as-decor, 3px corners, borders soft/light not ink-thick. RAINBOW gradient on: wordmark, nav links (equal size), section labels (lowercase), "damla" name, @damlahelloworld signature (fixed bottom-left). A FEW ambient gold/rose sparkles (~12). **PURPLE IS BANNED** (AI tell; the Taylor Swift "showgirl" dark-glam pass was rejected hard). Grays darkened for readability. tokens.css = the theme bridge.
- Damla owns design direction and will redesign (Figma or manual CSS) — that's WHY styles are separated. Big redesigns need a concrete reference from her first. Landing still needs a distinctive pass (still generic).
- Expected-pattern floor: home = countdown + last net + add-CTA; onboarding = target → days left → hours → level → first plan. Both exist.
- Kept rules: zero inline styles anywhere, no colored borders, no single-side accent edges, no pills.

## Product shape (live)

Amme-hizmeti tool, no coaching/ranking/paywall. 3 nav: **bugün · konular · takvim** (+ profil/ayarlar via avatar menu; mesajlar & logout removed from menu, logout in ayarlar). Home = greeting + growing corpus counters + today's tasks + two doors. Konular = full-width, 4 grade columns (9/10/11/12 with per-grade %), Türk Dili 4 free-flow columns, ders order SAYISAL-first (mat fiz kim biyo türkçe tarih coğ din felsefe), completion as text no bar, "kazanımları sıfırla" at bottom (double confirm). Takvim = real month grid + konu havuzu sidebar (drag OR tap a day then tap pool); kazanım drops onto a DAY (never an hour), task chips GREY, color ONLY = done (green); click a day → GÜNLÜK PROGRAM panel with optional per-task saat. Profil = başardığın kazanımlar rainbow word wall.

Engine day-based: generatePlan/rebalance fill days (perDay cap), h=null. DB events.hour stays NOT NULL → sentinel 0 = "no hour" (mapped in supa.js both ways); proper `drop not null` migration queued (backlog). Rank estimate PARKED (Damla: "sıralama mekaniğini düşünmedim"): denemeler shows net only, estimateRank dormant, Sıra Puanı page untouched (bar link).

## Backend state (live)

Supabase LIVE (Frankfurt). Migration 0003 delete_me ran. Resend SMTP test-mode (onboarding@resend.dev, delivers only to Damla until domain verified). Redirect URL allowed. DB password only with Damla. Security pass clean (no leaked secrets, anon key public-by-design, inputs escaped, 21 RLS policies). Schema (`supabase/migrations/`): 0001_core (profiles role student/coach + invite_code, kazanimlar master read-only, coach_links, statuses/notes/events/denemeler/activity/dailies/messages/randevu + 20 RLS policies), 0002_seed_kazanimlar (955 kazanım), 0003_delete_me.

Client: `js/config.js` (empty = local mode) + `js/supa.js` (auth, pull-on-login server-wins, guest data migrates on signUp, debounced full push). Blok B hardening shipped: password reset page (`sifre-yenile.html`) + forgot-password, in-app account deletion (delete_me RPC), sync indicator, offline retry/backoff (5s→60s cap + online-event retry + beforeunload flush), session-revoked handling (authgone → login overlay), Turkish auth error mapping (`authErrMsg()`), backup ritual documented (weekly pg_dump, stays out of repo). Multi-tab = last-writer-wins (row-level updated_at merge queued).

---

## ROADMAP — 68 AŞAMA (ordered; ☐ open · ☑ done · ⏸ waits on Damla)

### BLOK A — rebrand to meyvetabagi (decided 2026-07-10)
1. ☑ Rename app shell: titles, brand logo ("m" + meyvetabagi), onboarding welcome; "sıra sende" retired (mocks/ kept as history; localStorage key = 'meyvetabagi.v1', old local data dropped).
2. ☑ Koç purged from ALL user-facing copy: Koç nav tab DELETED (koc.js removed), chat + randevu moved to Profil "Damla ile birebir"; "Koç önerisi"→çilek önerisi; who-labels, hints, legend, gizlilik. (DB role 'coach' stays internal.)
3. ☑ AI named çilek in product: suggestion box, plan copy, onboarding subs. Daily-explain feedback speaks as çilek when Edge AI lands (stage 38).
4. ◐ Landing skeleton swapped to meyvetabagi + meta/OG; band headline placeholder "Bu sene bilerek çalış." — wording pass = Damla (with stage 24).
5. ☑ gizlilik.html brand swap + koç-link sentence removed.
6. ⏸ Damla: final wordmark/typography direction for "meyvetabagi".

### BLOK B — harden the live backend (FAZ 0)
7. ☐ Damla live-validates: sign up, mark kazanım, open second browser, same data appears; try "Şifremi unuttum" (tests SMTP). Still the first thing to do before going public.
8. ☑ Password reset + `sifre-yenile.html`. ⏸ Damla: Supabase → Auth → URL Configuration → add site URL as allowed redirect.
9. ☑ In-app account deletion (Profil → type-SİL → delete_me RPC). ⏸ Damla: run 0003_delete_me.sql (already ran per backend state).
10. ☑ Custom SMTP (Resend, test mode). Verify domain + switch sender at deploy (stage 22).
11. ☑ Sync status UX (senkronize / bekliyor / çevrimdışı).
12. ☑ Offline retry (exponential backoff + online-event retry + beforeunload flush).
13. ☑ Session lifecycle (onAuthStateChange → authgone → login overlay).
14. ☑ Multi-tab semantics documented (last-writer-wins; row-level merge at stage 62).
15. ☑ Login errors mapped (`authErrMsg()`, Turkish).
16. ☐ Rate limiting review: verify signup/signin limits sane for launch traffic.
17. ☑ Backup ritual documented (Supabase daily 7-day + weekly manual pg_dump, out of repo).
18. ☐ Secrets hygiene: anon key public-by-design ok; DB password & service_role NEVER in repo.
19. ☑ gizlilik.html rewritten for live backend — re-check at every new data-touching feature.

### BLOK C — repo, deploy, publish
20. ☑ Repo live: github.com/damlahelloworld/meyvetabagi (now public, GitHub Pages). History-clean, .gitignore, only anon key in repo.
21. ⏸ Deploy — GATED: RANK_ANCHORS still KAYNAK YOK (blocker) + stage 25 ship-check + stage 7 live test first.
22. ☐ Custom domain (meyvetabagi.com / .app — Damla buys, wire DNS + HTTPS).
23. ◐ Favicon + manifest.json + theme-color wired into all 4 pages (placeholder pink 'm' until stage 6). Open: OG image, service-worker offline shell.
24. ☐ Landing final copy from Damla (founder quote placeholder empty); fiyat section stays absent until money model decided.
25. ☐ Pre-publish FULL ship-check — blockers zero before the link goes public.

### BLOK D — Damla birebir (FAZ 1; mentor system CANCELLED — koçluk removed, only human is Damla)
26. ☐ Damla's account: role='coach' profile for Damla only (no mentor onboarding, no invite codes — coach_links/invite plumbing stays dormant).
27. ☐ Messages to server: chat localStorage → `messages` table; student ↔ Damla; unread badge.
28. ☐ Damla panel `#/panel` (role-gated): student list — green %, last net, streak, last-active; message inbox.
29. ☐ Real randevu: `slots` table + RLS; Damla defines availability; student books; both cancel; replaces hardcoded 16/18/20.
30. ☐ Realtime subscription: student sees Damla's reply/booking confirmation instantly.
31. ☐ Capacity guard: randevu slots scarce by design (prestige), booked-out honest.
32-36. ~~mentor onboarding, invite redeem RPC, mentor dashboard, mentor CRUD, second-mentor isolation~~ — cancelled with koçluk (multi-tenant RLS stays as foundation).

### BLOK E — çilek AI on Edge Functions (FAZ 2: hidden API)
37. ☐ Edge Function skeleton `cilek`: ANTHROPIC_API_KEY in function env only; input = student snapshot + intent; JSON-schema output validation.
38. ☐ Job 1 — daily-explain grading: yazılı açıklama vs MEB açıklaması → geri bildirim + önerilen R/S/Y; UI'da çilek konuşur.
39. ☐ Job 2 — weekly plan generation: çilek yazıyor (service-role scoped writes, author='coach' flagged as çilek in copy).
40. ☐ Job 3 — wrong-answer pattern analysis (needs stage 44).
41. ☐ Grounding contract: prompt = official kazanım rows + student's own data ONLY; must cite kazanım uid; refuse-on-uncertainty.
42. ☐ Cost control: per-user daily quota table checked in-function; same-input daily cache; token usage log.
43. ☐ Prompt-injection defense: student free text wrapped as data never instructions; output schema-checked before DB.
44. ☐ Deneme detailed mode UI: after save → "yanlışlarını işaretle" → kazanım seç per wrong → auto sarı/kırmızı → feeds plan + çilek.
45. ☐ çilek voice/persona yazımı — Damla'nın kalemi.

### BLOK F — question engine (FAZ 3: "kesin üretelim")
46. ☐ Corpus: MEB ders kitapları PDF'leri, kazanım-başı pasaj → `corpus(uid, source, text)`; izlenebilir.
47. ☐ Çıkmış calibration set: geçmiş ÖSYM soruları SADECE stil/zorluk/çeldirici referansı (asla barındırma).
48. ☐ Generator: Claude, corpus chunk + kazanım grounding; şık+anahtar+çözüm.
49. ☐ Independent verifier: ayrı çağrı soruyu kör çözer, anahtar tutmazsa iptal (sayısalda zorunlu; sözelde rubrik).
50. ☐ Review queue: Damla batch onaylar (onayla/reddet/düzelt).
51. ☐ `questions` table (uid, stem, choices, key, difficulty, source_ref, status) + RLS.
52. ☐ Player UI v1: kazanım detayında "bu kazanımdan 5 soru" mini quiz; yanlış → otomatik sarı.
53. ☐ Rollout order: sözel dersler önce; sayısal ancak verifier kendini kanıtlayınca.

### BLOK G — social & competition (FAZ 4: ⏸ waits on Damla's mechanics design)
54. ⏸ Damla designs the social mechanics (parked with the sıralama question).
55. ☐ Server-computed leaderboard on Sıra Puanı (net+streak weighted; self-marked green never ranks alone).
56. ☐ Weekly leagues: tiers, promotion/relegation, XP.
57. ☐ Live events: Damla opens event, students enter nets, realtime aggregate stats.
58. ☐ Anti-cheat: karne photo upload (Storage) → verified badge; anomaly heuristics.
59. ☐ Yüzdelik dilim stat (Baykuş parity).
60. ⏸ Sıralama data decision: real ÖSYM-derived table per score type, or hide rank until sourced.

### BLOK H — mobile (FAZ 5: Expo)
61. ☐ Expo app: Bugün/Konular/Takvim/Deneme/Profil; supabase-js as-is; tokens.css → TS theme.
62. ☐ Conflict-safe sync v2: row-level `updated_at` merge (multi-device real).
63. ☐ Push notifications: günlük hatırlatma (opt-in) + mesaj bildirimi.
64. ☐ Store presence: App Store + Play listing, PrivacyInfo, ekran görüntüleri.

### BLOK I — money (FAZ 6: ⏸ waits on model decision) + continuous
65. ⏸ Monetization model → TR payment rails (İyzico vs Stripe), entitlements, paywall, "ilk 400" sayacı, B2B dershane seats.
66. ☐ Observability: Sentry (free) before real users; sync error rates visible.
67. ☐ Data ops calendar: 2027 = yeni sınav tarihi config; 2028 = Maarif Modeli yeni PDF + yeni parse; blocked subjects OCR (~200 kazanım) added to master.
68. ☐ Parity backlog + polish: kronometre/study-time, optik form, seviye tespit, accessibility (kontrast/klavye), konular virtualization, Deneme Kulübü, events.hour drop-not-null migration, old-CSS sweep after Damla's design pass.

### DAMLA'S OPEN DECISIONS (gate stages: 6, 24, 45, 54, 60, 65)
1. meyvetabagi wordmark/görsel yön (6) · 2. landing metinleri + founder sözü (24) · 3. çilek'in sesi (45) · 4. sosyal mekanik tasarımı (54) · 5. sıralama verisi göster/gizle (60) · 6. para modeli (65).

### LEARNING MAP — what Damla learns per block (application-layer depth)
Working mode: Claude writes the code, Damla makes the architecture calls — every block Claude opens the design (schema / prompt contract / trade-off) and explains WHY first; a one-paragraph "what we learned" note goes to Damla's Obsidian roadmap at each block's end.

| Blok | Skill Damla walks away with | Interview-grade artifact |
|---|---|---|
| B (harden) | Auth lifecycle (JWT, refresh, revocation), password reset, KVKK deletion as engineering, offline-first sync + retry/backoff, backup discipline | "How do you handle a revoked session / lost connectivity without losing user data?" |
| C (deploy) | Static hosting vs serverless trade-offs, DNS/HTTPS, PWA manifest, pre-launch audit | shipping checklist ownership |
| D (mentor) | Multi-tenant authorization with RLS (live-tested 6/6), security-definer RPCs, realtime websockets, invite-code linking | "Design authorization so tenant A can never read tenant B" — with working SQL |
| E (çilek) | The application-layer LLM stack: RAG (chunking per kazanım → retrieval → grounded prompt), structured output validation, prompt-injection defense, cost/latency engineering | "Did you build RAG / write evals / control LLM cost in production?" |
| F (questions) | Eval harness design: generator + blind independent verifier + human review queue; calibration sets without hosting rights problems | "How do you stop an LLM from shipping a wrong answer key?" |
| G (social) | Server-computed aggregates, anti-cheat heuristics, verification flows, incentive design | gameability analysis of ranking metrics |
| H (mobile) | Cross-platform (Expo) reuse of one backend, conflict-safe merge, push notification infra | multi-device state reconciliation story |
| I (money/ops) | TR payment rails, entitlements modeling, observability (Sentry), data-ops calendaring | "How does a feature become revenue?" |
| war story (done) | The uid collision bug: 367/955 MEB codes collided across dersler; localStorage hid it, the Postgres PK caught it in one second → identity redesign everywhere | the "hardest bug" interview answer, lived |
| theory garnish | Watch Karpathy alongside Blok E/F — context window & token economics, embeddings/retrieval | transformer basics for interviews |

---

## ARŞİV — session status history (superseded, kept for record)

### Status 2026-07-10 dawn (Damla's design directives — SHIPPED same night)
- Shell rebuilt: 3-column layout dead ("screenleri üçe sığdırmayalım"). Topbar: logo left, page-contextual chips, nav links right (Bugün · Konular · Takvim · Denemeler · Sıra Puanı), avatar chip rightmost. Every view full-width; Konular/Takvim keep internal 2-pane split.
- Takvim redesigned (her spec): kazanım drops onto a DAY (never an hour); board = 7 day cards; task chips GREY; click a day → GÜNLÜK PROGRAM panel where hours live. Pool: search + ders + unstudied filters, tap = add.
- Engine day-based: generatePlan/rebalance fill days (perDay cap), h=null. DB events.hour NOT NULL → sentinel 0 = "no hour" (mapped in supa.js).
- Rank estimate PARKED: denemeler shows net only, estimateRank dormant, Sıra Puanı untouched (bar link).
- Verified: node --check clean ×15, no stale #mid/#detail/setMid refs.

### Status 2026-07-10 (rebrand session)
- meyvetabagi rebrand shipped in app + landing + gizlilik (stages 1-3, 5; 4 = skeleton only).
- Damla's calls: koçluk removed entirely; only human = Damla; Koç tab deleted, chat + randevu now in Profil "Damla ile birebir"; fruits will multiply.
- Verified: node --check clean, zero "koç"/"sıra sende" in js/ + html. localStorage key renamed to meyvetabagi.v1 (old data dropped).
- BLOK B hardening shipped same session (stages 8, 9, 11-15, 17). Open on Damla: redirect URL allowlist (8), migration run (9), SMTP account (10), live two-device test (7).

### Status 2026-07-09, late night — BACKEND STARTED
- Damla: "backend kur, birçok kullanıcı olacak, koçluk yapan insanlar olacak" → Faz 1 begun.
- `0001_core.sql` — full schema (profiles, kazanimlar master, coach_links, statuses/notes/events/denemeler/activity/dailies/messages/randevu + 20 RLS policies). `0002_seed_kazanimlar.sql` — 955 kazanım seed.
- Client: `js/config.js` (empty = local mode) + `js/supa.js` (auth, pull-on-login server-wins, guest migrates on signUp, debounced full push). Onboarding real email+password when configured; login modal replaces prompt(); logout signs out.
- Design PORTED TO REAL APP + REAL LANDING (mock phase over). White default, Helvetica, pink + multi-color per ders, DARK full-frame borders — NEVER single-side colored edges, no pills. Dark theme = body.dark. Ders color identity: 9 ders → 9 colors (`ui.js` DERS_COLOR).
- Algorithms upgraded: weekly plan = amber-first (spaced review) then fresh, sized perDay×5 (cap 15); generatePlan never writes into past hours/days; auto-rebalance on boot.
- Runtime: debounced note saving + beforeunload flush; phone layout (≤860px).
- ⚠️ Open before publish: sıralama RANK_ANCHORS KAYNAK YOK; name not final then; founder quote + price placeholders; no git remote yet.

### Status 2026-07-09, morning
- Reality check done: prototype honest now — fabricated seeds removed, 14 logic bugs fixed (hardcoded deneme date, unselectable AYT, no question caps, negative-net clamp, past-day plan generation, dead onboarding answers, click-farmable Sıra Puanı, morning-zero streak, none-vs-red display, quote XSS, Safari-private crash, no deneme delete, past randevu slots, TYT/AYT net mixing).
- Web restructured; verified (syntax, imports, all assets 200).
- Onboarding answers now real inputs: alan → coach ders priority, saat → plan pacing. Grade → kazanım ordering still backlog.
- Design mocks tried (`web/mocks/`): v1 (pastel rounded doodles) rejected; v2 (Kunduz-referenced white/airy, sharp 2px) also "olmadı". Design DISCUSSION planned 2026-07-10.
- Latest audit: `~/damla_projects_2026/reports/2026-07-09-sirasende-reality-check.md`. Detail docs: `DECISIONS.md` (resolved tangles), `REQUIREMENTS.md` (everything Damla asked, statused).

## Ideas parked

Grade-aware kazanım ordering · resizable/collapsible columns · kronometre · optik-form OCR entry · seviye tespit testi · Deneme Kulübü · video solutions · coach marketplace (deferred deliberately — liability).

---
## Original planning doc (2026-07-08/09, working name was "Sıra Sende", NOT locked then)

---

## One sentence

The place a YKS student opens every day: it tells them what to study (from the official MEB kazanımlar), lets them mark progress, shows their predicted ranking, and lets them compare with others.

---

## Core idea — ONE spine

The whole app hangs on a single thing: the **official MEB kazanım list**. It is not 4 separate apps; it is one list used 4 ways.

- **checklist** — the list itself, student marks each kazanım
- **notes** — student's own note under each kazanım
- **calendar + coach** — those kazanımlar scheduled into days
- **leaderboard** — the list used as the measuring stick to compare students

Because everything is anchored to one official list, it stays coherent AND trustworthy.

### The kazanım source (backbone data)

- Official single document: TTKB **"2026 YKS'ye esas derslere ait konu ve kazanımlar"**.
- URL: `https://ttkb.meb.gov.tr/meb_iys_dosyalar/2025_11/26164023_2026_yks.pdf`
- DOWNLOADED → `data/kazanimlar/2026_yks_kazanimlar.pdf` (21 MB, verified real MEB PDF).
- **2026 YKS uses the OLD 2018 curriculum.** The new "Türkiye Yüzyılı Maarif Modeli" (2024) only reaches YKS in **2028** — do NOT use it for 2026/2027 or trust dies.
- Codes are clean & hierarchical: `sınıf.ünite.konu.kazanım` (e.g. `9.1.1.1 Önerme ile ilgili kavramları örneklerle açıklar.`).
- Total ~1,500–2,500 kazanımlar across all subjects.
- No ready dataset/API exists (JSONs online are AI-fabricated — unusable). We parse the official PDF into our own clean DB.

---

## Features

### 1. Konu takibi / checklist
Each kazanım marked **red / yellow / green** (don't know / needs review / learned). Progress bar fills; history visible ("how much I turned green").

### 2. Notes
Student writes their own note under each kazanım (formula, common mistake, tip).

### 3. Calendar / agenda + AI coach
- Shared calendar: **both the student and the AI coach can add tasks.**
- Coach places kazanımlar into days based on the student's weaknesses + net trend ("this week: türev").
- Done tasks get marked **X**. Past + future days both visible → progress lives on the calendar.
- Calendar **auto-rebalances** when a day is missed (proven pattern — Aikoçu does this).

### 4. Deneme (mock exam) entry + sıralama prediction
- Student picks type (TYT / AYT / branch), enters **D (correct) and Y (wrong)** per subject. Blank auto. `net = D − Y/4`.
- Instantly shows **net + estimated ranking** (from official ÖSYM year data).
- Ranking shown as an **honest range** with uncertainty ("~45,000–52,000"), always labeled "tahmini".
- Two modes:
  - **quick** — just D/Y → net + ranking
  - **detailed** — tag wrong questions to their kazanım → those kazanımlar auto turn red/yellow → feeds the coach.

### 5. Leaderboard / social
Compare green-ratio and net with others → motivation, rival tracking. Needs backend (shared data).

### 6. Question bank — LATER layer (not v1 blocker)
- Questions **AI-generated grounded in MEB book + kazanım** — the Miss Ducky model (there we generated from 570 sourced articles, not hallucination). Every question traceable to a kazanım + book content.
- **Verbal subjects** (Türkçe, tarih, coğrafya, felsefe, edebiyat): direct generation from MEB content.
- **Quantitative** (mat, fizik, kimya): **generate + independent answer-verification** before publishing. A wrong answer key in a math question is unforgivable and kills trust.
- The core product (tracking + coach + sıralama) works WITHOUT a question bank — students already solve from their own sources. So this is a second layer.

---

## AI coach — grounding, NOT fine-tuning

- We do **not** train/fine-tune a model. Too expensive, and it starts hallucinating.
- Instead: feed the model the official kazanım DB + the student's data as structured context, and constrain it to that.
- The coach never invents topics. It **arranges the official kazanım pool** into the student's calendar, prioritizing weak areas, explains, and (later) serves real content.
- Everything traceable to MEB. Matches Damla's rule: no AI fabrication, sourced only.

---

## Reliability (the whole app lives or dies on trust)

- All content from official MEB / ÖSYM sources.
- Sıralama always labeled "tahmini", based on official ÖSYM year data, shown as a range not a fake-precise number.
- Question generation is sourced + (for quantitative) answer-verified.

---

## Monetization

- **Freemium.** NOT positioned as "cheap" — we compete on quality + reliability + whimsy design, not price.
- Market price gap: the **~200–300 TL/month mid-segment is empty** (cheap ugly tools at ~12 TL vs corporate coaching at 3,800+ TL/month).
- **Free:** konu takibi + net entry.
- **Paid:** AI coach program + detailed sıralama + leaderboard.
- Backend + AI both required.
- **B2B door:** school / dershane multi-student licenses (FocusAI already sells a 10-student license) — keep in mind, not v1.

---

## Design

- House style: whimsy pastel hand-drawn — but **ferah / airy / clean** like Kunduz, not cluttered.
- **No whimsy YKS app exists in the market** — this is the clearest differentiation.
- Design belongs to Damla. She will redesign and bring direction in a later session.

---

## Market (from research 2026-07-08)

Market is split in two: ugly-but-functional cheap tools (Pandorina, Konu Takip) vs expensive corporate coaching (Kopilot ~3,800 TL/mo, Tonguç 8–13k). Middle is empty.

**Our differentiation — no competitor has all three:**
1. whimsy / hand-drawn design (a genre first)
2. personal live self-rebalancing calendar + AI coach
3. honest, personal sıralama prediction (with uncertainty range)
+ mid price

Competitors reviewed: Kunduz, Tonguç Akademi, Benim Hocam, Pickledemy, Öğrenci Takip AI Koç (FocusAI), Pandorina, Aikoçu, Dolfi, Kopilot.

Expected patterns (must have or feels wrong): home screen = countdown + last net + "add" CTA; net = D − Y/4 interpolated to prior-year real data per score type (SAY/EA/SÖZ/DİL); onboarding = target exam → days left → daily hours → level → weak subjects → first plan.

---

## Roadmap

- **v1 (core daily loop):** kazanım checklist + notes + shared calendar + AI coach + net/sıralama.
- **v2:** gamification (streak / XP / badges), leaderboard.
- **v3:** question bank (sourced + verified), B2B licenses.

---

## Done so far

- [x] Market/design research (competitors, gaps, pricing).
- [x] Kazanım source research — confirmed official + free + unchanged for 2026.
- [x] Downloaded official 2026 YKS kazanım PDF (`data/kazanimlar/2026_yks_kazanimlar.pdf`).

## Next concrete step

Parse the 2026 PDF into a structured kazanım DB (`ders → ünite → konu → kazanım`). Do ONE subject first (e.g. TYT Matematik) as a template, get it approved, then roll out to all subjects with the same shape.

---

## Open decisions → RESOLVED in `DECISIONS.md` (2026-07-09)

Recommendations made to unblock the build: coach = role + invite-code editing a mutable personal plan
(master MEB list stays read-only); leaderboard ranks on net+streak not gameable green; sales = bring-your-
own-coach + dershane seats (no marketplace); MEB corpus = coach grounding now, questions v3; platform =
web-first; no hosted ÖSYM past questions in v1; stack = Supabase + Claude grounding. Prototype built under
`web/`. Still Damla's call: name, final platform sign-off. Original list kept below for reference.

## Open decisions (original list)

- **Name** — deferred (working "Sıra Sende").
- **Platform** — iOS / web / both? (not decided)
- **Question bank in v1 or later** — leaning later; core works without it.
- **ÖSYM past-question usage rights** — clarify if we host real past questions.
- **Social / leaderboard depth** — how much comparison.
- **Backend + AI stack** — to design next session.
