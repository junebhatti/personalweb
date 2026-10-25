-- Editing and deleting words from /vocab/edit. Run once in the Supabase SQL
-- editor, after vocab.sql. Both check the same passphrase as add_vocab().

-- Returns 'updated', 'duplicate' (another word already has that term) or
-- 'missing' (no word with that id); raises on a bad passphrase.
create or replace function public.update_vocab(word_id bigint, term text, meaning text, passphrase text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.vocab_passphrase_ok(passphrase) then
    raise exception 'bad passphrase' using errcode = '28000';
  end if;
  update public.vocab
     set term = trim(update_vocab.term), meaning = trim(update_vocab.meaning)
   where id = word_id;
  if not found then
    return 'missing';
  end if;
  return 'updated';
exception
  when unique_violation then return 'duplicate';
end;
$$;

-- Returns 'deleted' or 'missing'; raises on a bad passphrase.
create or replace function public.delete_vocab(word_id bigint, passphrase text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.vocab_passphrase_ok(passphrase) then
    raise exception 'bad passphrase' using errcode = '28000';
  end if;
  delete from public.vocab where id = word_id;
  if not found then
    return 'missing';
  end if;
  return 'deleted';
end;
$$;

revoke all on function public.update_vocab(bigint, text, text, text) from public;
revoke all on function public.delete_vocab(bigint, text) from public;
grant execute on function public.update_vocab(bigint, text, text, text) to anon;
grant execute on function public.delete_vocab(bigint, text) to anon;
