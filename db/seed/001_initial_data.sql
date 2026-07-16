-- DEVELOPMENT-ONLY DEMO FIXTURES. These identities, listings and stock are fictional.
-- Fixed UUIDs and upserts make repeated local setup deterministic.
INSERT INTO users (id, email, name, country, role, verified)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'demo.seller@example.invalid', 'Demo Seller', 'BE', 'seller', FALSE),
  ('00000000-0000-4000-8000-000000000002', 'demo.buyer@example.invalid', 'Demo Buyer', 'DE', 'buyer', FALSE)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  role = EXCLUDED.role,
  verified = EXCLUDED.verified;

INSERT INTO foods (
  id, seller_id, name, description, country, category, price, currency,
  quantity_available, images, dietary_restrictions, allergens, is_active
)
VALUES (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Demo chocolate listing',
  'Development-only fixture; product details and availability are not verified.',
  'BE', 'demo', 10.00, 'EUR', 5, '[]'::jsonb, '[]'::jsonb,
  '["milk"]'::jsonb, FALSE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  quantity_available = EXCLUDED.quantity_available,
  allergens = EXCLUDED.allergens,
  is_active = FALSE;
