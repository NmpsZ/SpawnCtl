-- Add 'ready' status to public.servers.status check constraint
alter table public.servers drop constraint if exists servers_status_check;

alter table public.servers add constraint servers_status_check check (status in ('offline', 'starting', 'running', 'stopping', 'ready'));
