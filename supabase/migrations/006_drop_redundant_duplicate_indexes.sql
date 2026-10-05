-- Migration: 006_drop_redundant_duplicate_indexes.sql
-- Description: Drop redundant duplicate non-unique indexes that replicate existing UNIQUE constraint indexes
-- This frees disk space, reduces memory buffer usage, and improves write performance on payments, orders, products, coupons, and profiles.

DROP INDEX IF EXISTS public.idx_profiles_phone;
DROP INDEX IF EXISTS public.idx_products_slug;
DROP INDEX IF EXISTS public.idx_orders_order_number;
DROP INDEX IF EXISTS public.idx_coupons_code;
DROP INDEX IF EXISTS public.idx_payments_razorpay_order_id;
DROP INDEX IF EXISTS public.idx_payments_razorpay_payment_id;
