-- EU Specialty Food Marketplace - Extended Seed Data
-- This file contains comprehensive test data for Phase 2

-- =====================================================
-- 1. USERS (Buyers, Sellers, Admin)
-- =====================================================

-- Admin and Demo Users
INSERT INTO users (email, name, country, role, verified, auth0_sub, profile_bio, average_rating, review_count) 
VALUES 
('demo@eushop.local', 'Demo Admin', 'BE', 'admin', TRUE, 'auth0|demo', 'System Administrator', 5.0, 0),
('seller1@example.com', 'Belgian Chocolates Ltd', 'BE', 'seller', TRUE, 'auth0|seller1', 'Premium Belgian chocolate manufacturer since 1950', 4.8, 45),
('seller2@example.com', 'Italian Delights S.r.l', 'IT', 'seller', TRUE, 'auth0|seller2', 'Authentic Italian specialty foods from Tuscany', 4.9, 67),
('seller3@example.com', 'German Delicatessen GmbH', 'DE', 'seller', TRUE, 'auth0|seller3', 'Premium German cheese and confectionery products', 4.7, 38),
('buyer1@example.com', 'Jean Dupont', 'FR', 'buyer', TRUE, 'auth0|buyer1', 'Food enthusiast from France', 0.0, 0),
('buyer2@example.com', 'Maria Garcia', 'ES', 'buyer', FALSE, 'auth0|buyer2', 'Spanish cuisine lover', 0.0, 0),
('buyer3@example.com', 'Hans Mueller', 'DE', 'buyer', TRUE, 'auth0|buyer3', 'German food specialist', 0.0, 0)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 2. FOODS (Products)
-- =====================================================

-- Belgian Chocolates
INSERT INTO foods (seller_id, name, description, category, price, finder_fee_amount, country, quantity_available, is_active, average_rating, review_count, sales_count, view_count, allergens)
SELECT u.id, 'Belgian Chocolate Truffles - Dark Selection', 'Authentic Belgian dark chocolate truffles with ganache and cocoa powder coating. 250g box', 'Chocolates', 24.99, 5.00, 'BE', 100, TRUE, 4.8, 12, 45, 320, 'Milk, Soy, Nuts'
FROM users u WHERE u.email = 'seller1@example.com'
UNION ALL
SELECT u.id, 'Premium Belgian Pralines - Mixed Box', 'Assorted Belgian pralines with hazelnut, pistachio, and coffee fillings. 200g', 'Chocolates', 32.99, 6.50, 'BE', 75, TRUE, 4.9, 8, 28, 210, 'Milk, Soy, Nuts, Hazelnuts'
FROM users u WHERE u.email = 'seller1@example.com'
UNION ALL
SELECT u.id, 'Belgian White Chocolate with Hazelnuts', 'Smooth white chocolate blended with roasted hazelnuts. 150g bar', 'Chocolates', 18.99, 3.80, 'BE', 120, TRUE, 4.6, 5, 18, 145, 'Milk, Soy, Hazelnuts'
FROM users u WHERE u.email = 'seller1@example.com'
ON CONFLICT DO NOTHING;

-- Italian Foods
INSERT INTO foods (seller_id, name, description, category, price, finder_fee_amount, country, quantity_available, is_active, average_rating, review_count, sales_count, view_count, allergens)
SELECT u.id, 'Balsamic Vinegar of Modena 25 Year', '25-year aged traditional balsamic vinegar from Modena. Premium quality. 250ml bottle', 'Vinegars & Oils', 42.99, 8.50, 'IT', 50, TRUE, 4.9, 15, 52, 405, 'None'
FROM users u WHERE u.email = 'seller2@example.com'
UNION ALL
SELECT u.id, 'Imported Italian Arborio Rice', 'Premium risotto rice from Piedmont region. Perfect for Risotto Milanese. 1kg', 'Grains & Rice', 12.99, 2.60, 'IT', 200, TRUE, 4.7, 9, 34, 198, 'None'
FROM users u WHERE u.email = 'seller2@example.com'
UNION ALL
SELECT u.id, 'San Marzano Tomatoes PDO', 'Protected Designation tomatoes from Mount Vesuvius region. Perfect for Italian cooking. 400g cans (3 pack)', 'Vegetables & Fruits', 15.99, 3.20, 'IT', 150, TRUE, 4.8, 11, 41, 267, 'None'
FROM users u WHERE u.email = 'seller2@example.com'
UNION ALL
SELECT u.id, 'Parmigiano Reggiano 36 Months', 'Aged Parmigiano Reggiano from Emilia-Romagna. Sharp, complex flavor. 200g block', 'Cheese', 28.99, 5.80, 'IT', 60, TRUE, 4.9, 14, 48, 356, 'Milk'
FROM users u WHERE u.email = 'seller2@example.com'
ON CONFLICT DO NOTHING;

-- German Foods
INSERT INTO foods (seller_id, name, description, category, price, finder_fee_amount, country, quantity_available, is_active, average_rating, review_count, sales_count, view_count, allergens)
SELECT u.id, 'German Tilsiter Cheese Wheel', 'Traditional German semi-hard cheese from East Prussia. 500g wheel', 'Cheese', 38.99, 7.80, 'DE', 45, TRUE, 4.7, 10, 25, 289, 'Milk'
FROM users u WHERE u.email = 'seller3@example.com'
UNION ALL
SELECT u.id, 'German Allgäuer Bergkäse', 'Protected designation mountain cheese from Bavaria. Robust flavor. 300g', 'Cheese', 35.99, 7.20, 'DE', 55, TRUE, 4.8, 12, 32, 234, 'Milk'
FROM users u WHERE u.email = 'seller3@example.com'
UNION ALL
SELECT u.id, 'German Marzipan Chocolates - Assorted', 'Assorted traditional Lübeck marzipan covered in dark chocolate. 200g box', 'Chocolates', 16.99, 3.40, 'DE', 180, TRUE, 4.6, 8, 67, 512, 'Milk, Nuts, Soy'
FROM users u WHERE u.email = 'seller3@example.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. ORDERS (Purchase History)
-- =====================================================

-- Sample orders for testing order flow
INSERT INTO orders (buyer_id, food_id, quantity, total_price, status, notes)
SELECT b.id, f.id, 2, 49.98, 'DELIVERED', 'Excellent product, well packaged'
FROM users b, foods f
WHERE b.email = 'buyer1@example.com' AND f.name = 'Belgian Chocolate Truffles - Dark Selection'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO orders (buyer_id, food_id, quantity, total_price, status, notes)
SELECT b.id, f.id, 1, 42.99, 'DELIVERED', 'Perfect balsamic vinegar'
FROM users b, foods f
WHERE b.email = 'buyer1@example.com' AND f.name = 'Balsamic Vinegar of Modena 25 Year'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO orders (buyer_id, food_id, quantity, total_price, status, notes)
SELECT b.id, f.id, 1, 38.99, 'CONFIRMED', 'Order confirmed, awaiting shipment'
FROM users b, foods f
WHERE b.email = 'buyer2@example.com' AND f.name = 'German Tilsiter Cheese Wheel'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO orders (buyer_id, food_id, quantity, total_price, status, notes)
SELECT b.id, f.id, 3, 50.97, 'PENDING', 'New order'
FROM users b, foods f
WHERE b.email = 'buyer3@example.com' AND f.name = 'German Marzipan Chocolates - Assorted'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. REVIEWS (Product Reviews)
-- =====================================================

-- Reviews for Belgian Chocolates
INSERT INTO reviews (food_id, buyer_id, rating, comment)
SELECT f.id, b.id, 5, 'Amazing quality! The truffles were fresh and delicious. Highly recommend.'
FROM foods f, users b
WHERE f.name = 'Belgian Chocolate Truffles - Dark Selection' AND b.email = 'buyer1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO reviews (food_id, buyer_id, rating, comment)
SELECT f.id, b.id, 4, 'Good taste, but the packaging could be improved. Still very happy with the purchase.'
FROM foods f, users b
WHERE f.name = 'Premium Belgian Pralines - Mixed Box' AND b.email = 'buyer2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Reviews for Italian Foods
INSERT INTO reviews (food_id, buyer_id, rating, comment)
SELECT f.id, b.id, 5, 'Exceptional balsamic vinegar! The flavor is complex and rich. Worth every penny.'
FROM foods f, users b
WHERE f.name = 'Balsamic Vinegar of Modena 25 Year' AND b.email = 'buyer1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO reviews (food_id, buyer_id, rating, comment)
SELECT f.id, b.id, 5, 'Perfect Arborio rice for risotto. Creamy texture just as expected.'
FROM foods f, users b
WHERE f.name = 'Imported Italian Arborio Rice' AND b.email = 'buyer3@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. CONVERSATIONS (Seller-Buyer Communications)
-- =====================================================

-- Sample conversations
INSERT INTO conversations (buyer_id, seller_id, subject, last_message, last_message_at, is_active)
SELECT b.id, s.id, 'Questions about Belgian Chocolates', 'Do you offer bulk discounts?', NOW() - INTERVAL '2 days', TRUE
FROM users b, users s
WHERE b.email = 'buyer1@example.com' AND s.email = 'seller1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO conversations (buyer_id, seller_id, subject, last_message, last_message_at, is_active)
SELECT b.id, s.id, 'Balsamic Vinegar Order Status', 'When will my order arrive?', NOW() - INTERVAL '1 day', TRUE
FROM users b, users s
WHERE b.email = 'buyer2@example.com' AND s.email = 'seller2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. NOTIFICATIONS (Sample Notifications)
-- =====================================================

-- Order status notifications
INSERT INTO notifications (user_id, type, title, message, related_id, is_read)
SELECT b.id, 'ORDER_DELIVERED', 'Order Delivered', 'Your order of Belgian Chocolate Truffles has been delivered!', o.id, TRUE
FROM users b, orders o
WHERE b.email = 'buyer1@example.com' AND o.buyer_id = b.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- New review notifications (for sellers)
INSERT INTO notifications (user_id, type, title, message, related_id, is_read)
SELECT s.id, 'NEW_REVIEW', 'New Review Received', 'Someone left a 5-star review on your Belgian Chocolate Truffles!', f.id, FALSE
FROM users s, foods f
WHERE s.email = 'seller1@example.com' AND f.seller_id = s.id AND f.name = 'Belgian Chocolate Truffles - Dark Selection'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Message notifications
INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT s.id, 'NEW_MESSAGE', 'New Message', 'You have a new message from a buyer about your products', FALSE
FROM users s
WHERE s.email = 'seller1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. POPULATE COMPLIANCE DATA FOR EXISTING SELLERS
-- =====================================================
UPDATE users SET
  tax_id = 'BE123456789',
  vat_number = 'BE987654321',
  trade_register_number = 'BRU12345',
  address_street = 'Chocolatestraat 1',
  address_city = 'Brussels',
  address_postal_code = '1000',
  self_certified_compliant = TRUE
WHERE email = 'seller1@example.com';

UPDATE users SET
  tax_id = 'IT12345678901',
  vat_number = 'IT09876543210',
  trade_register_number = 'RMI 123456',
  address_street = 'Via Roma 42',
  address_city = 'Florence',
  address_postal_code = '50123',
  self_certified_compliant = TRUE
WHERE email = 'seller2@example.com';

UPDATE users SET
  tax_id = 'DE123456789',
  vat_number = 'DE987654321',
  trade_register_number = 'HRB 12345',
  address_street = 'Käseplatz 7',
  address_city = 'Munich',
  address_postal_code = '80331',
  self_certified_compliant = TRUE
WHERE email = 'seller3@example.com';

-- =====================================================
-- Summary for Testing
-- =====================================================
-- Created:
-- - 7 Users (1 admin, 3 sellers, 3 buyers)
-- - 10 Food Products across 3 countries
-- - 4 Orders with various statuses
-- - 4 Reviews with ratings
-- - 2 Conversations between buyers and sellers
-- - 3 Notifications (delivered, review, message)
-- - Compliance data (tax_id, vat_number, etc.) added for sellers
--
-- This provides a realistic test environment for:
-- - User authentication and profiles
-- - Product browsing and filtering
-- - Order management workflow
-- - Review system functionality
-- - Messaging/conversation system
-- - Notification system
-- - Rating calculations
-- - Seller compliance verification and admin review
-- =====================================================
