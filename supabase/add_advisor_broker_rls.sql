-- Add missing RLS policies for Advisors and Brokers

-- 1. ADVISOR PROFILES
DROP POLICY IF EXISTS "Advisors can view own profile" ON public.advisor_profiles;
CREATE POLICY "Advisors can view own profile" ON public.advisor_profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Advisors can insert own profile" ON public.advisor_profiles;
CREATE POLICY "Advisors can insert own profile" ON public.advisor_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Advisors can update own profile" ON public.advisor_profiles;
CREATE POLICY "Advisors can update own profile" ON public.advisor_profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all advisor profiles" ON public.advisor_profiles;
CREATE POLICY "Admins can view all advisor profiles" ON public.advisor_profiles FOR SELECT USING (is_admin());

-- 2. BROKER PROFILES
DROP POLICY IF EXISTS "Brokers can view own profile" ON public.broker_profiles;
CREATE POLICY "Brokers can view own profile" ON public.broker_profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Brokers can insert own profile" ON public.broker_profiles;
CREATE POLICY "Brokers can insert own profile" ON public.broker_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Brokers can update own profile" ON public.broker_profiles;
CREATE POLICY "Brokers can update own profile" ON public.broker_profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all broker profiles" ON public.broker_profiles;
CREATE POLICY "Admins can view all broker profiles" ON public.broker_profiles FOR SELECT USING (is_admin());

-- 3. SERVICE REQUESTS (Advisors need to see and update requests assigned to them)
DROP POLICY IF EXISTS "Advisors can view assigned requests" ON public.service_requests;
CREATE POLICY "Advisors can view assigned requests" ON public.service_requests FOR SELECT USING (assigned_to_user_id = auth.uid());

DROP POLICY IF EXISTS "Advisors can update assigned requests" ON public.service_requests;
CREATE POLICY "Advisors can update assigned requests" ON public.service_requests FOR UPDATE USING (assigned_to_user_id = auth.uid());

-- 4. INQUIRIES (Advisors need to see and update inquiries assigned to them)
DROP POLICY IF EXISTS "Advisors can view assigned inquiries" ON public.inquiries;
CREATE POLICY "Advisors can view assigned inquiries" ON public.inquiries FOR SELECT USING (assigned_advisor_id = auth.uid());

DROP POLICY IF EXISTS "Advisors can update assigned inquiries" ON public.inquiries;
CREATE POLICY "Advisors can update assigned inquiries" ON public.inquiries FOR UPDATE USING (assigned_advisor_id = auth.uid());

-- 5. Helper function for Advisor Client Access
CREATE OR REPLACE FUNCTION public.is_advisor_for_user(client_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE assigned_to_user_id = auth.uid() AND user_id = client_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. USERS access for Advisors (Advisors need to view basic info of their clients)
DROP POLICY IF EXISTS "Advisors can view clients" ON public.users;
CREATE POLICY "Advisors can view clients" ON public.users FOR SELECT USING (public.is_advisor_for_user(id));

-- 7. BUYER PROFILES access for Advisors (Advisors need to match their clients)
DROP POLICY IF EXISTS "Advisors can view client buyer profiles" ON public.buyer_profiles;
CREATE POLICY "Advisors can view client buyer profiles" ON public.buyer_profiles FOR SELECT USING (public.is_advisor_for_user(user_id));

DROP POLICY IF EXISTS "Anyone can view active buyer profiles" ON public.buyer_profiles;
CREATE POLICY "Anyone can view active buyer profiles" ON public.buyer_profiles FOR SELECT USING (status = 'active' AND profile_visibility = 'visible');
