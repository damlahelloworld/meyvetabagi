# meyvetabagi — PROJECT

Name: **meyvetabagi** (locked). Amme-hizmeti YKS tool, ücretsiz, no coaching/ranking/paywall.
Status: **CANLI YAYINDA** https://damlahelloworld.github.io/meyvetabagi/ (2026-07-10). Design style law + product shape + content pipeline all shipped — see CLAUDE.md "NEXT SESSION STARTS HERE" for current state and open items.

Last session (2026-07-10, marathon): rebrand meyvetabagi, coaching removed, Blok B backend hardened, own public repo, 23 MEB books + 448 key terms, month-grid takvim, full-width konular, design language settled (white+vivid+Arial+rainbow+sparkle, NO purple), SEO (meta/JSON-LD/sitemap), security pass clean, DEPLOYED live to GitHub Pages, fresh landing page.
Open: live 2-device test, Search Console sitemap submit, sozel ders book terms, deeper per-kazanim SEO + question bank (parked).

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
