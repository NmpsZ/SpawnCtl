-- Add new columns for server configuration
alter table public.servers 
  add column if not exists name text,
  add column if not exists version text default 'LATEST',
  add column if not exists memory text default '1G',
  add column if not exists game_mode text default 'survival',
  add column if not exists difficulty text default 'easy',
  add column if not exists seed text;

-- Update existing rows to have a default name
update public.servers set name = 'My Server' where name is null;

-- Make name not null for future inserts
alter table public.servers alter column name set not null;
