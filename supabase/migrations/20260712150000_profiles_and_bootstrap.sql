-- ============================================================
-- Migration: profiles & admin bootstrap
-- Tanggal: 2026-07-12
-- Tujuan: tabel profiles (link ke auth.users), helper is_admin(),
--         trigger pembuatan profile otomatis saat user signup.
-- ============================================================

create extension if not exists "pgcrypto";

-- Tabel profiles: 1:1 dengan auth.users. Menyimpan flag is_admin.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper: apakah user saat ini adalah admin (profiles.is_admin = true).
-- Dipakai oleh RLS policy di seluruh tabel katalog.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (
      select p.is_admin
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    ),
    false
  );
$$;

-- Helper: apakah belum ada admin sama sekali (untuk bootstrap admin pertama).
create or replace function public.has_no_admin()
returns boolean
language sql
security definer
stable
as $$
  select not exists (select 1 from public.profiles where is_admin = true);
$$;

-- Auto-buat profile saat user signup baru. Admin pertama ditandai
-- bila belum ada admin lain (jalur bootstrap satu kali).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, is_admin)
  values (
    new.id,
    new.email,
    public.has_no_admin()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: timestamp updated_at otomatis.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- RLS: profiles
-- ============================================================
alter table public.profiles enable row level security;

-- User bisa melihat profile sendiri. Admin bisa melihat semua (untuk dashboard).
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- User bisa update profile sendiri (mis. nama), admin bisa update semua.
-- Flag is_admin hanya bisa diubah oleh admin yang sudah ada (anti-escalation).
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (
    -- Perubahan is_admin hanya boleh oleh admin yang sudah ada.
    -- Saat belum ada admin sama sekali, baru diperbolehkan (bootstrap).
    (new.is_admin = old.is_admin) or public.is_admin() or public.has_no_admin()
  );

-- Tidak ada delete langsung dari client; user dihapus via auth.users.
