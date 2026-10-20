-- ============================================================================
-- COACHKUSH MIGRATION: 008_add_diet_and_workout_combo_product.sql
-- Description: Provision Combos Offer (Customise Diet + Customise Workout) for ₹12,999
-- ============================================================================

DO $$
DECLARE
  cat_id uuid;
  prod_combo_id uuid;
BEGIN
  -- 1. Locate the coaching-plans category
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'coaching-plans' LIMIT 1;
  IF cat_id IS NULL THEN
    cat_id := 'e13f28f0-ad00-4dae-b74c-bc0e788da434'::uuid;
  END IF;

  -- 2. Upsert Combos Offer (Customise Diet + Customise Workout) for ₹12,999
  INSERT INTO public.products (
    id,
    category_id,
    name,
    slug,
    plan_type,
    description,
    price,
    currency,
    duration_months,
    duration,
    sessions,
    sku,
    highlighted,
    is_active
  ) VALUES (
    'c03b0000-0000-0000-0000-000000000001',
    cat_id,
    'Combos Offer (Customise Diet + Customise Workout)',
    'combo-diet-workout',
    'single',
    'Complete all-in-one transformation combo: tailored workout structure plus personalized nutrition plan with weekly check-ins and direct coach support.',
    12999.00,
    'INR',
    1,
    '4 Weeks',
    4,
    'CK-COMBO-DIET-WORKOUT-4W',
    false,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    duration_months = EXCLUDED.duration_months,
    duration = EXCLUDED.duration,
    sessions = EXCLUDED.sessions,
    sku = EXCLUDED.sku,
    plan_type = EXCLUDED.plan_type,
    is_active = EXCLUDED.is_active
  RETURNING id INTO prod_combo_id;

  -- 3. Populate product features
  DELETE FROM public.product_features WHERE product_id = prod_combo_id;

  INSERT INTO public.product_features (product_id, feature_text, display_order)
  VALUES
    (prod_combo_id, 'Personalized custom diet plan', 1),
    (prod_combo_id, 'Tailored custom workout plan (Home / Gym)', 2),
    (prod_combo_id, 'Goal-based progressive training structure', 3),
    (prod_combo_id, 'Calorie & macro-based meal targets', 4),
    (prod_combo_id, 'Weekly diet & workout adjustments', 5),
    (prod_combo_id, 'Exercise form & video guidance cues', 6),
    (prod_combo_id, 'Vegetarian & Non-Vegetarian meal options', 7),
    (prod_combo_id, 'Injury & lifestyle limitation considerations', 8),
    (prod_combo_id, 'Meal timing & hydration guidance', 9),
    (prod_combo_id, 'Direct WhatsApp support with Kush', 10);

END $$;
