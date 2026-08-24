-- SUPABASE SCHEMA - MONTE CARMO SHOPPING
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    phone TEXT,
    points INTEGER DEFAULT 100 CHECK (points >= 0),
    level TEXT DEFAULT 'Bronze' CHECK (level IN ('Bronze', 'Prata', 'Ouro', 'Diamante')),
    referral_code VARCHAR(30) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL,
    store_category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount TEXT NOT NULL,
    points_required INTEGER DEFAULT 100 CHECK (points_required >= 0),
    is_free BOOLEAN DEFAULT FALSE,
    min_level TEXT DEFAULT 'Bronze' CHECK (min_level IN ('Bronze', 'Prata', 'Ouro', 'Diamante')),
    code_prefix VARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
    badge_color VARCHAR(10) DEFAULT '#10B981',
    image_url TEXT,
    stock INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    voucher_code VARCHAR(30) NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_cpf VARCHAR(14) NOT NULL,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Utilizado', 'Expirado')),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_coupon_per_cpf UNIQUE (coupon_id, customer_cpf)
);

CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    store_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    access_key_44 VARCHAR(44),
    status TEXT DEFAULT 'Aprovada',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    floor TEXT,
    hours TEXT DEFAULT '10:00 - 22:00',
    phone TEXT,
    logo_icon TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    duration TEXT,
    rating TEXT,
    genre TEXT,
    synopsis TEXT,
    poster_url TEXT,
    sessions TEXT,
    ticket_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access Coupons" ON public.coupons;
CREATE POLICY "Public Full Access Coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Profiles" ON public.profiles;
CREATE POLICY "Public Full Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Receipts" ON public.receipts;
CREATE POLICY "Public Full Access Receipts" ON public.receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Redemptions" ON public.coupon_redemptions;
CREATE POLICY "Public Full Access Redemptions" ON public.coupon_redemptions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Stores" ON public.stores;
CREATE POLICY "Public Full Access Stores" ON public.stores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Movies" ON public.movies;
CREATE POLICY "Public Full Access Movies" ON public.movies FOR ALL USING (true) WITH CHECK (true);
