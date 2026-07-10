-- Sıra Sende — core schema (Faz 1)
-- Two data layers, never mixed:
--   master list  = official MEB kazanım DB (read-only, same for everyone)
--   personal data = per-student mutable state (status/notes/reps/plan/denemeler)
-- Roles: student | coach. Coach links to students via invite code. RLS everywhere.

-- ============ profiles ============
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  role        text not null default 'student' check (role in ('student','coach')),
  target      text default 'Sayısal' check (target in ('Sayısal','Eşit Ağırlık','Sözel','Dil')),
  grade       text,
  hours       text,
  theme       text not null default 'light',
  invite_code text unique default encode(gen_random_bytes(4), 'hex'),  -- student shares this with their coach
  created_at  timestamptz not null default now()
);

-- ============ master list (read-only content) ============
create table kazanimlar (
  uid      text primary key,          -- 'mat:9.1.1.1' — bare MEB codes COLLIDE across dersler
  code     text not null,             -- display code '9.1.1.1'
  ders     text not null,
  unit     text not null,
  grade    int,
  konu     text,
  title    text not null,
  aciklama text
);

-- ============ coach-student link ============
create table coach_links (
  coach_id   uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coach_id, student_id)
);

-- ============ personal state ============
create table statuses (
  user_id uuid not null references profiles(id) on delete cascade,
  code    text not null references kazanimlar(uid),
  status  text not null check (status in ('red','amber','green')),
  reps    int  not null default 0,
  rep_day date,                        -- max one rep per kazanım per day (anti-gaming)
  updated_at timestamptz not null default now(),
  primary key (user_id, code)
);

create table notes (
  user_id uuid not null references profiles(id) on delete cascade,
  code    text not null references kazanimlar(uid),
  body    text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, code)
);

create table events (  -- shared calendar; author tracked so student sees who added what
  id        text primary key,  -- client-generated ('e'+ts)
  user_id   uuid not null references profiles(id) on delete cascade,
  code      text not null references kazanimlar(uid),
  date      date not null,
  hour      int  not null check (hour between 0 and 23),
  author    text not null default 'student' check (author in ('student','coach')),
  done      boolean not null default false,
  created_at timestamptz not null default now()
);
create index events_user_date on events(user_id, date);

create table denemeler (
  id      text primary key,  -- client-generated ('d'+ts)
  user_id uuid not null references profiles(id) on delete cascade,
  date    date not null default current_date,
  type    text not null check (type in ('TYT','AYT')),
  net     numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table activity (  -- per-day completion counts (heatmap + streak)
  user_id uuid not null references profiles(id) on delete cascade,
  day     date not null,
  count   int  not null default 0,
  primary key (user_id, day)
);

create table messages (  -- coach<->student thread
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  sender_id  uuid not null references profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index messages_student on messages(student_id, created_at);

create table randevu (
  id         text primary key,  -- client-generated ('r'+ts)
  student_id uuid not null references profiles(id) on delete cascade,
  coach_id   uuid references profiles(id) on delete set null,
  date       date not null,
  time       text not null,
  created_at timestamptz not null default now(),
  unique (coach_id, date, time)        -- a coach slot can be booked once
);

create table dailies (  -- günün kazanımı (active recall)
  user_id uuid not null references profiles(id) on delete cascade,
  day     date not null,
  code    text not null references kazanimlar(uid),
  graded  boolean not null default false,
  primary key (user_id, day)
);

-- ============ RLS ============
alter table profiles    enable row level security;
alter table kazanimlar  enable row level security;
alter table coach_links enable row level security;
alter table statuses    enable row level security;
alter table notes       enable row level security;
alter table events      enable row level security;
alter table denemeler   enable row level security;
alter table activity    enable row level security;
alter table messages    enable row level security;
alter table randevu     enable row level security;
alter table dailies     enable row level security;

-- master list: readable by all signed-in users, writable by nobody (service role only)
create policy kaz_read on kazanimlar for select to authenticated using (true);

-- helper: is the current user a coach of X?
create or replace function is_coach_of(student uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from coach_links where coach_id = auth.uid() and student_id = student) $$;

-- profiles: own row full access; coaches can read their students' profiles
create policy prof_own  on profiles for all    to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy prof_coach on profiles for select to authenticated using (is_coach_of(id));

-- coach_links: student creates the link (redeems invite by inserting), both sides can see & remove
create policy link_see on coach_links for select to authenticated using (coach_id = auth.uid() or student_id = auth.uid());
create policy link_add on coach_links for insert to authenticated with check (student_id = auth.uid());
create policy link_del on coach_links for delete to authenticated using (coach_id = auth.uid() or student_id = auth.uid());

-- personal tables: owner full access; linked coach can READ progress, and WRITE only plan (events)
create policy st_own   on statuses  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy st_coach on statuses  for select to authenticated using (is_coach_of(user_id));
create policy no_own   on notes     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ev_own   on events    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ev_coach on events    for all to authenticated using (is_coach_of(user_id)) with check (is_coach_of(user_id) and author = 'coach');
create policy dn_own   on denemeler for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy dn_coach on denemeler for select to authenticated using (is_coach_of(user_id));
create policy ac_own   on activity  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ac_coach on activity  for select to authenticated using (is_coach_of(user_id));
create policy dl_own   on dailies   for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- messages: student and their linked coach read the thread; each writes as themselves
create policy msg_read on messages for select to authenticated
  using (student_id = auth.uid() or is_coach_of(student_id));
create policy msg_send on messages for insert to authenticated
  with check (sender_id = auth.uid() and (student_id = auth.uid() or is_coach_of(student_id)));

-- randevu: student books/cancels own; coach sees & manages own slots
create policy rv_student on randevu for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy rv_coach   on randevu for select to authenticated using (coach_id = auth.uid());
