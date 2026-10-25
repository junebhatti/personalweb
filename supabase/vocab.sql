-- Vocab list for /vocab. Run once in the Supabase SQL editor.
--
-- Anyone can read the words. Adding goes only through add_vocab(), which
-- checks a passphrase against a bcrypt hash; the passphrase itself is never
-- stored, and is typed once on the phone rather than shipped in the page.
--
-- Replace 'CHANGE-ME' below with the passphrase before running.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.vocab (
  id         bigint generated always as identity primary key,
  term       text not null check (length(term) between 1 and 80),
  meaning    text not null default '' check (length(meaning) <= 500),
  created_at timestamptz not null default now()
);

create unique index if not exists vocab_term_unique on public.vocab (lower(term));

alter table public.vocab enable row level security;

drop policy if exists "vocab read" on public.vocab;
create policy "vocab read" on public.vocab for select to anon using (true);
-- No insert/update/delete policy for anon: writes go through add_vocab only.

-- One row: the passphrase hash. RLS on with no policies, so anon can't read it.
create table if not exists public.vocab_secret (
  id   int primary key default 1 check (id = 1),
  hash text not null
);
alter table public.vocab_secret enable row level security;

insert into public.vocab_secret (id, hash)
values (1, extensions.crypt('CHANGE-ME', extensions.gen_salt('bf')))
on conflict (id) do update set hash = excluded.hash;

create or replace function public.vocab_passphrase_ok(passphrase text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.vocab_secret
    where hash = extensions.crypt(passphrase, hash)
  );
$$;

-- Returns 'added', 'duplicate', or raises on a bad passphrase.
create or replace function public.add_vocab(term text, meaning text, passphrase text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.vocab_passphrase_ok(passphrase) then
    raise exception 'bad passphrase' using errcode = '28000';
  end if;
  insert into public.vocab (term, meaning) values (trim(term), trim(meaning));
  return 'added';
exception
  when unique_violation then return 'duplicate';
end;
$$;

revoke all on function public.vocab_passphrase_ok(text) from public;
revoke all on function public.add_vocab(text, text, text) from public;
grant execute on function public.vocab_passphrase_ok(text) to anon;
grant execute on function public.add_vocab(text, text, text) to anon;
