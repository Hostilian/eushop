-- Seed data: EU Countries
INSERT INTO users (email, name, country, role, verified) VALUES
('admin@eushop.local', 'Admin User', 'BE', 'admin', TRUE),
('seller_belgium@eushop.local', 'Belgian Chocolates Ltd', 'BE', 'seller', TRUE),
('seller_italy@eushop.local', 'Italian Delights', 'IT', 'seller', TRUE),
('seller_austria@eushop.local', 'Austrian Alpine Foods', 'AT', 'seller', TRUE),
('buyer_france@eushop.local', 'Jean Dupont', 'FR', 'buyer', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Seed data: Sample foods
INSERT INTO foods (seller_id, name, description, country, category, price, quantity_available, finder_fee_amount, is_active) 
SELECT u.id, 'Belgian Chocolate Truffles', 'Authentic Belgian dark chocolate truffles with various fillings', 'BE', 'Chocolates', 24.99, 100, 5.00, TRUE
FROM users u WHERE u.email = 'seller_belgium@eushop.local'
ON CONFLICT DO NOTHING;

INSERT INTO foods (seller_id, name, description, country, category, price, quantity_available, finder_fee_amount, is_active)
SELECT u.id, 'Italian Balsamic Vinegar 25 Year', '25-year aged Modena balsamic vinegar', 'IT', 'Vinegars', 34.99, 50, 7.00, TRUE
FROM users u WHERE u.email = 'seller_italy@eushop.local'
ON CONFLICT DO NOTHING;

INSERT INTO foods (seller_id, name, description, country, category, price, quantity_available, finder_fee_amount, is_active)
SELECT u.id, 'Austrian Mountain Cheese', 'Premium aged Austrian alpine cheese from Tyrol', 'AT', 'Cheese', 44.99, 30, 8.00, TRUE
FROM users u WHERE u.email = 'seller_austria@eushop.local'
ON CONFLICT DO NOTHING;
