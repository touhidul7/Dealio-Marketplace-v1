-- ============================================
-- DEALIO MARKETPLACE - REQUESTS MODULE
-- Migration: Add requests & responses tables
-- ============================================

-- ============================================
-- 1. REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Request classification
  request_type TEXT NOT NULL CHECK (request_type IN (
    'buyer_seeking_business',
    'owner_seeking_operator',
    'operator_seeking_opportunity',
    'strategic_partner'
  )),

  -- Core fields (shared across all types)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT,
  location_preference TEXT,
  timeline TEXT,

  -- Dynamic fields stored as JSONB (varies by request_type)
  dynamic_fields JSONB DEFAULT '{}'::jsonb,

  -- Compliance
  compliance_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  compliance_accepted_at TIMESTAMPTZ,

  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_review', 'approved', 'rejected', 'flagged', 'archived'
  )),
  flagged_keywords JSONB DEFAULT '[]'::jsonb,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  verification_level TEXT DEFAULT 'unverified' CHECK (verification_level IN (
    'unverified', 'basic', 'verified', 'premium'
  )),

  -- Metadata
  view_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. RESPONSES TABLE (polymorphic: listings OR requests)
-- ============================================
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Polymorphic target: can be a listing or a request
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'request')),
  target_id UUID NOT NULL,

  -- Response content
  message TEXT NOT NULL,
  intent TEXT CHECK (intent IN (
    'interested_buyer',
    'potential_operator',
    'strategic_partner',
    'general_inquiry',
    'offer_services'
  )),

  -- Contact info (for non-logged-in context or overrides)
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON public.requests(request_type);
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_industry ON public.requests(industry);
CREATE INDEX IF NOT EXISTS idx_requests_created ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_featured ON public.requests(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_responses_target ON public.responses(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON public.responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON public.responses(status);

-- ============================================
-- 4. TRIGGERS
-- ============================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- REQUESTS policies
CREATE POLICY "Anyone can view approved requests"
  ON public.requests FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own requests"
  ON public.requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests"
  ON public.requests FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending_review', 'rejected'));

CREATE POLICY "Users can delete own draft requests"
  ON public.requests FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending_review');

CREATE POLICY "Admins can manage all requests"
  ON public.requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RESPONSES policies
CREATE POLICY "Users can view responses on own requests"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = target_id AND user_id = auth.uid() AND target_type = 'request'
    )
  );

CREATE POLICY "Users can view own responses"
  ON public.responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create responses"
  ON public.responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
  ON public.responses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all responses"
  ON public.responses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Request owners can update response status (mark as read, etc.)
CREATE POLICY "Request owners can update response status"
  ON public.responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = target_id AND user_id = auth.uid() AND target_type = 'request'
    )
  );
