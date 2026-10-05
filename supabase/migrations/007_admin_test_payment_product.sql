-- Migration: 007_admin_test_payment_product.sql
-- Description: Provision admin-only ₹5 test product for live payment verification without impacting public offerings

INSERT INTO public.products (
  id,
  category_id,
  name,
  slug,
  plan_type,
  description,
  price,
  currency,
  duration,
  duration_months,
  sessions,
  sku,
  highlighted,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'e13f28f0-ad00-4dae-b74c-bc0e788da434',
  'Admin Live Test (₹5)',
  'admin-test-5rs',
  'single',
  'Live Razorpay production payment pipeline test (₹5 INR verification). Strictly for administrator testing.',
  5.00,
  'INR',
  '1 Session',
  1,
  1,
  'CK-ADMIN-TEST-5RS',
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Admin Live Test (₹5)',
  price = 5.00,
  is_active = true;

INSERT INTO public.product_features (product_id, feature_text, display_order)
VALUES
  ('a0000000-0000-0000-0000-000000000005', 'Live Razorpay ₹5 test order creation', 1),
  ('a0000000-0000-0000-0000-000000000005', 'HMAC-SHA256 signature verification test', 2),
  ('a0000000-0000-0000-0000-000000000005', 'End-to-end production webhook audit', 3),
  ('a0000000-0000-0000-0000-000000000005', 'Immediate enrollment activation verification', 4)
ON CONFLICT DO NOTHING;
