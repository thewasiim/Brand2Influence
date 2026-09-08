-- Keep public user records in sync with Supabase Auth. Role remains null until
-- the authenticated user completes the role-selection step in the application.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, ''), '@', 1), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = case when public.users.name = '' then excluded.name else public.users.name end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Existing Auth users are safe to backfill before enabling the trigger.
insert into public.users (id, email, name)
select id, coalesce(email, ''), coalesce(nullif(trim(raw_user_meta_data ->> 'name'), ''), split_part(coalesce(email, ''), '@', 1), '')
from auth.users
on conflict (id) do nothing;

-- Permit users to replace or remove only objects within their own storage prefix.
create policy "users update own profile images" on storage.objects for update to authenticated using (bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text);
