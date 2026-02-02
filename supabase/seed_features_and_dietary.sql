-- Seed data for restaurant features
INSERT INTO restaurant_features (name, description, icon) VALUES
('Wi-Fi', 'Free Wi-Fi available', '📡'),
('Outdoor Seating', 'Terrace or outdoor seating area', '🌳'),
('Parking', 'On-site parking available', '🚗'),
('Air Conditioning', 'Climate controlled indoor seating', '❄️'),
('Reservations', 'Accepts reservations', '📅'),
('Delivery', 'Food delivery service', '🛵'),
('Takeout', 'Takeout/takeaway service', '🥡'),
('Vegetarian Options', 'Vegetarian menu options available', '🥗'),
('Vegan Options', 'Vegan menu options available', '🌱'),
('Gluten-free Options', 'Gluten-free menu options available', '🌾'),
('Pet Friendly', 'Pets allowed', '🐾'),
('Wheelchair Accessible', 'Accessible for wheelchair users', '♿'),
('Live Music', 'Live music entertainment', '🎵'),
('Happy Hour', 'Happy hour specials available', '🍸'),
('Kids Menu', 'Menu options for children', '👶'),
('Late Night', 'Open late hours', '🌙'),
('Group Dining', 'Suitable for large groups', '👥'),
('Private Room', 'Private dining room available', '🚪'),
('Catering', 'Catering services available', '🍽️'),
('Bar Service', 'Full bar service', '🍷'),
('Multibanco', 'ATM/Multibanco available', '🏧'),
('Cash Only', 'Accepts cash only', '💵'),
('Credit Cards', 'Accepts credit cards', '💳'),
('Contactless Payment', 'Contactless payment options', '📱'),
('Free Water', 'Free water available', '🚰'),
('High Speed Wi-Fi', 'High-speed internet connection', '🚀'),
('Business Lunch', 'Business lunch options', '💼'),
('Brunch', 'Brunch service available', '🍳'),
('Breakfast', 'Breakfast service available', '🥞'),
('Dessert Specialties', 'Specialized dessert menu', '🍰'),
('Wine List', 'Extensive wine selection', '🍷'),
('Craft Beer', 'Craft beer selection', '🍺'),
('Cocktails', 'Cocktail bar available', '🍸'),
('Coffee Specialties', 'Specialty coffee drinks', '☕'),
('Tea Selection', 'Variety of tea options', '🍵'),
('Gluten-free Menu', 'Dedicated gluten-free menu', '🌾'),
('Organic Options', 'Organic food options', '🍎'),
('Local Products', 'Uses local products', '📍'),
('Seasonal Menu', 'Seasonal menu changes', '🍂'),
('Chef Specials', 'Daily chef specials', '👨‍🍳');

-- Seed data for dietary options
INSERT INTO restaurant_dietary_options (name, description, icon) VALUES
('Vegetarian', 'Restaurant offers vegetarian options', '🥗'),
('Vegan', 'Restaurant offers vegan options', '🌱'),
('Gluten-free', 'Restaurant offers gluten-free options', '🌾'),
('Dairy-free', 'Restaurant offers dairy-free options', '🥛'),
('Nut-free', 'Restaurant offers nut-free options', '🥜'),
('Halal', 'Restaurant serves halal food', '☪️'),
('Kosher', 'Restaurant serves kosher food', '✡️'),
('Organic', 'Restaurant uses organic ingredients', '🍎'),
('Low-carb', 'Restaurant offers low-carb options', '🥑'),
('Keto-friendly', 'Restaurant offers keto diet options', '🥓'),
('Paleo', 'Restaurant offers paleo diet options', '🥩'),
('Pescatarian', 'Restaurant offers pescatarian options', '🐟'),
('Lactose-free', 'Restaurant offers lactose-free options', '🧀'),
('Sugar-free', 'Restaurant offers sugar-free options', '🍭'),
('Whole30', 'Restaurant offers Whole30 compliant options', '🥕');

-- Sample data for restaurant_cuisine_types (if needed)
-- INSERT INTO restaurant_cuisine_types (restaurant_id, cuisine_type_id) VALUES
-- ('restaurant-uuid-here', 'cuisine-uuid-here');

-- Sample data for restaurant_features_mapping (if needed)
-- INSERT INTO restaurant_restaurant_features (restaurant_id, feature_id) VALUES
-- ('restaurant-uuid-here', 'feature-uuid-here');

-- Sample data for restaurant_dietary_options_junction (if needed)
-- INSERT INTO restaurant_dietary_options_junction (restaurant_id, dietary_option_id) VALUES
-- ('restaurant-uuid-here', 'dietary-uuid-here');