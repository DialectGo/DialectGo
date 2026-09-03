-- Migration: Create saved_device_profiles table
-- This table stores lightweight profile info per device so users
-- see their previously-used accounts on the Auth screen.

create table if not exists public.saved_device_profiles (
  id uuid default gen_random_uuid() primary key,
  device_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  auth_provider text default 'email',  -- 'email' | 'google'
  saved_at timestamptz default now(),
  unique(device_id, user_id)
);

-- Index for fast device-based lookups
create index if not exists idx_saved_device_profiles_device_id
  on public.saved_device_profiles(device_id);

-- RLS: Allow authenticated users to manage their own entries
alter table public.saved_device_profiles enable row level security;

-- Policy: Users can insert their own profile
create policy "Users can insert own device profile"
  on public.saved_device_profiles for insert
  with check (auth.uid() = user_id);

-- Policy: Anyone can read by device_id (needed for pre-login screen)
create policy "Anyone can read device profiles"
  on public.saved_device_profiles for select
  using (true);

-- Policy: Users can delete their own profile
create policy "Users can delete own device profile"
  on public.saved_device_profiles for delete
  using (auth.uid() = user_id);
