# meyvetabagi — YKS study universe (formerly "Sıra Sende", name retired 2026-07-10)

> Brand decisions (Damla, 2026-07-10 night): single brand **meyvetabagi** for the whole YKS universe;
> the word **"koç" is BANNED in product copy**; the AI that suggests and evaluates against kazanımlar
> is named **çilek** (the strawberry in the fruit bowl — more fruits/AIs will join later, e.g. elma).
> Internal DB role names ('coach') stay — only user-facing copy is affected.
>
> **KOÇLUK REMOVED ENTIRELY (Damla, 2026-07-10):** no coaching system, no mentors, no invite codes —
> "ai ve motorumuz çok güçlü olacak, o yeter de artar". The ONLY human in the product is Damla herself:
> 1-1 randevu with her stays possible, messages come from her. Guidance = çilek + engine. Koç nav tab deleted;
> chat + randevu live in Profil under "Damla ile birebir".

The master doc. Any session can continue the build from this file alone.
Detail history: `PROJECT.md` (spec as discussed), `DECISIONS.md` (resolved tangles), `REQUIREMENTS.md` (everything Damla asked, statused).
Latest audit: `~/damla_projects_2026/reports/2026-07-09-sirasende-reality-check.md`.

## What it is

The place a YKS student opens every day. ONE spine — the official MEB kazanım list — used many ways:
checklist (red/yellow/green + notes + reps), daily active-recall explain, shared calendar with a coach,
deneme → net → honest sıralama, and a social/competition layer. Kunduz ferahlığı + Baykuş koçluk derinliği,
whimsy-quality design, mid price. Goal is REVENUE, not portfolio.

## Positioning (why this wins)

- Market is split: ugly-cheap tools (~12 TL, Pandorina/Konu Takip) vs corporate coaching (Kopilot ~3.800 TL/ay, Tonguç 8–13k). **The ~200–300 TL/ay band is EMPTY** — that's our seat.
- No whimsy YKS app exists — design is a genre-first differentiator (asset design = Damla, always).
- Kazanım granularity is the moat: no competitor exposes the official MEB list as the working surface.
- **Damla = the only human in the product.** Bilkent CS + Medipol Tıp, cracked YKS twice — her story IS the trust brand (onboarding, founder card, landing). Content (YT/IG) is the distribution channel.
- Beat Baykuş **as a product, not a coach marketplace** (2026-07-10: coaching layer removed entirely) — we own the student's daily loop with çilek + the engine; the human touch is Damla-only 1-1 (capped, prestige).

## Revenue model (born with a paywall)

> ⚠️ 2026-07-09 Damla: **monetization mechanism is OPEN** — hourly coaching sold by Damla? bookable randevu? AI coaching subscription? Undecided; pricing is parked and must NOT appear as settled anywhere public. The notes below are the earlier working model, kept for reference.

- **Freemium.** Free: kazanım checklist + notes + deneme/net entry — free users must GENUINELY succeed (success = retention). Paid: koç program + detailed sıralama + leaderboard/ligler + chat.
- Price: mid band ~200–300 TL/ay. Never positioned "cheap" — quality + reliability + whimsy.
- **Launch scarcity:** first 400 users free, counter flips to paywall after.
- **"Damla's Class"** — application-gated premium tier (kazanım-explain admission test → class placement), plainsight-style prestige aesthetic. Base app stays open — never gate the funnel.
- **Coaching hours** = high tier, capped (prestige, doesn't scale); **app subscription = the scalable money**; **B2B seats** (dershane/school multi-student licenses) = second engine (FocusAI already sells 10-student licenses).

## Architecture

**Current (done):** static web prototype, `web/`, vanilla ES modules + localStorage, single user. It is the design/logic/data-model proof and carries over. Run: `scripts/serve.sh` → localhost:8080.

**Faz 1 target (THE wall — nothing else matters before it):**
- **Backend: Supabase** — Postgres + Auth + Realtime + row-level security (clean multi-tenant: student / coach / dershane).
- **Cross-platform: Expo/React Native** — one codebase → iOS + Android + web. Students live on phones.
- Two data layers, never mixed: **master list** (MEB kazanım DB, immutable, read-only) vs **personal plan** (mutable selection/ordering per student). Coach links to students by invite code; every plan item/task stores `author`; coach edits only from the master list (can't invent topics).

**Data model already proven in the prototype** (see `js/state.js`): status/notes/reps per kazanım code, events {date, hour, code, author, done}, denemeler {date, type, net}, activity per day, randevu, messages.

### What the backend unlocks (all currently mocked, in build order)
1. Real accounts + sync (localStorage → Postgres; KVKK ships SAME session).
2. Coach panel (Damla side): availability, bookings, per-student progress %, drag-drop editing a student's plan.
3. Chat coach↔student (Baykuş has it).
4. Leaderboard/Sıra Puanı across real users + weekly leagues (Kunduz/Duolingo style: tiers, XP, promotion).
5. Live events — moderator pushes an event ("2027 MSÜ"), everyone enters nets, live stats.
6. Verification/anti-cheat: karne photo → verified badge; anomaly detection. Public rank = net + streak (hard to fake), NEVER self-marked green (gameable, friends-only motivational).

## AI design (real, not fake)

- **Grounding, NEVER fine-tuning.** Claude API with the kazanım DB + the student's own data as structured context. The coach arranges the official kazanım pool; it never invents topics. Everything traceable to MEB.
- Claude API jobs, in order of value:
  1. **Grade the daily kazanım-explain** (student's explanation vs MEB açıklama → feedback + auto R/Y/G).
  2. **Weekly plan generation** (weaknesses + net trend + hours → calendar), replacing/augmenting the rule engine in `js/engine.js`.
  3. **Wrong-answer pattern analysis** (deneme detailed mode: tag wrongs → kazanım → red → feeds plan).
  4. **Question generation — CONFIRMED by Damla 2026-07-09 ("kesin üretelim")**, priority right after backend. Miss Ducky model: sourced from MEB content, quantitative questions independently answer-verified before publishing. A wrong answer key in math is unforgivable. Damla's addition: use çıkmış (past ÖSYM) questions to power the engine — implementation: past questions serve as CALIBRATION (style, difficulty distribution, distractor logic) for the generator, never hosted/served directly (rights stay clean, quality transfers).
- Coach engine today is honest rule-based (`analyzeWeak`/`generatePlan`) and labeled as such in the UI.

## Trust rules (the app lives or dies on these — non-negotiable)

1. **2026/2027 YKS = OLD 2018 curriculum.** The new Maarif Modeli reaches YKS in **2028**. Wrong curriculum = dead product.
2. **No AI fabrication anywhere.** Kazanımlar from the official MEB PDF only; online JSONs are AI-fabricated garbage.
3. **Sıralama is always "tahmini", always a range, always from a real ÖSYM table.** Current `RANK_ANCHORS` in `js/engine.js` are marked `KAYNAK YOK` and are a **launch blocker** — replace with sourced ÖSYM net→rank data per score type (SAY/EA/SÖZ/DİL). AYT deliberately shows NO rank until sourced.
4. **No hosted ÖSYM past questions** (rights unclear) — only public statistics.
5. **KVKK:** the session that moves user data off-device ships privacy policy + consent + deletion in the SAME session.
6. Anti-gaming: reps max 1/day/kazanım; activity decrements on un-done; public competition only on verifiable metrics.

## Data pipeline

- Source: TTKB "2026 YKS'ye esas konu ve kazanımlar" PDF → `data/kazanimlar/2026_yks_kazanimlar.pdf` (21 MB, official, downloaded).
- Parsed: **9 ders / 955 kazanım** (Edebiyat, Din, Tarih, Coğrafya, Mat, Fizik, Kimya, Biyoloji, Felsefe) → `web/data/kazanimlar.json` via `scripts/parse_all.py`. Codes `sınıf.ünite.konu.kazanım`.
- ⛔ Blocked (needs OCR / other extraction): **Mantık, Sosyoloji, Psikoloji** (garbled embedded font "0DQWÕN"), **İnkılap** (merged columns), **foreign languages** (CEFR prose, no discrete codes).

## Code layout (post 2026-07-09 restructure)

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

## Design surface map (for Damla — where to touch what)

| You want to change | Touch this file |
|---|---|
| Colors, fonts, radius, theme (app-wide) | `web/css/tokens.css` — every color is a variable here, nothing else defines colors |
| App layout shell (3 columns, sidebar, phone breakpoints) | `web/css/base.css` |
| App components (cards, buttons, calendar, chips…) | `web/css/components.css` |
| Landing page look | `web/css/landing.css` + section markup in `web/index.html` |
| Landing/legal copy | `web/index.html`, `web/gizlilik.html` (text lives in HTML, zero inline styles) |
| App texts (TR) | inside `web/js/views/*.js` template strings — ask Claude for bulk wording changes |

Rules kept for you: zero inline styles anywhere, no colored borders, no single-side accent edges, no pills, sharp 2px corners. JS never styles — everything is a class.

## Design

- Current shell: Bear-style near-white/anthracite, pink+lavender accents, no colored borders, no emojis, Neue Montreal + Fragment Mono, dark default.
- Damla owns design direction and will redesign (Figma or manual CSS) — that's WHY styles are separated. Big redesigns need a concrete reference from her first. Landing needs a distinctive pass (still generic).
- Expected-pattern floor (feels wrong without): home = countdown + last net + add-CTA; onboarding = target → days left → hours → level → first plan. Both exist.

> **NEXT SESSION STARTS HERE:** stitchu redesign SHIPPED (2026-07-10): tokens = muted fruit palette + Arial (no bold anywhere);
> components flattened (hairline .btn w/ ink-invert hover, hairline segs/inputs/slots/pills, flat cards, no shadows);
> topbar = stitchu header (lowercase wordmark + dashed accent underline svg, nav links lowercase w/ dashed active underline);
> landing palette synced, icons/theme-color regenerated to #C4767B. Damla checks visuals on http://localhost:8082/web/app.html
> (use a FRESH PORT each big CSS change — Safari module cache; 8080-8082 used). Reference stays: damlahelloworld.github.io/stitchu.
> Open: her verdict on this pass → then landing structural pass, remaining BLOK C (deploy gated on ship-check + live test).
> Previous pointer: repo is LIVE at github.com/damlahelloworld/meyvetabagi (private) — push there from now on; home-dir repo is history. BLOK C remaining: deploy (GATED on rank data + ship-check + live test), domain (Damla buys), OG image + service worker. Previous note: BLOK B done incl. Damla's dashboard steps (2026-07-10 04:30: migration 0003 ran, redirect URL allowed, Resend SMTP configured — sender onboarding@resend.dev, test mode: only mails Damla's own address until domain verified). Stage 7 live two-device test SKIPPED by Damla ("olmuştur büyük ihtimalle") — UNVERIFIED, run it before anything public. Next: stage 16 quick rate-limit look → BLOK C (repo + deploy + domain; at deploy add real domain to redirect URLs + verify domain in Resend). Supabase LIVE; DB password only with Damla.

## ROADMAP — 68 AŞAMA (ordered; work top to bottom; ☐ open · ☑ done · ⏸ waits on Damla)

### BLOK A — rebrand to meyvetabagi (decided 2026-07-10)
1. ☑ Rename app shell (2026-07-10): titles, brand logo ("m" + meyvetabagi), onboarding welcome; "sıra sende" retired (mocks/ left as history; localStorage key = 'meyvetabagi.v1' — Damla: old local data can go, "uçsun").
2. ☑ Koç purged from ALL user-facing copy (2026-07-10): **Koç nav tab DELETED** (koc.js removed), chat + randevu moved to Profil as "Damla ile birebir"; "Koç önerisi"→çilek önerisi; "koç ekledi"→çilek ekledi; who-labels, hints, legend, gizlilik. (DB role 'coach' stays internal.)
3. ☑ AI named **çilek** in product (2026-07-10): suggestion box, plan copy, onboarding subs. Daily-explain feedback speaks as çilek when Edge AI lands (stage 38).
4. ◐ Landing skeleton swapped to meyvetabagi + meta description/OG tags added (2026-07-10); band headline placeholder "Bu sene bilerek çalış." — **wording pass = Damla** (with stage 24).
5. ☑ gizlilik.html brand swap + koç-link sentence removed (verini yalnızca sen görebilirsin) (2026-07-10).
6. ⏸ Damla: final wordmark/typography direction for "meyvetabagi" (lowercase? fruit glyph? — her call, product copy hers).

### BLOK B — harden the live backend (FAZ 0)
7. ☐ Damla live-validates: sign up in app, mark kazanım, open second browser, same data appears; try "Şifremi unuttum" (tests SMTP too). Skipped 2026-07-10 — still the first thing to do before going public.
8. ☑ Password reset (2026-07-10): "Şifremi unuttum" on login modal + `sifre-yenile.html` (consumes recovery token, min-6 + match checks, expired-link fallback). ⏸ Damla: Supabase dashboard → Auth → URL Configuration → add the site URL as allowed redirect (localhost:8080 for now, real domain at deploy).
9. ☑ In-app account deletion (2026-07-10): Profil → "Hesabı kalıcı sil" (type-SİL confirm) → `delete_me()` RPC; local copy wiped, reload to onboarding; gizlilik.html text updated. ⏸ Damla: run `supabase/migrations/0003_delete_me.sql` in the SQL editor (I don't hold the DB password).
10. ☑ Custom SMTP (2026-07-10, Damla live): Resend account + API key, wired into Supabase (smtp.resend.com:465, user resend, sender onboarding@resend.dev). TEST MODE: no verified domain yet → delivers only to Damla's own address; verify domain in Resend at deploy (stage 22) and switch sender.
11. ☑ Sync status UX (2026-07-10): userchip subtitle = senkronize / senkron bekliyor… / çevrimdışı · tekrar denenecek (red tint on error), driven by 'syncstate' events.
12. ☑ Offline retry (2026-07-10): failed push → exponential backoff (5s→60s cap) + immediate retry on browser `online` event; beforeunload flush kept. Local state IS the queue (full-mirror push).
13. ☑ Session lifecycle (2026-07-10): `onAuthStateChange` — unexpected SIGNED_OUT → 'authgone' → login overlay, local copy kept (own signOut nulls user first so it doesn't trigger). Auto-refresh = supabase-js default.
14. ☑ Multi-tab semantics documented (2026-07-10): v1 = last-writer-wins — debounced full-mirror push means the tab that saves last owns the server state; fine for one student on one device at a time. Row-level `updated_at` merge comes at stage 62.
15. ☑ Login errors mapped (2026-07-10): `authErrMsg()` — wrong credentials / unconfirmed email / already registered / rate limit / network / short password, in Turkish; used by login, signup and reset flows.
16. ☐ Rate limiting review: Supabase auth throttles exist; verify signup/signin limits sane for launch traffic.
17. ☑ Backup ritual documented (2026-07-10): Supabase keeps daily backups (free tier: 7 days); weekly manual dump — `pg_dump --no-owner -Fc -f backups/meyvetabagi-$(date +%F).dump "postgresql://postgres:<DB_PASSWORD>@db.argyjhuznesbkwfejnys.supabase.co:5432/postgres"` (password from Damla, dump stays OUT of the repo).
18. ☐ Secrets hygiene check into repo CI habits: anon key public-by-design ok; DB password & future service_role NEVER in repo (Damla holds them).
19. ☑ gizlilik.html rewritten for live backend (2026-07-10) — re-check at every new data-touching feature.

### BLOK C — repo, deploy, publish
20. ☑ Repo live (2026-07-10): **github.com/damlahelloworld/meyvetabagi** — PRIVATE for now (flip to public = Damla's one click; GitHub Pages free tier needs public). History-clean single initial commit, own .git nested over the home-dir repo, .gitignore added. Only the anon key is in the repo (public by design, RLS guards).
21. ⏸ Deploy — GATED: sıralama RANK_ANCHORS still KAYNAK YOK (launch blocker, trust rule 3) + stage 25 ship-check + stage 7 live test must pass first. Then decide Pages vs Vercel with Damla (Pages needs repo public).
22. ☐ Custom domain (meyvetabagi.com / .app — Damla buys, I wire DNS + HTTPS).
23. ◐ Favicon (svg + png 192/512 + apple-touch) + manifest.json + theme-color wired into all 4 pages (2026-07-10) — placeholder pink 'm' glyph until Damla's wordmark (stage 6). Open: OG image (needs her design), service-worker offline shell.
24. ☐ Landing final copy from Damla (founder quote placeholder still empty); fiyat section stays absent until money model decided.
25. ☐ Pre-publish FULL ship-check (~/.claude/docs/ship-check.md) — blockers zero before the link goes public.

### BLOK D — Damla birebir (FAZ 1; REWRITTEN 2026-07-10: mentor system CANCELLED — koçluk removed, the only human is Damla)
26. ☐ Damla's account: role='coach' profile for Damla only (no mentor onboarding path, no invite codes — coach_links/invite plumbing stays dormant in schema, unused).
27. ☐ Messages to server: move chat localStorage → `messages` table; student ↔ Damla; unread badge.
28. ☐ Damla panel `#/panel` (role-gated to her): student list — green %, last net, streak, last-active; message inbox.
29. ☐ Real randevu: `slots` table (date, time, open) + RLS; Damla defines availability; student books; both can cancel; replaces hardcoded 16/18/20 in Profil.
30. ☐ Realtime subscription: student sees Damla's reply/booking confirmation instantly (supabase channel on messages+randevu).
31. ☐ Capacity guard: randevu slots are scarce by design (prestige) — booked-out state honest, no fake availability.
32-36. ~~mentor onboarding, invite redeem RPC, mentor dashboard per-mentor, mentor CRUD on students, second-mentor isolation test~~ — cancelled with koçluk (schema's multi-tenant RLS stays as the war-tested foundation).

### BLOK E — çilek AI on Edge Functions (FAZ 2: hidden API)
37. ☐ Edge Function skeleton `cilek`: ANTHROPIC_API_KEY in function env only; input = student snapshot (status summary, denemeler, hours, alan) + intent; JSON-schema output validation.
38. ☐ Job 1 — daily-explain grading: student's yazılı açıklama vs MEB açıklaması → kısa geri bildirim + önerilen R/S/Y; UI'da çilek konuşur.
39. ☐ Job 2 — weekly plan generation: çilek yazıyor (service-role scoped writes, author='coach' events flagged as çilek in copy).
40. ☐ Job 3 — wrong-answer pattern analysis (needs stage 44).
41. ☐ Grounding contract: prompt = official kazanım rows + student's own data ONLY; must cite kazanım uid; refuse-on-uncertainty.
42. ☐ Cost control: per-user daily quota table checked in-function; same-input daily cache; token usage log per call.
43. ☐ Prompt-injection defense: student free text wrapped as data never instructions; output schema-checked before touching DB.
44. ☐ Deneme detailed mode UI: after save → "yanlışlarını işaretle" → kazanım seç per wrong → auto sarı/kırmızı → feeds plan + çilek.
45. ☐ çilek voice/persona yazımı — Damla'nın kalemi (ben iskeleti bağlarım, konuşma tonu onun).

### BLOK F — question engine (FAZ 3: "kesin üretelim")
46. ☐ Corpus: MEB ders kitapları PDF'leri topla (ders başına), kazanım-başı pasaj çıkar → `corpus(uid, source, text)`; her parça izlenebilir.
47. ☐ Çıkmış calibration set: geçmiş ÖSYM soruları SADECE stil/zorluk/çeldirici referansı (asla barındırma — haklar temiz).
48. ☐ Generator: Claude, corpus chunk + kazanım grounding; şık+anahtar+çözüm üretir.
49. ☐ Independent verifier: ayrı çağrı soruyu kör çözer, anahtar tutmazsa iptal (sayısalda zorunlu; sözelde rubrik kontrolü).
50. ☐ Review queue: Damla batch onaylar (basit admin liste: onayla/reddet/düzelt).
51. ☐ `questions` table (uid, stem, choices, key, difficulty, source_ref, status) + RLS (yayınlananlar herkese).
52. ☐ Player UI v1: kazanım detayında "bu kazanımdan 5 soru" mini quiz; yanlış → otomatik sarı.
53. ☐ Rollout order: sözel dersler önce; sayısal ancak verifier kendini kanıtlayınca.

### BLOK G — social & competition (FAZ 4: ⏸ waits on Damla's mechanics design)
54. ⏸ Damla designs the social mechanics (parked by her with the sıralama question).
55. ☐ Server-computed leaderboard on Sıra Puanı (net+streak weighted; self-marked green never ranks alone).
56. ☐ Weekly leagues: tiers, promotion/relegation, XP.
57. ☐ Live events: Damla opens event ("2027 MSÜ"), students enter nets, realtime aggregate stats.
58. ☐ Anti-cheat: karne photo upload (Storage) → verified badge; anomaly heuristics (imkânsız net sıçramaları).
59. ☐ Yüzdelik dilim stat (Baykuş parity).
60. ⏸ Sıralama data decision: real ÖSYM-derived table per score type, or hide rank until sourced (RANK_ANCHORS = still KAYNAK YOK).

### BLOK H — mobile (FAZ 5: Expo)
61. ☐ Expo app: Bugün/Konular/Takvim(tap-first)/Deneme/Profil; supabase-js as-is; tokens.css values → TS theme.
62. ☐ Conflict-safe sync v2: row-level `updated_at` merge (multi-device gets real now).
63. ☐ Push notifications: günlük çalışma hatırlatması (opt-in) + mentor mesaj bildirimi.
64. ☐ Store presence: App Store + Play listing, PrivacyInfo, ekran görüntüleri (Damla'nın tasarım pasından sonra).

### BLOK I — money (FAZ 6: ⏸ waits on model decision) + continuous
65. ⏸ Monetization model (saat mi randevu mu çilek aboneliği mi) → sonra: TR payment rails (İyzico vs Stripe), entitlements, paywall, gerçek "ilk 400" sayacı, B2B dershane seats.
66. ☐ Observability: Sentry (free) before real users; sync error rates visible.
67. ☐ Data ops calendar: 2027 sezonu = yeni sınav tarihi config; **2028 = Maarif Modeli** yeni PDF + yeni parse; blocked subjects OCR (Mantık/Sosyoloji/Psikoloji/İnkılap ≈200 kazanım) master listeye eklenir.
68. ☐ Parity backlog + polish: kronometre/study-time, optik form, seviye tespit, accessibility pass (kontrast/klavye), konular listesi virtualization if phones lag, Deneme Kulübü, events.hour `drop not null` migration (kill the 0 sentinel), old-CSS sweep after Damla's design pass.

### LEARNING MAP — what Damla learns per block (application-layer depth; career is in product, not GPU)
Working mode: Claude writes the code, Damla makes the architecture calls — every block, Claude opens the design (schema / prompt contract / trade-off) and explains WHY before building; a one-paragraph "what we learned" note goes to Damla's Obsidian roadmap at each block's end.

| Blok | Skill Damla walks away with | Interview-grade artifact |
|---|---|---|
| B (harden) | Auth lifecycle (JWT, refresh, revocation), password reset flows, KVKK deletion rights as engineering, offline-first sync + retry/backoff, backup discipline | "How do you handle a revoked session / lost connectivity without losing user data?" |
| C (deploy) | Static hosting vs serverless trade-offs, DNS/HTTPS, PWA manifest, pre-launch audit ritual | shipping checklist ownership |
| D (mentor) | **Multi-tenant authorization with RLS** (already live-tested 6/6), security-definer RPCs, realtime websockets, invite-code linking design | "Design authorization so tenant A can never read tenant B" — answered with working SQL |
| E (çilek) | **The application-layer LLM stack**: RAG (chunking per kazanım → retrieval → grounded prompt), structured output validation, prompt-injection defense, cost/latency engineering (quota table, same-input cache, token logging, model choice) | "Did you build RAG / write evals / control LLM cost in production?" — yes, with numbers |
| F (questions) | **Eval harness design**: generator + blind independent verifier + human review queue; calibration sets (çıkmış) without hosting rights problems; content pipeline as a system | "How do you stop an LLM from shipping a wrong answer key?" |
| G (social) | Server-computed aggregates, anti-cheat heuristics, verification flows, incentive design | gameability analysis of ranking metrics |
| H (mobile) | Cross-platform (Expo) reuse of one backend, conflict-safe merge (updated_at), push notification infra | multi-device state reconciliation story |
| I (money/ops) | TR payment rails, entitlements modeling, observability (Sentry), data-ops calendaring (2028 curriculum switch) | "How does a feature become revenue?" |
| war story (done) | **The uid collision bug**: 367/955 MEB codes collided across dersler; localStorage hid it forever, the Postgres PK caught it in one second → identity redesign everywhere | the "hardest bug" interview answer, lived |
| theory garnish | Watch Karpathy alongside Blok E/F — context window & token economics, embeddings/retrieval; theory sticks when it lands on your own product | transformer basics for interviews |

### DAMLA'S OPEN DECISIONS (gate stages: 6, 24, 45, 54, 60, 65)
1. meyvetabagi wordmark/görsel yön (stage 6) · 2. landing metinleri + founder sözü (24) · 3. çilek'in sesi (45) · 4. sosyal mekanik tasarımı (54) · 5. sıralama verisi göster/gizle (60) · 6. para modeli (65).

## Status 2026-07-10 dawn (Damla's design directives — SHIPPED same night)

- **Shell rebuilt:** 3-column layout dead ("screenleri üçe sığdırmayalım"). Topbar: logo left, page-contextual chips next to it, nav links right (Bugün · Konular · Takvim · Denemeler · Sıra Puanı), avatar chip rightmost (Profil + theme + logout menu). Every view is its own full-width page; Konular/Takvim keep an internal 2-pane split.
- **Takvim redesigned (her spec):** kazanım drops onto a DAY (never an hour); board = 7 day cards; task chips GREY — no ders color, no author color, color ONLY = done/not-done (green); click a day → GÜNLÜK PROGRAM panel where hours live (optional per-task saat select). Pool: search + ders + unstudied filters, tap = add to selected day. Week nav = topbar chips.
- **Engine day-based:** generatePlan/rebalance fill days (perDay cap), h=null. DB events.hour stays NOT NULL → **sentinel 0 = "no hour"** (mapped in supa.js both ways); proper `drop not null` migration queued in stage 68 backlog.
- **Rank estimate PARKED** (Damla: "sıralama mekaniğini düşünmedim"): denemeler shows net only, estimateRank dormant in engine, Sıra Puanı page untouched (she loves it — it's a bar link now).
- Verified: node --check clean ×15, no stale #mid/#detail/setMid refs. Visual pass = Damla in dev.

## Status 2026-07-10 (rebrand session)

- meyvetabagi rebrand shipped in app + landing + gizlilik (stages 1-3, 5; 4 = skeleton only, wording Damla's).
- Damla's calls this session: **koçluk removed entirely** (AI + engine carry it, "yeter de artar"); only human = Damla — 1-1 randevu with her stays; Koç tab deleted, chat + randevu now in Profil "Damla ile birebir"; fruits will multiply (çilek now, elma etc. later).
- Verified: node --check clean on all modules, zero "koç"/"sıra sende" left in js/ + html (mocks kept as history). localStorage key renamed to meyvetabagi.v1 on Damla's order (old local data dropped).
- BLOK B hardening shipped same session (stages 8, 9, 11-15, 17 — see checkmarks): password reset page + forgot-password, in-app account deletion (migration 0003 WAITING for Damla's SQL editor run), sync indicator, offline retry/backoff, session-revoked handling, Turkish auth error mapping, backup ritual documented. Open on Damla: redirect URL allowlist (stage 8), migration run (9), SMTP account (10), live two-device test (7).

## Status / where we left off (2026-07-09, late night — BACKEND STARTED on Damla's order)

- Damla: "backend kur, birçok kullanıcı olacak, koçluk yapan insanlar olacak" → Faz 1 begun.
- `supabase/migrations/0001_core.sql` — full schema: profiles (role student/coach, invite_code), kazanimlar master (read-only), coach_links, statuses/notes/events/denemeler/activity/dailies/messages/randevu + 20 RLS policies (owner full, linked coach reads progress + writes only coach-authored events).
- `0002_seed_kazanimlar.sql` — 955 official kazanım as seed.
- Client: `js/config.js` (empty = local mode, nothing breaks) + `js/supa.js` (auth, pull-on-login server-wins, guest data migrates on signUp, debounced full push on every save incl. deletions). Onboarding now real email+password when configured; login modal replaces prompt(); logout signs out.
- **Waiting on Damla:** create supabase.com project → paste Project URL + anon key into `js/config.js`, then run both migrations in Supabase SQL editor. Then live end-to-end test.
- NOT yet synced/built: messages & randevu sync (coach panel UI needed first), coach dashboard, question generation (confirmed, next after backend).

- **Design PORTED TO REAL APP + REAL LANDING** (mock phase over). White default (:root), Helvetica, pink accent + multi-color (purple/blue/teal/orange/yellow/brown per ders), DARK full-frame borders (--line) — NEVER single-side colored edges, no pills. Dark theme = body.dark via settings. `index.html` = real landing (CTA → app.html); founder quote + price are PLACEHOLDERS for Damla.
- Ders color identity: 9 ders → 9 colors (`ui.js` DERS_COLOR), dots in Konular/Takvim chips + colored stat cards + Sıralama axes.
- Algorithms upgraded: weekly plan = amber-first (spaced review) then fresh, sized perDay×5 (cap 15); generatePlan never writes into past hours/days and skips occupied slots; **auto-rebalance on boot** (missed tasks redistribute forward, user informed once on Bugün).
- Runtime: debounced note saving + beforeunload flush; phone layout (≤860px: horizontal top nav, list+detail stacked single column).
- **Damla plans to PUBLISH tomorrow (2026-07-10)** with the landing. Pre-publish night work: touch support for takvim (tap pool row → first free slot; HTML5 drag doesn't exist on phones), `gizlilik.html` (honest KVKK/privacy: localStorage-only, no server/tracking) wired from footer, all dead landing links fixed.
- ⚠️ Open before/at publish: **sıralama** — Damla parked the rank-table question ("bıraksak, düşüncem") together with social mechanics; RANK_ANCHORS still KAYNAK YOK in engine.js, decide show/hide before going live. **Name** not final (Sıra Sende vs Papatya floated; repo name waits on it). Landing founder quote + price still placeholders (Damla's text). No git remote yet.

## Older status (2026-07-09, morning)

- Reality check done (see report): prototype honest now — fabricated seeds removed, 14 logic bugs fixed (hardcoded deneme date, unselectable AYT, no question caps, negative-net clamp, past-day plan generation, dead onboarding answers, click-farmable Sıra Puanı, morning-zero streak, none-vs-red display, quote XSS in esc, Safari-private crash, no deneme delete, past randevu slots, TYT/AYT net mixing).
- Web restructured into the layout above; verified (syntax, imports, all assets 200). Behavior otherwise identical.
- Onboarding answers now real inputs: alan → coach ders priority, saat → plan pacing. Grade → kazanım ordering still backlog.
- Design mocks tried (2026-07-09, `web/mocks/web.html` + `mobil.html`): v1 (pastel rounded, my doodles) rejected hard; v2 (Kunduz-referenced white/airy, sharp 2px, no pills, no ornaments) also "olmadı, içimize sinmedi". Design DISCUSSION with Damla planned for 2026-07-10 — no new passes before it. Damla dislikes the word "koç"; mocks use "Plan" as placeholder, naming is hers.
- **Next:** design conversation (2026-07-10) → direction from Damla; decide name; then Faz 1 (Supabase schema first: profiles, coach_links, plans, events, denemeler, messages, randevu with RLS) and the real ÖSYM rank table.
- Project has no git remote yet (lives inside the home-dir repo) — move to its own repo under damlahelloworld org when Faz 1 starts.

## Ideas parked

Grade-aware kazanım ordering · resizable/collapsible columns · kronometre · optik-form OCR entry · seviye tespit testi · Deneme Kulübü · video solutions · coach marketplace (deferred deliberately — liability).
