-- Executa aquesta consulta a Supabase → SQL Editor
-- Objectiu: assegurar la taula de pressupostos i les polítiques RLS per al historial.

create table if not exists public.pressupostos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingressos numeric default 0,
  meta_estalvi numeric default 0,
  despeses jsonb default '[]'::jsonb,
  total_despeses numeric default 0,
  balanc numeric default 0,
  nom text,
  mes integer,
  year integer,
  created_at timestamptz default now()
);

alter table public.pressupostos enable row level security;

-- Compatibilitat amb qualsevol nom antic de taula que encara hi hagi al projecte.
do $$
begin
  if to_regclass('public.presspostos') is null then
    execute 'create view public.presspostos as select * from public.pressupostos';
  end if;
end $$;

drop policy if exists "pressupostos_select_own" on public.pressupostos;
drop policy if exists "pressupostos_insert_own" on public.pressupostos;
drop policy if exists "pressupostos_update_own" on public.pressupostos;
drop policy if exists "pressupostos_delete_own" on public.pressupostos;

create policy "pressupostos_select_own" on public.pressupostos
  for select using (auth.uid() = user_id);

create policy "pressupostos_insert_own" on public.pressupostos
  for insert with check (auth.uid() = user_id);

create policy "pressupostos_update_own" on public.pressupostos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pressupostos_delete_own" on public.pressupostos
  for delete using (auth.uid() = user_id);
