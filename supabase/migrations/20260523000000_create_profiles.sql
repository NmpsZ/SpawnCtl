create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  playit_secret text,
  playit_static_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-update updated_at trigger for profiles
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "profiles_select_own" on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Trigger function to auto-create profile row on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Create trigger on auth.users
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

