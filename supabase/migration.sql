-- Dealio Marketplace Database Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'advisor', 'broker', 'admin')),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SELLER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. BUYER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  buyer_type TEXT CHECK (buyer_type IN ('individual', 'search_fund', 'PE', 'strategic', 'operator', 'investor')),
  industry_focus JSONB DEFAULT '[]'::jsonb,
  excluded_industries JSONB DEFAULT '[]'::jsonb,
  geographic_focus JSONB DEFAULT '[]'::jsonb,
  deal_size_min NUMERIC,
  deal_size_max NUMERIC,
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  acquisition_timeline TEXT,
  source_of_funds TEXT,
  financing_required BOOLEAN DEFAULT FALSE,
  interested_in_jv BOOLEAN DEFAULT FALSE,
  operator_needed BOOLEAN DEFAULT FALSE,
  acquisition_experience TEXT,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  additional_notes TEXT,
  profile_completion_percent INTEGER DEFAULT 0,
  profile_visibility TEXT DEFAULT 'visible',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. BROKER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.broker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  brokerage_name TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ADVISOR PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.advisor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  focus_industries JSONB DEFAULT '[]'::jsonb,
  focus_geographies JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LISTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_type TEXT DEFAULT 'seller' CHECK (owner_type IN ('seller', 'broker', 'dealio_managed')),
  lead_owner_type TEXT DEFAULT 'seller' CHECK (lead_owner_type IN ('seller', 'broker', 'dealio', 'shared')),
  package_type TEXT DEFAULT 'basic' CHECK (package_type IN ('basic', 'pro', 'premium', 'full_advisory')),
  title TEXT NOT NULL,
  short_summary TEXT,
  full_description TEXT,
  industry TEXT,
  sub_industry TEXT,
  city TEXT,
  province_state TEXT,
  country TEXT DEFAULT 'Canada',
  is_location_public BOOLEAN DEFAULT TRUE,
  confidentiality_mode TEXT DEFAULT 'public' CHECK (confidentiality_mode IN ('public', 'city_only', 'confidential')),
  asking_price NUMERIC,
  asking_price_min NUMERIC,
  asking_price_max NUMERIC,
  annual_revenue NUMERIC,
  ebitda NUMERIC,
  cash_flow NUMERIC,
  inventory_included BOOLEAN DEFAULT FALSE,
  real_estate_included BOOLEAN DEFAULT FALSE,
  reason_for_sale TEXT,
  highlights TEXT,
  ideal_buyer TEXT,
  growth_opportunities TEXT,
  owner_role TEXT,
  employees_count INTEGER,
  year_established INTEGER,
  featured_image_url TEXT,
  inquiry_routing_type TEXT DEFAULT 'direct_to_seller' CHECK (inquiry_routing_type IN ('direct_to_seller', 'shared', 'dealio_inbox', 'direct_to_broker', 'assigned_advisor')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'sold', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_dealio_managed BOOLEAN DEFAULT FALSE,
  buyer_outreach_enabled BOOLEAN DEFAULT FALSE,
  little_dragon_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. LISTING IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. LISTING FILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.listing_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. INQUIRIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  buyer_profile_id UUID REFERENCES public.buyer_profiles(id) ON DELETE SET NULL,
  anonymous_name TEXT,
  anonymous_email TEXT,
  anonymous_phone TEXT,
  message TEXT,
  source_type TEXT DEFAULT 'listing_detail_page' CHECK (source_type IN ('listing_detail_page', 'matched_email', 'direct_link', 'internal_admin')),
  lead_owner_type TEXT,
  routed_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_advisor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  inquiry_status TEXT DEFAULT 'new' CHECK (inquiry_status IN ('new', 'routed', 'opened', 'contacted', 'qualified', 'unqualified', 'converted', 'archived')),
  qualification_notes TEXT,
  wants_acquisition_support BOOLEAN DEFAULT FALSE,
  needs_financing BOOLEAN DEFAULT FALSE,
  needs_operator_jv BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_profile_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  industry_score INTEGER DEFAULT 0,
  location_score INTEGER DEFAULT 0,
  deal_size_score INTEGER DEFAULT 0,
  buyer_type_score INTEGER DEFAULT 0,
  timeline_score INTEGER DEFAULT 0,
  special_factor_score INTEGER DEFAULT 0,
  score_breakdown_json JSONB,
  match_status TEXT DEFAULT 'new' CHECK (match_status IN ('new', 'notified', 'viewed', 'dismissed', 'converted')),
  advisor_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. SERVICE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  request_type TEXT CHECK (request_type IN ('teaser_creation', 'CIM_creation', 'buyer_outreach', 'listing_optimization', 'paid_promotion', 'valuation_guidance', 'deal_readiness_review', 'advisory_consultation', 'full_representation_request')),
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'complete', 'canceled')),
  assigned_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. PACKAGE PURCHASES
-- ============================================
CREATE TABLE IF NOT EXISTS public.package_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  product_type TEXT CHECK (product_type IN ('seller_package', 'broker_package', 'buyer_subscription', 'add_on')),
  product_name TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'cad',
  payment_status TEXT DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. SAVED LISTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_industry ON public.listings(industry);
CREATE INDEX IF NOT EXISTS idx_listings_country ON public.listings(country);
CREATE INDEX IF NOT EXISTS idx_listings_province ON public.listings(province_state);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(asking_price);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON public.inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON public.inquiries(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(inquiry_status);
CREATE INDEX IF NOT EXISTS idx_matches_listing ON public.matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_matches_buyer ON public.matches(buyer_profile_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user ON public.saved_listings(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- LISTINGS policies
CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can view own listings" ON public.listings FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Owners can insert listings" ON public.listings FOR INSERT WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Owners can update own listings" ON public.listings FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Owners can delete own listings" ON public.listings FOR DELETE USING (owner_user_id = auth.uid());
CREATE POLICY "Admins can manage all listings" ON public.listings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- LISTING IMAGES policies
CREATE POLICY "Anyone can view listing images" ON public.listing_images FOR SELECT USING (TRUE);
CREATE POLICY "Listing owners can manage images" ON public.listing_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_user_id = auth.uid())
);

-- LISTING FILES policies
CREATE POLICY "Public files viewable by all" ON public.listing_files FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Listing owners can manage files" ON public.listing_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_user_id = auth.uid())
);

-- BUYER PROFILES policies
CREATE POLICY "Buyers can view own profile" ON public.buyer_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Buyers can insert own profile" ON public.buyer_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Buyers can update own profile" ON public.buyer_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all buyer profiles" ON public.buyer_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- SELLER PROFILES policies
CREATE POLICY "Sellers can view own profile" ON public.seller_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Sellers can insert own profile" ON public.seller_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Sellers can update own profile" ON public.seller_profiles FOR UPDATE USING (user_id = auth.uid());

-- INQUIRIES policies
CREATE POLICY "Buyers can view own inquiries" ON public.inquiries FOR SELECT USING (buyer_user_id = auth.uid());
CREATE POLICY "Anyone can insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Listing owners can view inquiries" ON public.inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_user_id = auth.uid())
);
CREATE POLICY "Admins can manage all inquiries" ON public.inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- MATCHES policies
CREATE POLICY "Buyers can view own matches" ON public.matches FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.buyer_profiles WHERE id = buyer_profile_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all matches" ON public.matches FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- SERVICE REQUESTS policies
CREATE POLICY "Users can view own requests" ON public.service_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert requests" ON public.service_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all requests" ON public.service_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- PACKAGE PURCHASES policies
CREATE POLICY "Users can view own purchases" ON public.package_purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all purchases" ON public.package_purchases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- SAVED LISTINGS policies
CREATE POLICY "Users can manage own saved listings" ON public.saved_listings FOR ALL USING (user_id = auth.uid());

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- AUDIT LOGS policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.seller_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.buyer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.broker_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.advisor_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-files', 'listing-files', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own listing images" ON storage.objects FOR UPDATE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated can view listing files" ON storage.objects FOR SELECT USING (bucket_id = 'listing-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload listing files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
