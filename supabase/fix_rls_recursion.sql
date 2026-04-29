-- Fix RLS Recursion by using a Security Definer function
-- This function bypasses RLS and allows checking user roles safely.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- We use a subquery to avoid any issues with the current user session context
  -- SECURITY DEFINER makes this run with the privileges of the creator (postgres)
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. Update USERS policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (is_admin());

-- 2. Update LISTINGS policies
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
CREATE POLICY "Admins can manage all listings" ON public.listings FOR ALL USING (is_admin());

-- 3. Update BUYER PROFILES policies
DROP POLICY IF EXISTS "Admins can view all buyer profiles" ON public.buyer_profiles;
CREATE POLICY "Admins can view all buyer profiles" ON public.buyer_profiles FOR SELECT USING (is_admin());

-- 4. Update INQUIRIES policies
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.inquiries;
CREATE POLICY "Admins can manage all inquiries" ON public.inquiries FOR ALL USING (is_admin());

-- 5. Update MATCHES policies
DROP POLICY IF EXISTS "Admins can manage all matches" ON public.matches;
CREATE POLICY "Admins can manage all matches" ON public.matches FOR ALL USING (is_admin());

-- 6. Update SERVICE REQUESTS policies
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.service_requests;
CREATE POLICY "Admins can manage all requests" ON public.service_requests FOR ALL USING (is_admin());

-- 7. Update PACKAGE PURCHASES policies
DROP POLICY IF EXISTS "Admins can manage all purchases" ON public.package_purchases;
CREATE POLICY "Admins can manage all purchases" ON public.package_purchases FOR ALL USING (is_admin());

-- 8. Update AUDIT LOGS policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (is_admin());

-- Also add a function to check if a user is the owner of a listing safely
CREATE OR REPLACE FUNCTION public.is_listing_owner(listing_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND owner_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update LISTING IMAGES policies to use the helper function
DROP POLICY IF EXISTS "Listing owners can manage images" ON public.listing_images;
CREATE POLICY "Listing owners can manage images" ON public.listing_images FOR ALL USING (is_listing_owner(listing_id));

-- Update LISTING FILES policies to use the helper function
DROP POLICY IF EXISTS "Listing owners can manage files" ON public.listing_files;
CREATE POLICY "Listing owners can manage files" ON public.listing_files FOR ALL USING (is_listing_owner(listing_id));
