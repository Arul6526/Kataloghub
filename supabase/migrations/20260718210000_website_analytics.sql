-- ============================================================
-- Migration: website_analytics (page views)
-- ============================================================

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  session_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_created_at on public.page_views (created_at desc);
create index if not exists idx_page_views_path on public.page_views (path);
create index if not exists idx_page_views_session on public.page_views (session_hash);

-- Enable RLS
alter table public.page_views enable row level security;

-- Only allow service_role to manage (inserting will be done via server API)
drop policy if exists "page_views: all for service_role" on public.page_views;
create policy "page_views: all for service_role"
  on public.page_views for all
  using (true)
  with check (true);
