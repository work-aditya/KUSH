-- ============================================================================
-- COACHKUSH POSTGRESQL SCHEMA MIGRATION
-- Blueprint: supabase-razorpay-react-javascript.yaml
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- PROFILES (1-to-1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ROLES
create table if not exists public.roles (
  id bigint generated always as identity primary key,
  name text unique not null,
  description text,
  created_at timestamptz default now()
);

-- USER ROLES (Many-to-Many users to roles)
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- STAFF DETAILS
create table if not exists public.staff_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  employee_id text unique not null,
  department text,
  designation text,
  joined_at date,
  created_at timestamptz default now()
);

-- CATEGORIES
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text unique not null,
  slug text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- PRODUCTS (Source of truth for the 4 product cards)
create table if not exists public.products (
  id bigint generated always as identity primary key,
  category_id bigint references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  plan_type text, -- '1-on-1-single', 'couple-partner'
  description text,
  price numeric(12,2) not null check (price >= 0),
  currency text default 'INR',
  duration_months integer,
  sessions integer,
  sku text unique,
  image_url text,
  highlighted boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRODUCT FEATURES
create table if not exists public.product_features (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  feature_text text not null,
  display_order integer default 0
);

-- PRODUCT IMAGES
create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer default 0,
  is_primary boolean default false
);

-- ADDRESSES
create table if not exists public.addresses (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text default 'India',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text unique not null,
  customer_id uuid not null references public.profiles(id),
  shipping_address_id bigint references public.addresses(id) on delete set null,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_amount numeric(12,2) default 0 check (discount_amount >= 0),
  tax_amount numeric(12,2) default 0 check (tax_amount >= 0),
  shipping_amount numeric(12,2) default 0 check (shipping_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text default 'INR',
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  coupon_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS (Purchased product snapshot)
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  created_at timestamptz default now()
);

-- PAYMENTS
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete restrict,
  provider text default 'razorpay',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency text default 'INR',
  status text default 'created' check (status in ('created', 'authorized', 'captured', 'paid', 'failed', 'refunded')),
  method text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PAYMENT EVENTS (Idempotent Webhook Log)
create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  payment_id bigint references public.payments(id) on delete set null,
  razorpay_event_id text unique,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- ORDER STATUS HISTORY
create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz default now()
);

-- COUPONS
create table if not exists public.coupons (
  id bigint generated always as identity primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  minimum_order_amount numeric(12,2) default 0,
  max_discount_amount numeric(12,2),
  usage_limit integer,
  used_count integer default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- AUDIT LOGS
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

-- PROGRAM ENROLLMENTS (Client coaching access)
create table if not exists public.program_enrollments (
  id bigint generated always as identity primary key,
  customer_id uuid not null references public.profiles(id),
  product_id bigint not null references public.products(id),
  order_id bigint references public.orders(id),
  start_date date default current_date,
  end_date date,
  status text default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz default now()
);

-- ORDER ASSIGNMENTS (Assign coaches to orders)
create table if not exists public.order_assignments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  staff_id uuid not null references public.profiles(id),
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz default now()
);

-- CONTACT MESSAGES (Support & Inquiries)
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz default now()
);

-- CMS PAGES (Dynamic legal & marketing content)
create table if not exists public.cms_pages (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  content text not null,
  published boolean default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_product_features_prod on public.product_features(product_id);
create index if not exists idx_product_images_prod on public.product_images(product_id);
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_rzp_order on public.payments(razorpay_order_id);
create index if not exists idx_payments_rzp_payment on public.payments(razorpay_payment_id);
create index if not exists idx_payment_events_event on public.payment_events(razorpay_event_id);
create index if not exists idx_enrollments_customer on public.program_enrollments(customer_id);
create index if not exists idx_coupons_code on public.coupons(code);

-- ============================================================================
-- 4. HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Check if user has admin role
create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean as $$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = check_user_id
      and r.name = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Check if user has staff role
create or replace function public.is_staff(check_user_id uuid default auth.uid())
returns boolean as $$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = check_user_id
      and r.name in ('staff', 'admin')
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Automatic profile & role creation on auth.users sign-up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  customer_role_id bigint;
begin
  -- 1. Create Profile
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;

  -- 2. Assign 'customer' role
  select id into customer_role_id from public.roles where name = 'customer';
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at before update on public.products for each row execute procedure public.handle_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute procedure public.handle_updated_at();
create trigger set_cms_pages_updated_at before update on public.cms_pages for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.staff_details enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_features enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_status_history enable row level security;
alter table public.coupons enable row level security;
alter table public.audit_logs enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.order_assignments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.cms_pages enable row level security;

-- PROFILES
create policy "Users can read own profile" on public.profiles
  for select using ((select auth.uid()) = id or public.is_staff((select auth.uid())));

create policy "Users can update own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Admins full manage profiles" on public.profiles
  for all using (public.is_admin((select auth.uid())));

-- ROLES & USER ROLES
create policy "Anyone can read roles" on public.roles
  for select using (true);

create policy "Admins manage roles" on public.roles
  for all using (public.is_admin((select auth.uid())));

create policy "Users can read own user_roles" on public.user_roles
  for select using ((select auth.uid()) = user_id or public.is_admin((select auth.uid())));

create policy "Admins manage user_roles" on public.user_roles
  for all using (public.is_admin((select auth.uid())));

-- STAFF DETAILS
create policy "Staff read own details" on public.staff_details
  for select using ((select auth.uid()) = user_id or public.is_admin((select auth.uid())));

create policy "Admins manage staff details" on public.staff_details
  for all using (public.is_admin((select auth.uid())));

-- CATEGORIES
create policy "Public read active categories" on public.categories
  for select using (is_active = true or public.is_staff((select auth.uid())));

create policy "Admins manage categories" on public.categories
  for all using (public.is_admin((select auth.uid())));

-- PRODUCTS
create policy "Public read active products" on public.products
  for select using (is_active = true or public.is_staff((select auth.uid())));

create policy "Admins manage products" on public.products
  for all using (public.is_admin((select auth.uid())));

-- PRODUCT FEATURES & IMAGES
create policy "Public read product features" on public.product_features
  for select using (true);

create policy "Admins manage product features" on public.product_features
  for all using (public.is_admin((select auth.uid())));

create policy "Public read product images" on public.product_images
  for select using (true);

create policy "Admins manage product images" on public.product_images
  for all using (public.is_admin((select auth.uid())));

-- ADDRESSES
create policy "Users manage own addresses" on public.addresses
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Admins view all addresses" on public.addresses
  for select using (public.is_staff((select auth.uid())));

-- ORDERS
create policy "Customers read own orders" on public.orders
  for select using ((select auth.uid()) = customer_id or public.is_staff((select auth.uid())));

create policy "Customers create own orders" on public.orders
  for insert with check ((select auth.uid()) = customer_id);

create policy "Staff & Admin manage orders" on public.orders
  for all using (public.is_staff((select auth.uid())));

-- ORDER ITEMS
create policy "Customers read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_staff((select auth.uid())))
    )
  );

create policy "Staff & Admin manage order items" on public.order_items
  for all using (public.is_staff((select auth.uid())));

-- PAYMENTS
create policy "Customers read own payments" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_staff((select auth.uid())))
    )
  );

create policy "Admins view all payments" on public.payments
  for all using (public.is_admin((select auth.uid())));

-- PAYMENT EVENTS (Internal & Admin only)
create policy "Admins view payment events" on public.payment_events
  for all using (public.is_admin((select auth.uid())));

-- ORDER STATUS HISTORY
create policy "Customers view own order status history" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_staff((select auth.uid())))
    )
  );

create policy "Staff update order status history" on public.order_status_history
  for all using (public.is_staff((select auth.uid())));

-- COUPONS
create policy "Public read active coupons" on public.coupons
  for select using (is_active = true or public.is_admin((select auth.uid())));

create policy "Admins manage coupons" on public.coupons
  for all using (public.is_admin((select auth.uid())));

-- AUDIT LOGS
create policy "Admins view audit logs" on public.audit_logs
  for all using (public.is_admin((select auth.uid())));

-- PROGRAM ENROLLMENTS
create policy "Customers read own enrollments" on public.program_enrollments
  for select using ((select auth.uid()) = customer_id or public.is_staff((select auth.uid())));

create policy "Staff & Admin manage enrollments" on public.program_enrollments
  for all using (public.is_staff((select auth.uid())));

-- ORDER ASSIGNMENTS
create policy "Staff view assigned orders" on public.order_assignments
  for select using ((select auth.uid()) = staff_id or public.is_admin((select auth.uid())));

create policy "Admins manage order assignments" on public.order_assignments
  for all using (public.is_admin((select auth.uid())));

-- CONTACT MESSAGES
create policy "Anyone can submit contact message" on public.contact_messages
  for insert with check (true);

create policy "Staff & Admin manage contact messages" on public.contact_messages
  for all using (public.is_staff((select auth.uid())));

-- CMS PAGES
create policy "Public read published cms pages" on public.cms_pages
  for select using (published = true or public.is_staff((select auth.uid())));

create policy "Admins manage cms pages" on public.cms_pages
  for all using (public.is_admin((select auth.uid())));

-- ============================================================================
-- 6. STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public)
values 
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', false)
on conflict (id) do nothing;

create policy "Public read product images bucket" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin((select auth.uid())));

create policy "Owner read avatars" on storage.objects
  for select using (bucket_id = 'avatars' and ((select auth.uid())::text = (storage.foldername(name))[1] or public.is_admin((select auth.uid()))));

create policy "Owner upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- Roles
insert into public.roles (name, description)
values
  ('admin', 'Full platform administrator with unrestricted access'),
  ('staff', 'Coaches and staff members managing assigned client sessions'),
  ('customer', 'Trainee registered for online coaching')
on conflict (name) do nothing;

-- Categories
insert into public.categories (name, slug, description, is_active)
values
  ('Online Fitness Coaching', 'online-fitness-coaching', 'Official 1-on-1 and Partner live interactive online fitness coaching memberships with Coach Kush.', true)
on conflict (slug) do nothing;

-- Products & Features
do $$
declare
  cat_id bigint;
  prod1_id bigint;
  prod2_id bigint;
  prod3_id bigint;
  prod4_id bigint;
begin
  select id into cat_id from public.categories where slug = 'online-fitness-coaching' limit 1;

  -- 1. Session 12 - Single
  insert into public.products (category_id, name, slug, plan_type, description, price, currency, duration_months, sessions, sku, highlighted, is_active)
  values (
    cat_id,
    'Session 12 - Single',
    'session-12-single',
    '1-on-1-single',
    '12 live interactive 1-on-1 video coaching sessions across 1 month with customized workout and nutrition roadmap.',
    8999.00,
    'INR',
    1,
    12,
    'CK-S12-SGL',
    false,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions
  returning id into prod1_id;

  -- Features for Session 12 - Single
  delete from public.product_features where product_id = prod1_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod1_id, '12 Live 1-on-1 Video Sessions', 1),
    (prod1_id, 'Personalized Workout Program', 2),
    (prod1_id, 'Nutrition & Calorie Guidance', 3),
    (prod1_id, 'Weekly Form Review & Adjustments', 4),
    (prod1_id, 'Direct WhatsApp Support with Kush', 5);

  -- 2. Session 12 - Couple
  insert into public.products (category_id, name, slug, plan_type, description, price, currency, duration_months, sessions, sku, highlighted, is_active)
  values (
    cat_id,
    'Session 12 - Couple',
    'session-12-couple',
    'couple-partner',
    '12 live interactive partner video coaching sessions for couples or workout partners spanning 1 full month.',
    14999.00,
    'INR',
    1,
    12,
    'CK-S12-CPL',
    false,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions
  returning id into prod2_id;

  -- Features for Session 12 - Couple
  delete from public.product_features where product_id = prod2_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod2_id, '12 Joint Video Sessions', 1),
    (prod2_id, 'Custom Programs for Both Individuals', 2),
    (prod2_id, 'Dual Nutrition & Habit Tracking', 3),
    (prod2_id, 'Partner Motivation & Accountability', 4),
    (prod2_id, 'Dedicated WhatsApp Group with Kush', 5);

  -- 3. Session 24 - Single
  insert into public.products (category_id, name, slug, plan_type, description, price, currency, duration_months, sessions, sku, highlighted, is_active)
  values (
    cat_id,
    'Session 24 - Single',
    'session-24-single',
    '1-on-1-single',
    '24 comprehensive 1-on-1 coaching sessions spanning 2 full months of continuous periodized body transformation.',
    14999.00,
    'INR',
    2,
    24,
    'CK-S24-SGL',
    true,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions,
    highlighted = excluded.highlighted
  returning id into prod3_id;

  -- Features for Session 24 - Single
  delete from public.product_features where product_id = prod3_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod3_id, '24 Live 1-on-1 Video Sessions', 1),
    (prod3_id, 'Complete Periodized Transformation Plan', 2),
    (prod3_id, 'Macro & Meal Plan Optimization', 3),
    (prod3_id, 'Bi-weekly Body Composition Check-ins', 4),
    (prod3_id, 'Priority Schedule Slots & 24/7 WhatsApp', 5);

  -- 4. Session 24 - Couple
  insert into public.products (category_id, name, slug, plan_type, description, price, currency, duration_months, sessions, sku, highlighted, is_active)
  values (
    cat_id,
    'Session 24 - Couple',
    'session-24-couple',
    'couple-partner',
    '24 joint couple coaching video sessions over 2 months for double the accountability, tailored fitness, and results.',
    24999.00,
    'INR',
    2,
    24,
    'CK-S24-CPL',
    false,
    true
  )
  on conflict (slug) do update set
    price = excluded.price,
    name = excluded.name,
    sessions = excluded.sessions
  returning id into prod4_id;

  -- Features for Session 24 - Couple
  delete from public.product_features where product_id = prod4_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod4_id, '24 Joint Video Coaching Sessions', 1),
    (prod4_id, 'Dual Transformation Periodization', 2),
    (prod4_id, 'Sync\'d Nutrition Strategy', 3),
    (prod4_id, 'Shared Milestone Tracking & Form Audits', 4),
    (prod4_id, 'VIP WhatsApp Support with Kush', 5);
end $$;

-- Default promotional coupons
insert into public.coupons (code, discount_type, discount_value, minimum_order_amount, usage_limit, is_active)
values
  ('KUSH10', 'percentage', 10.00, 5000.00, 500, true),
  ('TRANSFORM500', 'fixed', 500.00, 8000.00, 200, true)
on conflict (code) do nothing;

-- Default CMS pages
insert into public.cms_pages (slug, title, content, published)
values
  (
    'privacy',
    'Privacy Policy',
    '# Privacy Policy\n\nAt CoachKush, accessible from coachkush.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by CoachKush and how we use it.\n\n### Information We Collect\nWhen you register for an account or enroll in a coaching package, we collect your name, email address, phone number, and physical fitness intake preferences.\n\n### Payment Security\nAll payments are processed securely via Razorpay under 256-bit SSL encryption. We do not store sensitive payment card details or banking credentials on our servers.',
    true
  ),
  (
    'terms',
    'Terms & Conditions',
    '# Terms and Conditions of Service\n\nWelcome to CoachKush. By accessing our website and enrolling in our fitness programs, you agree to comply with and be bound by the following terms and conditions of use.\n\n### Coaching Programs & Attendance\nAll sessions are conducted live over Google Meet or Zoom. Trainees are requested to be on time. Sessions cancelled with less than 12 hours notice may be forfeited.\n\n### Refund Policy\nDue to the dedicated time allocation for personal coaching schedules, memberships are non-refundable once the onboarding evaluation session has begun.',
    true
  )
on conflict (slug) do nothing;
