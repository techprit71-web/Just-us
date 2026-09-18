-- Just Us production starter schema.
-- Run in Supabase SQL Editor after creating a project.
-- Anonymous auth must be enabled in Authentication -> Providers.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[0-9]{5}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid not null,
  display_name text not null,
  avatar_url text,
  last_seen timestamptz not null default now(),
  primary key(room_id,user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  sender_id uuid not null,
  text text default '',
  kind text not null default 'text' check(kind in ('text','image','file')),
  file_url text,
  file_name text,
  mime_type text,
  reply_to uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  sender_id uuid not null,
  caption text not null default '',
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;
alter table public.moments enable row level security;

-- This starter uses anonymous auth. Tighten room membership policies further before a public launch.
create policy "rooms readable by authenticated" on public.rooms for select to authenticated using (true);
create policy "rooms insertable by authenticated" on public.rooms for insert to authenticated with check (true);
create policy "members readable" on public.room_members for select to authenticated using (true);
create policy "members upsert" on public.room_members for insert to authenticated with check (user_id = auth.uid());
create policy "members update own" on public.room_members for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "messages readable" on public.messages for select to authenticated using (true);
create policy "messages insert own" on public.messages for insert to authenticated with check (sender_id = auth.uid());
create policy "moments readable" on public.moments for select to authenticated using (true);
create policy "moments insert own" on public.moments for insert to authenticated with check (sender_id = auth.uid());

-- Storage: create a public bucket named `moments` in Storage, or make it private and replace
-- getPublicUrl in the app with signed URLs. For a real private messenger, use private storage
-- and authorize access by room membership.

-- Realtime: enable tables `messages` and `moments` under Database -> Replication.
