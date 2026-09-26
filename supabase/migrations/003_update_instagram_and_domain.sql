-- ============================================================================
-- COACHKUSH MIGRATION: 003_update_instagram_and_domain.sql
-- Description: Update official Instagram handle to @coachhkush and configure domain defaults
-- ============================================================================

-- 1. Update existing site_settings row to use @coachhkush
update public.site_settings
set 
  instagram_url = 'https://instagram.com/coachhkush',
  updated_at = now()
where id = 'general';

-- 2. Update default constraint on site_settings table
alter table public.site_settings 
  alter column instagram_url set default 'https://instagram.com/coachhkush';
