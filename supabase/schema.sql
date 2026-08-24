-- ====================================================================
-- BANCO DE DADOS OFICIAL: MONTE CARMO SHOPPING
-- Compatível com PostgreSQL 14+ e Supabase
-- ====================================================================

-- 1. Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- TABELA: PROFILES (Perfil dos Usuários & Fidelidade)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    cpf VARCHAR(14) UNIQUE,
    points INTEGER DEFAULT 100 CHECK (points >= 0),
    level TEXT DEFAULT 'Bronze' CHECK (level IN ('Bronze', 'Prata', 'Ouro', 'Diamante')),
    referral_code VARCHAR(30) UNIQUE,
    referred_by VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: STORES (Lojas Reais Extraídas do Shopping)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    floor TEXT,
    hours TEXT DEFAULT '10:00 - 22:00',
    phone TEXT,
    whatsapp TEXT,
    logo_icon TEXT,
    image_url TEXT,
    rating NUMERIC(2,1) DEFAULT 4.8,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: MOVIES (Filmes & Cinema Cineart Monte Carmo)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    duration TEXT,
    rating TEXT,
    genre TEXT,
    synopsis TEXT,
    poster_url TEXT,
    trailer_url TEXT,
    sessions TEXT,
    ticket_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: BANNERS (Banners Promocionais Oficiais)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    tag TEXT,
    image_url TEXT,
    action_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: RECEIPTS (Notas Fiscais Enviadas pelo Scanner/Manual)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_cnpj VARCHAR(18),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    access_key_44 VARCHAR(44) UNIQUE,
    qr_code_url TEXT,
    receipt_image_url TEXT,
    status TEXT DEFAULT 'Aprovada' CHECK (status IN ('Em Análise', 'Aprovada', 'Recusada')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: COUPONS (Catálogo de Cupons & Prêmios das Lojas)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL,
    store_category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount TEXT NOT NULL,
    points_required INTEGER DEFAULT 0 CHECK (points_required >= 0),
    is_free BOOLEAN DEFAULT FALSE,
    min_level TEXT DEFAULT 'Bronze' CHECK (min_level IN ('Bronze', 'Prata', 'Ouro', 'Diamante')),
    code_prefix VARCHAR(20) DEFAULT 'MC',
    expiry_date DATE NOT NULL,
    badge_color VARCHAR(10) DEFAULT '#10B981',
    image_url TEXT,
    stock INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: COUPON_REDEMPTIONS (Cupons Resgatados)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    voucher_code VARCHAR(30) UNIQUE NOT NULL,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Utilizado', 'Expirado')),
    used_at TIMESTAMP WITH TIME ZONE,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA: NOTIFICATIONS (Central de Notificações)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'points', 'coupon', 'event')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_access_key ON public.receipts(access_key_44);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_voucher ON public.coupon_redemptions(voucher_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_name ON public.stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_category ON public.stores(category);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & PERMISSÕES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
CREATE POLICY "Lojas são públicas" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Filmes são públicos" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Banners são públicos" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Cupons ativos são públicos" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Perfil é acessível por todos para auth" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Notas públicas ou por usuário" ON public.receipts FOR ALL USING (true);
CREATE POLICY "Resgates públicos ou por usuário" ON public.coupon_redemptions FOR ALL USING (true);
CREATE POLICY "Notificações públicas ou por usuário" ON public.notifications FOR ALL USING (true);

-- ====================================================================
-- DADOS INICIAIS DE CUPONS (SEED DATA)
-- ====================================================================
INSERT INTO public.coupons (store_name, store_category, title, description, discount, points_required, is_free, min_level, code_prefix, expiry_date, badge_color, image_url)
VALUES
('Burger King', 'Alimentação', '2 Whopper Jr. + 2 Batatas Média + Refil', 'Apresente o QR Code no balcão do BK no Monte Carmo Shopping.', 'Combo R$ 25', 150, false, 'Bronze', 'BK-MC', '2026-12-31', '#F59E0B', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400'),
('Cacau Show', 'Alimentação', '20% de Desconto na linha LaCreme e Trufas', 'Válido para compras acima de R$ 60 na loja do Monte Carmo.', '20% OFF', 200, false, 'Bronze', 'CACAU-MC', '2026-12-31', '#10B981', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400'),
('BoliXe Monte Carmo', 'Diversão', '30% de Desconto na 1ª Hora de Boliche', 'Reúna a família e amigos de terça a quinta-feira.', '30% OFF', 300, false, 'Prata', 'BOLIXE-MC', '2026-12-31', '#6366F1', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'),
('Cineart Monte Carmo', 'Diversão', '1 Pipoca Grande Salgada na compra de 2 Ingressos', 'Benefício exclusivo resgatável para clientes Nível Ouro e Diamante.', 'Pipoca Grátis', 0, true, 'Ouro', 'CINEART-MC', '2026-12-31', '#EC4899', 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400')
ON CONFLICT DO NOTHING;
