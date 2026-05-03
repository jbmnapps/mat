-- ============================================================================
-- FP9 Matematikopgaver — Supabase schema
-- ============================================================================
-- Køres ÉN GANG i Supabase Dashboard → SQL Editor → "New query".
-- Kopiér hele filen ind, klik "Run".
--
-- VIGTIGT (fra BACKEND-TJEK.md):
--  - RLS skal være aktiveret PÅ ALLE tabeller FØR der inserts data.
--  - Hver `alter table ... enable row level security` står lige efter
--    `create table` og FØR vi laver policies. Dette er bevidst.
--  - Vi bruger ALDRIG service_role-key i klient-koden — kun anon/publishable.
--    Sikkerhed sidder i RLS-policies, ikke i at skjule keys.
--
-- Dansk oversigt:
--  - Eleven logger ind via Supabase Auth med syntetisk email
--    (`<navn-slug>@elev.fp9.local`) og password = `fp9-<4-cifret-kode>`.
--  - Læreren logger ind som `laerer@fp9.local` med password udledt af
--    NEXT_PUBLIC_LAERER_TOKEN.
--  - Funktionen `is_teacher()` tjekker om den indloggede er læreren —
--    bruges i RLS-policies så lærer-kontoen kan læse alle elevers data,
--    men en elev kun kan se sin egen.
-- ============================================================================

-- 1. STUDENTS
--    Én række pr. elev, primær nøgle = auth.users.id.
--    `display_name` bevarer original casing (fx "Sara M."); `name_slug` er
--    den normaliserede version brugt i email og som unik nøgle.
create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  name_slug text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now()
);

-- AKTIVÉR RLS FØRST — før vi insertter eller laver policies.
alter table public.students enable row level security;

-- 1b. AKTIV TID på students.
--    `total_active_seconds` stiger via funktionen `add_active_seconds()` som
--    klienten kalder hver 30. sekund når eleven har været aktiv.
alter table public.students
  add column if not exists total_active_seconds bigint not null default 0
  check (total_active_seconds >= 0);

-- 2. PROGRESS
--    Én række pr. (elev, disciplin). status afspejler bedste prøveklar-score.
create table if not exists public.progress (
  student_id uuid not null references public.students(id) on delete cascade,
  discipline_id text not null,
  status text not null default 'untouched'
    check (status in ('untouched', 'rod', 'gul', 'gron')),
  best_score integer not null default 0
    check (best_score >= 0 and best_score <= 100),
  attempts integer not null default 0
    check (attempts >= 0),
  last_attempt timestamptz,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, discipline_id)
);

alter table public.progress enable row level security;

-- 3. INDEKS — for hurtig lærer-dashboard
create index if not exists progress_student_idx
  on public.progress (student_id);
create index if not exists students_last_active_idx
  on public.students (last_active desc);

-- 4. POLICIES — students
--    Eleven kan kun se/ændre sin egen række. Læreren kan se alle.
--
--    Vi bruger `auth.jwt() ->> 'email'` direkte i stedet for en separat
--    SECURITY DEFINER-funktion. Det undgår at eksponere en hjælpefunktion
--    via PostgREST RPC (Supabase advisor advarer om det). JWT'en indeholder
--    altid email-claimet, så det er hurtigere og mere sikkert.
drop policy if exists "students_select" on public.students;
create policy "students_select"
  on public.students for select
  to authenticated
  using (
    id = auth.uid()
    or (auth.jwt() ->> 'email') = 'laerer@fp9.local'
  );

drop policy if exists "students_insert_self" on public.students;
create policy "students_insert_self"
  on public.students for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "students_update_self" on public.students;
create policy "students_update_self"
  on public.students for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 5. POLICIES — progress
drop policy if exists "progress_select" on public.progress;
create policy "progress_select"
  on public.progress for select
  to authenticated
  using (
    student_id = auth.uid()
    or (auth.jwt() ->> 'email') = 'laerer@fp9.local'
  );

drop policy if exists "progress_insert_self" on public.progress;
create policy "progress_insert_self"
  on public.progress for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "progress_update_self" on public.progress;
create policy "progress_update_self"
  on public.progress for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Læreren kan slette progress (bruges af "Nulstil progress"-knappen i lærer-UI).
-- Kun læreren — eleven har ikke en delete-knap nogen steder.
drop policy if exists "progress_delete_teacher" on public.progress;
create policy "progress_delete_teacher"
  on public.progress for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'laerer@fp9.local');

-- 5b. RPC: add_active_seconds(seconds) til atomic-increment af total_active_seconds.
--    SECURITY INVOKER (default) — bruger den eksisterende students_update_self-policy
--    så eleven kun kan opdatere sin egen række. Cap på 600 sek pr. kald som
--    lille anti-misbrug-mekanisme.
create or replace function public.add_active_seconds(seconds integer)
returns void
language plpgsql
set search_path = public
as $$
begin
  if seconds is null or seconds < 0 or seconds > 600 then
    raise exception 'add_active_seconds: ude af interval: %', seconds;
  end if;
  update public.students
    set total_active_seconds = total_active_seconds + seconds,
        last_active = now()
    where id = auth.uid();
end;
$$;

-- Skjul fra anon, tillad kun authenticated (eleven der er logget ind)
revoke execute on function public.add_active_seconds(integer) from public;
grant execute on function public.add_active_seconds(integer) to authenticated;

-- 6. AUTO-UPDATE last_active når progress ændres
create or replace function public.touch_last_active() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.students
    set last_active = now()
    where id = new.student_id;
  return new;
end;
$$;

-- Skjul trigger-funktionen fra REST API: triggeren virker stadig (den fires
-- automatisk af PostgreSQL), men ingen kan kalde den direkte via /rpc.
revoke execute on function public.touch_last_active()
  from public, anon, authenticated;

drop trigger if exists progress_touch_last_active on public.progress;
create trigger progress_touch_last_active
  after insert or update on public.progress
  for each row execute function public.touch_last_active();

-- ============================================================================
-- VERIFIKATION (kør disse efter setup for at bekræfte at RLS er aktiveret):
-- ============================================================================
--   select tablename, rowsecurity from pg_tables
--     where schemaname = 'public' and tablename in ('students', 'progress');
--   -- Begge skal vise rowsecurity = true.
--
--   select policyname, tablename from pg_policies
--     where schemaname = 'public';
--   -- Skal vise 6 policies (3 pr. tabel).
-- ============================================================================
