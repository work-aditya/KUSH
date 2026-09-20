-- ============================================================================
-- COACHKUSH PRODUCTION SUPABASE DATABASE MIGRATION
-- VERSION: 2.0 — SQL-SAFE
-- Target: supabase/migrations/001_initial_coachkush_schema.sql
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- ============================================================================
-- 2. CORE TABLES & ENUMS
-- ============================================================================

-- ROLES
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- PROFILES (1-to-1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- USER ROLES (Many-to-Many users to roles)
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- STAFF DETAILS
create table if not exists public.staff_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  employee_id text not null unique,
  department text,
  designation text,
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  plan_type text not null check (plan_type in ('single', 'couple')),
  description text,
  price numeric(12,2) not null check (price >= 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  duration_months integer not null check (duration_months > 0),
  sessions integer not null check (sessions > 0),
  sku text not null unique,
  image_url text,
  highlighted boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PRODUCT FEATURES
create table if not exists public.product_features (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  feature_text text not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now()
);

-- PRODUCT IMAGES
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  shipping_address_id uuid references public.addresses(id) on delete set null,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  status text not null default 'pending' check (
    status in (
      'pending',
      'payment_pending',
      'paid',
      'processing',
      'confirmed',
      'completed',
      'cancelled',
      'failed',
      'refunded'
    )
  ),
  coupon_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ORDER ITEMS (Historical Snapshot)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

-- COUPONS
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  minimum_order_amount numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  max_discount_amount numeric(12,2) check (max_discount_amount is null or max_discount_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null default 'razorpay' check (provider = 'razorpay'),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (
    status in (
      'created',
      'authorized',
      'captured',
      'failed',
      'refunded',
      'partially_refunded'
    )
  ),
  method text,
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PAYMENT EVENTS (Webhook Log & Idempotency)
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  razorpay_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- ORDER STATUS HISTORY
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- PROGRAM ENROLLMENTS
create table if not exists public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  start_date date,
  end_date date,
  status text not null default 'pending' check (
    status in (
      'pending',
      'active',
      'paused',
      'completed',
      'cancelled'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_enrollment_dates check (end_date is null or start_date is null or end_date >= start_date)
);

-- ORDER ASSIGNMENTS
create table if not exists public.order_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  staff_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  constraint uq_order_staff unique (order_id, staff_id)
);

-- AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- CONTACT MESSAGES
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CMS PAGES
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
create index if not exists idx_profiles_phone on public.profiles(phone);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_categories_active on public.categories(is_active);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_plan_type on public.products(plan_type);
create index if not exists idx_product_features_product_order on public.product_features(product_id, display_order);
create index if not exists idx_product_images_product_order on public.product_images(product_id, display_order);
create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_addresses_user_default on public.addresses(user_id, is_default);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_customer_status on public.orders(customer_id, status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_coupons_active_dates on public.coupons(is_active, starts_at, expires_at);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_razorpay_order_id on public.payments(razorpay_order_id);
create index if not exists idx_payments_razorpay_payment_id on public.payments(razorpay_payment_id);
create index if not exists idx_payments_created_at on public.payments(created_at desc);
create index if not exists idx_payment_events_payment_id on public.payment_events(payment_id);
create index if not exists idx_payment_events_event_type on public.payment_events(event_type);
create index if not exists idx_payment_events_created_at on public.payment_events(created_at desc);
create index if not exists idx_order_status_history_order_created on public.order_status_history(order_id, created_at desc);
create index if not exists idx_order_status_history_changed_by on public.order_status_history(changed_by);
create index if not exists idx_enrollments_customer_id on public.program_enrollments(customer_id);
create index if not exists idx_enrollments_product_id on public.program_enrollments(product_id);
create index if not exists idx_enrollments_order_id on public.program_enrollments(order_id);
create index if not exists idx_enrollments_status on public.program_enrollments(status);
create index if not exists idx_order_assignments_order_id on public.order_assignments(order_id);
create index if not exists idx_order_assignments_staff_id on public.order_assignments(staff_id);
create index if not exists idx_order_assignments_assigned_by on public.order_assignments(assigned_by);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- ============================================================================
-- 4. HELPER & SECURITY FUNCTIONS
-- ============================================================================

-- Check if current authenticated user has requested role
create or replace function public.has_role(requested_role text)
returns boolean as $$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = requested_role
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Check if current authenticated user has admin role
create or replace function public.is_admin()
returns boolean as $$
begin
  return public.has_role('admin');
end;
$$ language plpgsql security definer set search_path = public;

-- Check if current authenticated user has staff or admin role
create or replace function public.is_staff()
returns boolean as $$
begin
  return public.has_role('staff') or public.has_role('admin');
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- 5. AUTOMATIC TRIGGERS
-- ============================================================================

-- 1. Maintain updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_staff_details_updated_at before update on public.staff_details for each row execute procedure public.handle_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute procedure public.handle_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute procedure public.handle_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute procedure public.handle_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();
create trigger set_coupons_updated_at before update on public.coupons for each row execute procedure public.handle_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute procedure public.handle_updated_at();
create trigger set_program_enrollments_updated_at before update on public.program_enrollments for each row execute procedure public.handle_updated_at();
create trigger set_contact_messages_updated_at before update on public.contact_messages for each row execute procedure public.handle_updated_at();
create trigger set_cms_pages_updated_at before update on public.cms_pages for each row execute procedure public.handle_updated_at();

-- 2. Automatically create profile & default customer role on auth.users sign-up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  customer_role_id uuid;
begin
  -- Create user profile
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;

  -- Assign default customer role
  select id into customer_role_id from public.roles where name = 'customer' limit 1;
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Ensure at most one default address per user
create or replace function public.handle_default_address()
returns trigger as $$
begin
  if new.is_default = true then
    update public.addresses
    set is_default = false
    where user_id = new.user_id
      and id != new.id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists ensure_single_default_address on public.addresses;
create trigger ensure_single_default_address
  before insert or update of is_default on public.addresses
  for each row
  when (new.is_default = true)
  execute procedure public.handle_default_address();

-- 4. Record order status changes automatically
create or replace function public.handle_order_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by,
      note
    ) values (
      new.id,
      old.status,
      new.status,
      auth.uid(),
      'Status transitioned from ' || coalesce(old.status, 'none') || ' to ' || new.status
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_order_status_change on public.orders;
create trigger on_order_status_change
  after update of status on public.orders
  for each row
  execute procedure public.handle_order_status_change();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.staff_details enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_features enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_status_history enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.order_assignments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.cms_pages enable row level security;

-- ROLES
create policy "Anyone can read roles" on public.roles
  for select using (true);

create policy "Admins manage roles" on public.roles
  for all using (public.is_admin());

-- PROFILES
create policy "Users read own profile" on public.profiles
  for select using ((select auth.uid()) = id or public.is_staff());

create policy "Users update own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Admins full manage profiles" on public.profiles
  for all using (public.is_admin());

-- USER ROLES
create policy "Users read own user_roles" on public.user_roles
  for select using ((select auth.uid()) = user_id or public.is_admin());

create policy "Admins manage user_roles" on public.user_roles
  for all using (public.is_admin());

-- STAFF DETAILS
create policy "Staff read own staff details" on public.staff_details
  for select using ((select auth.uid()) = user_id or public.is_admin());

create policy "Admins manage staff details" on public.staff_details
  for all using (public.is_admin());

-- CATEGORIES
create policy "Public read active categories" on public.categories
  for select using (is_active = true or public.is_staff());

create policy "Admins manage categories" on public.categories
  for all using (public.is_admin());

-- PRODUCTS
create policy "Public read active products" on public.products
  for select using (is_active = true or public.is_staff());

create policy "Admins manage products" on public.products
  for all using (public.is_admin());

-- PRODUCT FEATURES
create policy "Public read product features" on public.product_features
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_features.product_id
        and (p.is_active = true or public.is_staff())
    )
  );

create policy "Admins manage product features" on public.product_features
  for all using (public.is_admin());

-- PRODUCT IMAGES
create policy "Public read product images" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (p.is_active = true or public.is_staff())
    )
  );

create policy "Admins manage product images" on public.product_images
  for all using (public.is_admin());

-- ADDRESSES
create policy "Users select own addresses" on public.addresses
  for select using ((select auth.uid()) = user_id or public.is_staff());

create policy "Users insert own addresses" on public.addresses
  for insert with check ((select auth.uid()) = user_id);

create policy "Users update own addresses" on public.addresses
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users delete own addresses" on public.addresses
  for delete using ((select auth.uid()) = user_id);

-- ORDERS
create policy "Customers select own orders" on public.orders
  for select using (
    (select auth.uid()) = customer_id
    or public.is_admin()
    or exists (
      select 1 from public.order_assignments oa
      where oa.order_id = orders.id and oa.staff_id = (select auth.uid())
    )
  );

create policy "Customers create own orders" on public.orders
  for insert with check ((select auth.uid()) = customer_id);

create policy "Admins and assigned staff update orders" on public.orders
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.order_assignments oa
      where oa.order_id = orders.id and oa.staff_id = (select auth.uid())
    )
  );

-- ORDER ITEMS
create policy "Customers and staff read order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.customer_id = (select auth.uid())
          or public.is_admin()
          or exists (
            select 1 from public.order_assignments oa
            where oa.order_id = o.id and oa.staff_id = (select auth.uid())
          )
        )
    )
  );

create policy "Admins manage order items" on public.order_items
  for all using (public.is_admin());

-- COUPONS
create policy "Public read active coupons" on public.coupons
  for select using (is_active = true or public.is_admin());

create policy "Admins manage coupons" on public.coupons
  for all using (public.is_admin());

-- PAYMENTS
create policy "Customers and staff read payments" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and (o.customer_id = (select auth.uid()) or public.is_admin())
    )
  );

create policy "Admins manage payments" on public.payments
  for all using (public.is_admin());

-- PAYMENT EVENTS
create policy "Admins view payment events" on public.payment_events
  for all using (public.is_admin());

-- ORDER STATUS HISTORY
create policy "Customers and staff read status history" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (o.customer_id = (select auth.uid()) or public.is_staff())
    )
  );

create policy "Staff insert status history" on public.order_status_history
  for insert with check (public.is_staff());

-- PROGRAM ENROLLMENTS
create policy "Customers and staff read enrollments" on public.program_enrollments
  for select using (
    (select auth.uid()) = customer_id
    or public.is_admin()
    or exists (
      select 1 from public.order_assignments oa
      where oa.order_id = program_enrollments.order_id and oa.staff_id = (select auth.uid())
    )
  );

create policy "Staff and Admin manage enrollments" on public.program_enrollments
  for all using (public.is_staff());

-- ORDER ASSIGNMENTS
create policy "Staff view assigned orders" on public.order_assignments
  for select using ((select auth.uid()) = staff_id or public.is_admin());

create policy "Admins manage order assignments" on public.order_assignments
  for all using (public.is_admin());

-- AUDIT LOGS
create policy "Admins view audit logs" on public.audit_logs
  for select using (public.is_admin());

-- CONTACT MESSAGES
create policy "Anyone can submit contact messages" on public.contact_messages
  for insert with check (true);

create policy "Staff and Admins manage contact messages" on public.contact_messages
  for all using (public.is_staff());

-- CMS PAGES
create policy "Public read published cms pages" on public.cms_pages
  for select using (is_published = true or public.is_staff());

create policy "Admins manage cms pages" on public.cms_pages
  for all using (public.is_admin());

-- ============================================================================
-- 7. STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product-images bucket" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admins upload product-images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

create policy "Owners read avatars" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and ((select auth.uid())::text = (storage.foldername(name))[1] or public.is_admin())
  );

create policy "Owners upload avatars" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 8. SEED DATA
-- ============================================================================

-- Roles
insert into public.roles (name, description)
values
  ('admin', 'Full platform administration'),
  ('staff', 'Coach/staff operational access'),
  ('customer', 'Customer access')
on conflict (name) do nothing;

-- Category
insert into public.categories (name, slug, description, is_active)
values
  ('Coaching Plans', 'coaching-plans', 'Live fitness coaching plans', true)
on conflict (slug) do nothing;

-- Four Official Products and Features
do $$
declare
  cat_id uuid;
  prod1_id uuid;
  prod2_id uuid;
  prod3_id uuid;
  prod4_id uuid;
begin
  select id into cat_id from public.categories where slug = 'coaching-plans' limit 1;

  -- 1. Session 12 - Single
  insert into public.products (
    category_id, name, slug, plan_type, description,
    price, currency, duration_months, sessions, sku,
    highlighted, is_active
  ) values (
    cat_id,
    'Session 12 - Single',
    'session-12-single',
    'single',
    '1-month personalized fitness coaching plan',
    8999.00,
    'INR',
    1,
    12,
    'CK-S12-SINGLE',
    false,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions,
    plan_type = excluded.plan_type,
    duration_months = excluded.duration_months
  returning id into prod1_id;

  delete from public.product_features where product_id = prod1_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod1_id, '12 Live 1-on-1 Video Sessions', 1),
    (prod1_id, 'Personalized Workout Program', 2),
    (prod1_id, 'Nutrition & Calorie Guidance', 3),
    (prod1_id, 'Weekly Form Review & Adjustments', 4),
    (prod1_id, 'Direct WhatsApp Support with Kush', 5);

  -- 2. Session 12 - Couple
  insert into public.products (
    category_id, name, slug, plan_type, description,
    price, currency, duration_months, sessions, sku,
    highlighted, is_active
  ) values (
    cat_id,
    'Session 12 - Couple',
    'session-12-couple',
    'couple',
    '1-month joint fitness coaching plan',
    14999.00,
    'INR',
    1,
    12,
    'CK-S12-COUPLE',
    false,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions,
    plan_type = excluded.plan_type,
    duration_months = excluded.duration_months
  returning id into prod2_id;

  delete from public.product_features where product_id = prod2_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod2_id, '12 Joint Video Sessions', 1),
    (prod2_id, 'Custom Programs for Both Individuals', 2),
    (prod2_id, 'Dual Nutrition & Habit Tracking', 3),
    (prod2_id, 'Partner Motivation & Accountability', 4),
    (prod2_id, 'Dedicated WhatsApp Group with Kush', 5);

  -- 3. Session 24 - Single
  insert into public.products (
    category_id, name, slug, plan_type, description,
    price, currency, duration_months, sessions, sku,
    highlighted, is_active
  ) values (
    cat_id,
    'Session 24 - Single',
    'session-24-single',
    'single',
    '2-month personalized transformation coaching plan',
    14999.00,
    'INR',
    2,
    24,
    'CK-S24-SINGLE',
    true,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions,
    plan_type = excluded.plan_type,
    duration_months = excluded.duration_months,
    highlighted = excluded.highlighted
  returning id into prod3_id;

  delete from public.product_features where product_id = prod3_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod3_id, '24 Live 1-on-1 Video Sessions', 1),
    (prod3_id, 'Complete Periodized Transformation Plan', 2),
    (prod3_id, 'Macro & Meal Plan Optimization', 3),
    (prod3_id, 'Bi-weekly Body Composition Check-ins', 4),
    (prod3_id, 'Priority Schedule Slots and 24/7 WhatsApp', 5);

  -- 4. Session 24 - Couple
  insert into public.products (
    category_id, name, slug, plan_type, description,
    price, currency, duration_months, sessions, sku,
    highlighted, is_active
  ) values (
    cat_id,
    'Session 24 - Couple',
    'session-24-couple',
    'couple',
    '2-month joint transformation coaching plan',
    24999.00,
    'INR',
    2,
    24,
    'CK-S24-COUPLE',
    false,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions,
    plan_type = excluded.plan_type,
    duration_months = excluded.duration_months
  returning id into prod4_id;

  delete from public.product_features where product_id = prod4_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod4_id, '24 Joint Video Coaching Sessions', 1),
    (prod4_id, 'Dual Transformation Periodization', 2),
    (prod4_id, 'Synchronized Nutrition Strategy', 3),
    (prod4_id, 'Shared Milestone Tracking and Form Audits', 4),
    (prod4_id, 'VIP WhatsApp Support with Kush', 5);
end $$;

-- Default promotional coupons
insert into public.coupons (code, discount_type, discount_value, minimum_order_amount, is_active)
values
  ('KUSH10', 'percentage', 10.00, 0, true),
  ('TRANSFORM500', 'fixed', 500.00, 5000.00, true)
on conflict (code) do nothing;

-- Default CMS pages
insert into public.cms_pages (slug, title, is_published, content)
values
  ('about', 'About CoachKush', true, '{}'::jsonb),
  ('terms', 'Terms and Conditions', true, '{}'::jsonb),
  ('privacy', 'Privacy Policy', true, '{}'::jsonb)
on conflict (slug) do nothing;
