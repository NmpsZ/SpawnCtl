create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  game text not null check (game in ('minecraft', 'terraria')),
  status text not null default 'offline' check (status in ('offline', 'starting', 'running', 'stopping')),
  container_id text,
  tunnel_ip text,
  tunnel_port integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists servers_set_updated_at on public.servers;
create trigger servers_set_updated_at
before update on public.servers
for each row
execute function public.set_updated_at();

alter table public.servers enable row level security;

drop policy if exists "servers_select_own" on public.servers;
create policy "servers_select_own" on public.servers
for select
using (auth.uid() = user_id);

drop policy if exists "servers_insert_own" on public.servers;
create policy "servers_insert_own" on public.servers
for insert
with check (auth.uid() = user_id);

drop policy if exists "servers_update_own" on public.servers;
create policy "servers_update_own" on public.servers
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "servers_delete_own" on public.servers;
create policy "servers_delete_own" on public.servers
for delete
using (auth.uid() = user_id);
