-- Execute este arquivo no SQL Editor do projeto Supabase.
-- Ele preserva os dados existentes e adiciona apenas o necessário para o mapa e o acesso do usuário.

alter table public.courts
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create index if not exists courts_coordinates_idx
  on public.courts (latitude, longitude)
  where latitude is not null and longitude is not null;

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.favorites enable row level security;
alter table public.registrations enable row level security;

-- Perfis: cada pessoa lê e atualiza somente o próprio perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Quadras podem ser consultadas por visitantes; somente usuários logados publicam.
drop policy if exists "courts_read_public" on public.courts;
create policy "courts_read_public" on public.courts
  for select to anon, authenticated using (true);

drop policy if exists "courts_insert_authenticated" on public.courts;
create policy "courts_insert_authenticated" on public.courts
  for insert to authenticated with check (auth.uid() = created_by);

-- Favoritos e inscrições pertencem ao usuário logado.
drop policy if exists "favorites_manage_own" on public.favorites;
create policy "favorites_manage_own" on public.favorites
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "registrations_manage_own" on public.registrations;
create policy "registrations_manage_own" on public.registrations
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Depois de executar, cadastre novas quadras usando "Usar localização".
-- Para quadras já existentes, preencha latitude/longitude manualmente no Table Editor.
