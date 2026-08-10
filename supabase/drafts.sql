-- Phone drafts. Run once in the Supabase SQL editor.
--
-- The phone writes here; the Mac drains it into the Obsidian vault and marks
-- rows claimed. Nothing is ever read back by the website, so a note lives in
-- this table for at most the time between writing it and next opening the Mac.

create table if not exists public.drafts (
  id         bigint generated always as identity primary key,
  body       text not null,
  key        text not null,
  -- true when sent with "Publish" rather than "Save", meaning it should go
  -- straight to the site rather than waiting to be reviewed.
  publish    boolean not null default false,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create index if not exists drafts_unclaimed on public.drafts (created_at)
  where claimed_at is null;

alter table public.drafts enable row level security;

-- The phone may only INSERT, and only with the shared key. It cannot read
-- anything back, so finding the page does not expose a single word you wrote.
--
-- Replace 'CHANGE-ME' with a long random string, and put the same value in
-- PUBLIC_DRAFT_KEY in .env.
drop policy if exists "drafts insert" on public.drafts;
create policy "drafts insert"
  on public.drafts
  for insert
  to anon
  with check (key = 'CHANGE-ME' and length(body) between 1 and 20000);

-- No select/update/delete policy for anon on purpose. The Mac uses the
-- service_role key, which bypasses RLS and never leaves your machine.
