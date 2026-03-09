-- Seed test tenants (existing PlateOS clients)

INSERT INTO tenants (id, slug, name, name_en, status, subscription_tier, features, owner_email, metadata)
VALUES 
  -- Ravintola Babylon
  (
    'b1000000-0000-0000-0000-000000000001',
    'babylon',
    'Ravintola Babylon',
    'Restaurant Babylon',
    'active',
    'pro',
    '{
      "cashOnDelivery": true,
      "aiAssistant": true,
      "delivery": true,
      "pickup": true,
      "lunch": true,
      "multiBranch": false
    }'::jsonb,
    'info@ravintolababylon.fi',
    '{
      "domain": "ravintolababylon.fi",
      "city": "Lahti",
      "cuisine": "Middle Eastern"
    }'::jsonb
  ),
  
  -- Tirvan Kahvila
  (
    'b2000000-0000-0000-0000-000000000002',
    'tirvan',
    'Tirvan Kahvila',
    'Tirvan Cafe',
    'active',
    'starter',
    '{
      "cashOnDelivery": true,
      "aiAssistant": false,
      "delivery": false,
      "pickup": true,
      "lunch": true,
      "multiBranch": false
    }'::jsonb,
    'info@tirvankahvila.fi',
    '{
      "domain": "tirvankahvila.fi",
      "city": "Lahti",
      "cuisine": "Finnish Cafe"
    }'::jsonb
  ),
  
  -- Pizzeria Antonio
  (
    'b3000000-0000-0000-0000-000000000003',
    'antonio',
    'Pizzeria Antonio',
    'Pizzeria Antonio',
    'active',
    'pro',
    '{
      "cashOnDelivery": true,
      "aiAssistant": false,
      "delivery": true,
      "pickup": true,
      "lunch": false,
      "multiBranch": false
    }'::jsonb,
    'info@pizzeriaantonio.fi',
    '{
      "domain": "pizzeriaantonio.fi",
      "city": "Lahti",
      "cuisine": "Italian Pizza"
    }'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  status = EXCLUDED.status,
  subscription_tier = EXCLUDED.subscription_tier,
  features = EXCLUDED.features,
  owner_email = EXCLUDED.owner_email,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Create default restaurant_config for each tenant
INSERT INTO restaurant_config (tenant_id, name, name_en, tagline, tagline_en, description, description_en, phone, email, is_active)
SELECT 
  t.id,
  t.name,
  COALESCE(t.name_en, t.name),
  'Welcome to ' || t.name,
  'Welcome to ' || COALESCE(t.name_en, t.name),
  'Delicious food and great service',
  'Delicious food and great service',
  '',
  t.owner_email,
  true
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM restaurant_config rc WHERE rc.tenant_id = t.id
);

-- Create default restaurant_settings for each tenant
INSERT INTO restaurant_settings (tenant_id, is_open, is_busy, opening_hours, pickup_hours, delivery_hours, lunch_buffet_hours)
SELECT 
  t.id,
  true,
  false,
  'Mon-Sun 10:00-22:00',
  'Mon-Sun 10:00-22:00',
  'Mon-Sun 11:00-21:00',
  'Mon-Fri 11:00-14:00'
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM restaurant_settings rs WHERE rs.tenant_id = t.id
);
