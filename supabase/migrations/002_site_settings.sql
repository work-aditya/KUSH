-- ============================================================================
-- COACHKUSH MIGRATION: 002_site_settings.sql
-- Description: Dynamic Site & Footer Configuration (Instagram, WhatsApp, Bio, Contacts)
-- ============================================================================

create table if not exists public.site_settings (
  id text primary key default 'general',
  whatsapp_number text not null default '+91 70428 58524',
  whatsapp_url text not null default 'https://wa.me/917042858524',
  instagram_url text not null default 'https://instagram.com/coachkush',
  youtube_url text default '',
  email text not null default 'support@coachkush.com',
  phone text not null default '+91 70428 58524',
  footer_tagline text not null default 'Elite 1-on-1 and partner fitness coaching led directly by Kush. Delivering tailored body transformations, strength conditioning, and progressive overload tracking through live, interactive video coaching on Google Meet and Zoom.',
  footer_copyright text not null default 'CoachKush. All rights reserved. Designed for elite performance & online accountability.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row-Level Security
alter table public.site_settings enable row level security;

-- 1. Anyone (public, anonymous, authenticated) can read site settings
create policy "Public read site settings" on public.site_settings
  for select using (true);

-- 2. Only administrators can insert or modify site settings
create policy "Admins manage site settings" on public.site_settings
  for all using (public.is_admin());

-- 3. Automatic updated_at trigger
drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute procedure public.handle_updated_at();

-- 4. Seed initial default general settings row
insert into public.site_settings (
  id,
  whatsapp_number,
  whatsapp_url,
  instagram_url,
  youtube_url,
  email,
  phone,
  footer_tagline,
  footer_copyright
)
values (
  'general',
  '+91 70428 58524',
  'https://wa.me/917042858524',
  'https://instagram.com/coachkush',
  '',
  'support@coachkush.com',
  '+91 70428 58524',
  'Elite 1-on-1 and partner fitness coaching led directly by Kush. Delivering tailored body transformations, strength conditioning, and progressive overload tracking through live, interactive video coaching on Google Meet and Zoom.',
  'CoachKush. All rights reserved. Designed for elite performance & online accountability.'
)
on conflict (id) do nothing;
