-- 0003: in-app permanent account deletion (KVKK).
-- security definer so an authenticated user can remove their own auth.users row;
-- every app table cascades from profiles(id) -> auth.users(id), so one delete wipes everything.
create or replace function public.delete_me()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_me() from public;
grant execute on function public.delete_me() to authenticated;
