-- LiveCourt: execute no SQL Editor do Supabase.
-- Cria/atualiza o perfil do usuário após o cadastro e protege os dados com RLS.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  position text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists position text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- O trigger roda no banco logo após um usuário ser criado no Auth.
-- Ele é necessário para o fluxo com confirmação de e-mail, quando o navegador ainda não possui sessão.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, position)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'position', '')
  )
  on conflict (id) do update
  set name = excluded.name,
      email = excluded.email,
      position = excluded.position;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Gera perfis para usuários que já existem no Auth.
insert into public.profiles (id, name, email, position)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  email,
  coalesce(raw_user_meta_data ->> 'position', '')
from auth.users
on conflict (id) do nothing;
