-- Users Profile Table
CREATE TABLE users_profile (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Pincodes Table
CREATE TABLE delivery_pincodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pincode VARCHAR(6) UNIQUE NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    delivery_charge NUMERIC(10,2) DEFAULT 0.00,
    min_delivery_days INTEGER DEFAULT 3,
    max_delivery_days INTEGER DEFAULT 7,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    discount_price NUMERIC(10,2),
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    image_url TEXT,
    rating NUMERIC(3,2) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Table
CREATE TABLE cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Wishlist Table
CREATE TABLE wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Coupons Table
CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_code VARCHAR(20) UNIQUE NOT NULL,
    discount_percentage NUMERIC(5,2) NOT NULL,
    minimum_order_amount NUMERIC(10,2) DEFAULT 0.00,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    delivery_charge NUMERIC(10,2) DEFAULT 0.00,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
    payment_method TEXT DEFAULT 'razorpay',
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    shipping_address JSONB NOT NULL,
    tracking_id TEXT,
    courier_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) configuration

-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies

-- Products: Anyone can read, only admin can modify
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can modify products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Delivery Pincodes: Anyone can read, only admin can modify
CREATE POLICY "Anyone can read pincodes" ON delivery_pincodes FOR SELECT USING (true);
CREATE POLICY "Admin can modify pincodes" ON delivery_pincodes FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Cart: Users can only see and modify their own cart
CREATE POLICY "Users manage own cart" ON cart FOR ALL USING (auth.uid() = user_id);

-- Wishlist: Users can only see and modify their own wishlist
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Orders: Users can see their own orders, Admin can see all
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manages all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Order Items: Users can see items for their orders, Admin can see all
CREATE POLICY "Users see own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin manages all order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews: Anyone can read, users can insert for bought products (handled in app logic or trigger), Users can manage own, Admin can delete
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users manage own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can delete reviews" ON reviews FOR DELETE USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Users Profile: Users can read/update own, Admin can read/update all
CREATE POLICY "Users read own profile" ON users_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON users_profile FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin manages all profiles" ON users_profile FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Coupons: Anyone can read active coupons (app logic), Admin manages all
CREATE POLICY "Anyone can read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admin manages all coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Contact: Anyone can insert, Admin can read/update
CREATE POLICY "Anyone can insert contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manages all contacts" ON contact_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);

-- Function to handle new user registration and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
