# YKS App — resolved tangles (2026-07-09)

Answers to the open questions. These are recommendations to unblock the build; you decide.

## 1. Coach system (how a coach edits agenda + curriculum)
Two data layers, never mixed:
- **Master list** = the official MEB kazanım DB. Immutable, same for everyone, our source of truth.
- **Personal plan** = a student's mutable selection/ordering of those kazanımlar across time. This is
  what gets edited.

Roles: `student` and `coach`. A coach is linked to one or more students by an **invite code** the
student generates. On a linked student the coach can:
- add / remove kazanım from the student's plan (from the master list only — can't invent topics),
- add / edit / move tasks on the shared calendar.
Every task/plan-item stores `author = student | coach`, so the student always sees who added what.
Coach has a dashboard listing their students + each one's progress. Same calendar object, two editors.

## 2. Student self-edit
Student owns their plan: add/remove kazanım, see past + future days, reorder. The MEB master list is
read-only; the plan is the editable copy. "Geçmiş çalışmalar" = completed tasks stay on past days.

## 3. Verifying others' progress (leaderboard trust)
Self-marked green is **gameable → never the competitive ranking.** Split it:
- **Green-ratio** = private / friends-only, motivational. Not a public rank.
- **Public leaderboard** ranks on **net (from denemeler) + streak/consistency**, which is far harder to
  fake meaningfully and matches what students actually care about.
True verification (proctored/real deneme) is a later integration, not v1. Label everything honestly.

## 4. Selling coaching
v1 = **bring-your-own-coach**, not a marketplace. Student invites their existing coach/teacher with a
code. This avoids marketplace liability and vetting. Money:
- student subscription (freemium),
- coach/dershane **seats** as the B2B add-on (multi-student license — the empty mid-price band).
Email is just one channel a coach might use; not a core feature. Coach marketplace = deferred.

## 5. "We collected MEB books/tests data — for what?"
Not for v1 questions. That corpus is:
- **now:** grounding context for the AI coach (explain a kazanım, cite the MEB book), and the net→
  sıralama statistics table,
- **later (v3):** the source for generated questions (Miss Ducky model — sourced + answer-verified).
v1 ships **no question bank**; students solve from their own sources. Questions are a second layer.

## Other open decisions
- **Platform:** web-first (this localhost is the proof). Coaches work on desktop, leaderboard + coach
  need a backend anyway, iteration is fastest, PWA covers mobile. Native iOS wrapper later.
- **Name:** yours. Working "Sıra Sende" until you pick.
- **Question bank:** v3, confirmed.
- **ÖSYM past-question rights:** do NOT host real past questions in v1 (rights unclear). Use only the
  public net→sıralama statistics. Our questions are generated + sourced. Keeps the legal door shut.
- **Stack (proposed):** front = web (static now, Next later); backend = Supabase (Postgres + auth +
  row-level security → clean multi-tenant for coach/student/dershane); AI coach = Claude API with the
  kazanım DB as grounded context, no fine-tune.

## v1 scope (the daily loop)
kazanım checklist (R/Y/G) + notes + shared calendar with coach + deneme→net→honest sıralama.
Leaderboard(net+streak) and question bank come after.
