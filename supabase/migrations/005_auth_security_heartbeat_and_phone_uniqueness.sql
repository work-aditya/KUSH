-- ============================================================================
-- COACHKUSH DATABASE MIGRATION: 005_auth_security_heartbeat_and_phone_uniqueness.sql
-- Description:
--   1. Deterministic phone normalization function (E.164 canonical format).
--   2. Unique index on normalized phone in public.profiles.
--   3. Hardened handle_new_user trigger with duplicate phone detection and role enforcement.
--   4. Lightweight system_heartbeat single-row table with throttled organic and fallback RPCs.
--   5. Phone availability check RPC for frontend validation.
-- ============================================================================

-- 1. PHONE NORMALIZATION FUNCTION
-- Converts Indian and international numbers into canonical E.164 format (+919876543210)
create or replace function public.normalize_phone(p_phone text)
returns text as $$
declare
  cleaned text;
begin
  if p_phone is null or trim(p_phone) = '' then
    return null;
  end if;

  -- Strip all whitespace, dashes, parentheses, dots
  cleaned := regexp_replace(trim(p_phone), '[^\d+]', '', 'g');

  -- If starts with 0 and is 11 digits (e.g. 09876543210 -> +919876543210)
  if cleaned ~ '^0[0-9]{10}$' then
    cleaned := '+91' || substr(cleaned, 2);
  -- If exactly 10 digits without +, default to +91 (India)
  elsif cleaned ~ '^[0-9]{10}$' then
    cleaned := '+91' || cleaned;
  -- If 12 digits starting with 91, ensure leading +
  elsif cleaned ~ '^91[0-9]{10}$' then
    cleaned := '+' || cleaned;
  -- If international number without +, prepend +
  elsif cleaned !~ '^\+' and length(cleaned) >= 10 then
    cleaned := '+' || cleaned;
  end if;

  return cleaned;
end;
$$ language plpgsql immutable set search_path = public;

-- 2. UNIQUE INDEX ON NORMALIZED PHONE
-- Ensures no two accounts can share the same normalized phone number regardless of formatting differences
create unique index if not exists idx_profiles_normalized_phone
  on public.profiles (public.normalize_phone(phone))
  where phone is not null and phone != '';

-- 3. PHONE AVAILABILITY RPC (Safe for public/anon check before registration)
create or replace function public.check_phone_availability(check_phone text)
returns boolean as $$
declare
  norm text;
  taken boolean;
begin
  norm := public.normalize_phone(check_phone);
  if norm is null then
    return true;
  end if;

  select exists(
    select 1 from public.profiles
    where public.normalize_phone(phone) = norm
  ) into taken;

  return not taken;
end;
$$ language plpgsql security definer set search_path = public;

-- Grant execution to anon and authenticated
grant execute on function public.check_phone_availability(text) to anon, authenticated;

-- 4. HARDENED HANDLE_NEW_USER TRIGGER
-- Enforces:
--   a) Normalized phone storage
--   b) Clear exception on duplicate phone
--   c) Default 'customer' role assignment only (never admin or staff)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  customer_role_id uuid;
  raw_phone text;
  norm_phone text;
  existing_profile_id uuid;
  user_full_name text;
begin
  raw_phone := new.raw_user_meta_data->>'phone';
  norm_phone := public.normalize_phone(raw_phone);

  -- Duplicate phone prevention at database level
  if norm_phone is not null then
    select id into existing_profile_id
    from public.profiles
    where public.normalize_phone(phone) = norm_phone
    limit 1;

    if existing_profile_id is not null and existing_profile_id != new.id then
      raise exception 'PHONE_ALREADY_EXISTS: An account with this phone number already exists.';
    end if;
  end if;

  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '');

  -- Insert profile with normalized phone
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    user_full_name,
    norm_phone,
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    updated_at = now();

  -- Assign default customer role ONLY (never admin or staff)
  select id into customer_role_id from public.roles where name = 'customer' limit 1;
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Reattach trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. SYSTEM HEARTBEAT TABLE & PROCEDURES (Keep-alive mechanism)
-- Maintains a single row tracking organic and fallback activity
create table if not exists public.system_heartbeat (
  id text primary key default 'primary',
  last_organic_ping timestamptz not null default now(),
  last_fallback_ping timestamptz,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.system_heartbeat enable row level security;

-- Drop existing policy if present and recreate
drop policy if exists "Anyone can read system_heartbeat" on public.system_heartbeat;
create policy "Anyone can read system_heartbeat" on public.system_heartbeat
  for select using (true);

-- Seed single row if missing
insert into public.system_heartbeat (id, last_organic_ping, last_fallback_ping, updated_at)
values ('primary', now(), null, now())
on conflict (id) do nothing;

-- Procedure: Record Organic Heartbeat (Throttled)
-- If recent organic activity happened within min_interval_hours (default 12 hours), does NOTHING.
create or replace function public.record_organic_heartbeat(min_interval_hours integer default 12)
returns jsonb as $$
declare
  rec record;
  should_update boolean := false;
begin
  select * into rec from public.system_heartbeat where id = 'primary' limit 1;

  if not found then
    insert into public.system_heartbeat (id, last_organic_ping, updated_at)
    values ('primary', now(), now())
    returning * into rec;
    return jsonb_build_object('recorded', true, 'action', 'initialized', 'heartbeat', rec);
  end if;

  -- Check if last organic ping was older than threshold
  if rec.last_organic_ping is null or rec.last_organic_ping < (now() - (min_interval_hours || ' hours')::interval) then
    should_update := true;
  end if;

  if should_update then
    update public.system_heartbeat
    set last_organic_ping = now(),
        updated_at = now()
    where id = 'primary'
    returning * into rec;

    return jsonb_build_object('recorded', true, 'action', 'updated', 'heartbeat', rec);
  else
    return jsonb_build_object('recorded', false, 'action', 'throttled', 'last_organic_ping', rec.last_organic_ping);
  end if;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.record_organic_heartbeat(integer) to anon, authenticated;

-- Procedure: Record Fallback Heartbeat (External scheduled check, e.g. daily)
-- Checks whether organic activity is stale (> stale_threshold_hours, default 20 hours).
-- If fresh: DOES NOTHING.
-- If stale: Updates last_fallback_ping to keep project active.
create or replace function public.record_fallback_heartbeat(stale_threshold_hours integer default 20)
returns jsonb as $$
declare
  rec record;
  is_stale boolean := false;
begin
  select * into rec from public.system_heartbeat where id = 'primary' limit 1;

  if not found then
    insert into public.system_heartbeat (id, last_organic_ping, last_fallback_ping, updated_at)
    values ('primary', now(), now(), now())
    returning * into rec;
    return jsonb_build_object('action', 'initialized', 'heartbeat', rec);
  end if;

  -- Check if organic activity happened within stale_threshold_hours
  if rec.last_organic_ping is not null and rec.last_organic_ping >= (now() - (stale_threshold_hours || ' hours')::interval) then
    -- Organic activity is fresh! No fallback ping needed.
    return jsonb_build_object(
      'action', 'skipped',
      'reason', 'recent_organic_activity',
      'last_organic_ping', rec.last_organic_ping
    );
  end if;

  -- Organic activity is stale: perform single lightweight update
  update public.system_heartbeat
  set last_fallback_ping = now(),
      updated_at = now()
  where id = 'primary'
  returning * into rec;

  return jsonb_build_object(
    'action', 'fallback_ping_recorded',
    'heartbeat', rec
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.record_fallback_heartbeat(integer) to anon, authenticated;
