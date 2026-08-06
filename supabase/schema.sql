-- Coursework scores, run once in the Supabase SQL editor.
--
-- One row per course. `scores` holds the 0–1 value for each dimension, so
-- adding a dimension in src/data/coursework.ts needs no migration here.

create table if not exists public.course_scores (
  course_id  text primary key,
  scores     jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.course_scores enable row level security;

-- Anyone may read: these scores are published on the site anyway.
drop policy if exists "course_scores read" on public.course_scores;
create policy "course_scores read"
  on public.course_scores
  for select
  to anon, authenticated
  using (true);

-- Only a signed-in user may write. This is the whole security boundary, so
-- turn OFF public sign-ups in Supabase (Authentication → Sign In / Providers →
-- disable "Allow new users to sign up") once your own account exists.
-- Otherwise a stranger could register and edit these.
drop policy if exists "course_scores write" on public.course_scores;
create policy "course_scores write"
  on public.course_scores
  for all
  to authenticated
  using (true)
  with check (true);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists course_scores_touch on public.course_scores;
create trigger course_scores_touch
  before update on public.course_scores
  for each row execute function public.touch_updated_at();
