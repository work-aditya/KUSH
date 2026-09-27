-- ============================================================================
-- COACHKUSH MIGRATION: 004_update_pricing_plans_and_features.sql
-- Description: Add Diet Plan & Custom Workout Plan, update all plan features with detailed, professional items
-- ============================================================================

-- 1. Ensure duration text column exists for explicit display (e.g. '4 Weeks', '1 Month', '2 Months')
alter table public.products add column if not exists duration text;

-- 2. Update existing products and insert new plans
do $$
declare
  cat_id uuid;
  prod_diet_id uuid;
  prod_workout_id uuid;
  prod_s12_s_id uuid;
  prod_s12_c_id uuid;
  prod_s24_s_id uuid;
  prod_s24_c_id uuid;
begin
  select id into cat_id from public.categories where slug = 'coaching-plans' limit 1;

  -- --------------------------------------------------------------------------
  -- 1. Diet Plan (₹7,999 / 4 Weeks)
  -- --------------------------------------------------------------------------
  insert into public.products (
    category_id, name, slug, plan_type, description,
    price, currency, duration_months, duration, sessions, sku,
    highlighted, is_active
  ) values (
    cat_id,
    'Diet Plan',
    'diet-plan',
    'single',
    'Personalized nutrition plan with custom meal options, macro targets, and ongoing diet adjustments.',
    7999.00,
    'INR',
    1,
    '4 Weeks',
    4,
    'CK-DIET-PLAN-4W',
    false,
    true
  )
  on conflict (slug) do update set
    name = excluded.name,
    price = excluded.price,
    description = excluded.description,
    duration_months = excluded.duration_months,
    duration = excluded.duration,
    sessions = excluded.sessions,
    sku = excluded.sku,
    plan_type = excluded.plan_type,
    is_active = excluded.is_active
  returning id into prod_diet_id;

  delete from public.product_features where product_id = prod_diet_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod_diet_id, 'Personalized diet plan', 1),
    (prod_diet_id, 'Vegetarian / Non-Vegetarian options', 2),
    (prod_diet_id, 'Custom meal plan based on preferences', 3),
    (prod_diet_id, 'Weekly diet adjustments', 4),
    (prod_diet_id, 'Calorie & macro-based planning', 5),
    (prod_diet_id, 'Food allergy/intolerance consideration', 6),
    (prod_diet_id, 'Meal timing guidance', 7),
    (prod_diet_id, 'Hydration guidance', 8),
    (prod_diet_id, 'Practical meal/substitution options', 9),
    (prod_diet_id, 'WhatsApp support', 10);

  -- --------------------------------------------------------------------------
  -- 2. Custom Workout Plan (₹5,999 / 4 Weeks)
  -- --------------------------------------------------------------------------
  insert into public.products (
    category_id, name, slug, plan_type, description,
    price, currency, duration_months, duration, sessions, sku,
    highlighted, is_active
  ) values (
    cat_id,
    'Custom Workout Plan',
    'custom-workout-plan',
    'single',
    'Tailored training program customized to your equipment, goals, and experience with exercise video cues.',
    5999.00,
    'INR',
    1,
    '4 Weeks',
    4,
    'CK-WORKOUT-PLAN-4W',
    false,
    true
  )
  on conflict (slug) do update set
    name = excluded.name,
    price = excluded.price,
    description = excluded.description,
    duration_months = excluded.duration_months,
    duration = excluded.duration,
    sessions = excluded.sessions,
    sku = excluded.sku,
    plan_type = excluded.plan_type,
    is_active = excluded.is_active
  returning id into prod_workout_id;

  delete from public.product_features where product_id = prod_workout_id;
  insert into public.product_features (product_id, feature_text, display_order)
  values
    (prod_workout_id, 'Personalized workout plan', 1),
    (prod_workout_id, 'Home / Gym workout options', 2),
    (prod_workout_id, 'Goal-based training', 3),
    (prod_workout_id, 'Progressive workout structure', 4),
    (prod_workout_id, 'Weekly workout adjustments', 5),
    (prod_workout_id, 'Exercise form/video guidance', 6),
    (prod_workout_id, 'Workout duration planning', 7),
    (prod_workout_id, 'Injury/limitation considerations', 8),
    (prod_workout_id, 'Weekly schedule', 9),
    (prod_workout_id, 'WhatsApp support', 10);

  -- --------------------------------------------------------------------------
  -- 3. Session 12 - Single (₹8,999 / 1 Month)
  -- --------------------------------------------------------------------------
  update public.products
  set duration = '1 Month'
  where slug = 'session-12-single'
  returning id into prod_s12_s_id;

  if prod_s12_s_id is not null then
    delete from public.product_features where product_id = prod_s12_s_id;
    insert into public.product_features (product_id, feature_text, display_order)
    values
      (prod_s12_s_id, '12 Live 1-on-1 video sessions', 1),
      (prod_s12_s_id, 'Real-time form cues & posture correction', 2),
      (prod_s12_s_id, 'Personalized workout program', 3),
      (prod_s12_s_id, 'Nutrition & calorie guidance', 4),
      (prod_s12_s_id, 'Weekly form review & adjustments', 5),
      (prod_s12_s_id, 'Direct WhatsApp support with Kush', 6);
  end if;

  -- --------------------------------------------------------------------------
  -- 4. Session 12 - Couple (₹14,999 / 1 Month)
  -- --------------------------------------------------------------------------
  update public.products
  set duration = '1 Month'
  where slug = 'session-12-couple'
  returning id into prod_s12_c_id;

  if prod_s12_c_id is not null then
    delete from public.product_features where product_id = prod_s12_c_id;
    insert into public.product_features (product_id, feature_text, display_order)
    values
      (prod_s12_c_id, '12 Live interactive couple sessions', 1),
      (prod_s12_c_id, 'Custom programs for both individuals', 2),
      (prod_s12_c_id, 'Dual nutrition & habit tracking', 3),
      (prod_s12_c_id, 'Simultaneous form correction', 4),
      (prod_s12_c_id, 'Partner motivation & accountability', 5),
      (prod_s12_c_id, 'Dedicated WhatsApp group with Kush', 6);
  end if;

  -- --------------------------------------------------------------------------
  -- 5. Session 24 - Single (₹14,999 / 2 Months)
  -- --------------------------------------------------------------------------
  update public.products
  set duration = '2 Months'
  where slug = 'session-24-single'
  returning id into prod_s24_s_id;

  if prod_s24_s_id is not null then
    delete from public.product_features where product_id = prod_s24_s_id;
    insert into public.product_features (product_id, feature_text, display_order)
    values
      (prod_s24_s_id, '24 Live 1-on-1 video coaching sessions', 1),
      (prod_s24_s_id, 'Complete periodized transformation plan', 2),
      (prod_s24_s_id, 'Macro & meal plan optimization', 3),
      (prod_s24_s_id, 'Bi-weekly body composition check-ins', 4),
      (prod_s24_s_id, 'Priority schedule booking slots', 5),
      (prod_s24_s_id, 'VIP 24/7 WhatsApp support with Kush', 6);
  end if;

  -- --------------------------------------------------------------------------
  -- 6. Session 24 - Couple (₹24,999 / 2 Months)
  -- --------------------------------------------------------------------------
  update public.products
  set duration = '2 Months'
  where slug = 'session-24-couple'
  returning id into prod_s24_c_id;

  if prod_s24_c_id is not null then
    delete from public.product_features where product_id = prod_s24_c_id;
    insert into public.product_features (product_id, feature_text, display_order)
    values
      (prod_s24_c_id, '24 Live joint video coaching sessions', 1),
      (prod_s24_c_id, 'Dual transformation periodization', 2),
      (prod_s24_c_id, 'Synchronized dual nutrition strategy', 3),
      (prod_s24_c_id, 'Shared milestone tracking & form audits', 4),
      (prod_s24_c_id, 'Priority partner scheduling slots', 5),
      (prod_s24_c_id, 'Dedicated VIP WhatsApp group with Kush', 6);
  end if;

end $$;
