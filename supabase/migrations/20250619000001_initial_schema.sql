-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth users table (this will be handled by Supabase Auth)
-- We'll create a profiles table instead to extend user data

-- Profiles table to extend Supabase Auth users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders table for shipment organization
CREATE TABLE folders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for folders
CREATE POLICY "Users can view own folders" ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON folders FOR DELETE USING (auth.uid() = user_id);

-- Shipments table
CREATE TABLE shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on shipments
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shipments
CREATE POLICY "Users can view own shipments" ON shipments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shipments" ON shipments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shipments" ON shipments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shipments" ON shipments FOR DELETE USING (auth.uid() = user_id);

-- Containers table
CREATE TABLE containers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight_limit DECIMAL(10,2) NOT NULL,
    icon TEXT DEFAULT 'Package',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on containers
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for containers
CREATE POLICY "Users can view own containers" ON containers FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = containers.shipment_id
    )
);
CREATE POLICY "Users can insert own containers" ON containers FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = containers.shipment_id
    )
);
CREATE POLICY "Users can update own containers" ON containers FOR UPDATE USING (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = containers.shipment_id
    )
);
CREATE POLICY "Users can delete own containers" ON containers FOR DELETE USING (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = containers.shipment_id
    )
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
    container_id UUID REFERENCES containers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    resale_price DECIMAL(10,2) NOT NULL,
    days_to_sell INTEGER NOT NULL DEFAULT 7,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_boxed BOOLEAN DEFAULT FALSE,
    icon TEXT DEFAULT 'Package',
    tag TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = products.shipment_id
    )
);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = products.shipment_id
    )
);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = products.shipment_id
    )
);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (
    auth.uid() IN (
        SELECT user_id FROM shipments WHERE id = products.shipment_id
    )
);

-- Saved products (presets) table
CREATE TABLE saved_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    resale_price DECIMAL(10,2) NOT NULL,
    days_to_sell INTEGER NOT NULL DEFAULT 7,
    icon TEXT DEFAULT 'Package',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on saved_products
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_products
CREATE POLICY "Users can view own saved products" ON saved_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved products" ON saved_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved products" ON saved_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved products" ON saved_products FOR DELETE USING (auth.uid() = user_id);

-- Saved containers (presets) table
CREATE TABLE saved_containers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight_limit DECIMAL(10,2) NOT NULL,
    icon TEXT DEFAULT 'Package',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on saved_containers
ALTER TABLE saved_containers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_containers
CREATE POLICY "Users can view own saved containers" ON saved_containers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved containers" ON saved_containers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved containers" ON saved_containers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved containers" ON saved_containers FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_shipments_user_id ON shipments(user_id);
CREATE INDEX idx_shipments_folder_id ON shipments(folder_id);
CREATE INDEX idx_containers_shipment_id ON containers(shipment_id);
CREATE INDEX idx_products_shipment_id ON products(shipment_id);
CREATE INDEX idx_products_container_id ON products(container_id);
CREATE INDEX idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX idx_saved_containers_user_id ON saved_containers(user_id);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, subscription_tier)
    VALUES (NEW.id, NEW.email, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();