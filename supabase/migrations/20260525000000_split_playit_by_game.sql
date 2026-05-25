-- Split Playit.gg configurations for Minecraft and Terraria separately
alter table public.profiles 
  add column if not exists playit_minecraft_static_ip text,
  add column if not exists playit_terraria_static_ip text;

-- Migrate existing data (assume old general fields were used for Minecraft as per Phase 1 setup)
update public.profiles 
set 
  playit_minecraft_static_ip = coalesce(playit_minecraft_static_ip, playit_static_ip)
where playit_static_ip is not null;
