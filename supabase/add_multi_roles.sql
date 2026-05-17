-- ============================================
-- Multi-Role Support Migration
-- ============================================
-- Adds roles JSONB array column and new role types.
-- The existing `role` TEXT column is KEPT for backward-compatible
-- RLS policies. It is auto-synced as the "primary" role.
-- ============================================

-- 1. Expand the role CHECK constraint to include new role types
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('buyer', 'seller', 'advisor', 'broker', 'admin', 'business_owner', 'operator', 'strategic_partner'));

-- 2. Add the roles JSONB array column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;

-- 3. Backfill existing users: set roles = [current_role]
UPDATE public.users 
SET roles = jsonb_build_array(role) 
WHERE roles = '[]'::jsonb OR roles IS NULL;

-- 4. Create GIN index for efficient roles array queries
CREATE INDEX IF NOT EXISTS idx_users_roles ON public.users USING GIN (roles);

-- 5. Update is_admin() to also check the roles array
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'admin' OR roles @> '["admin"]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Update handle_new_user() to support roles array from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_roles jsonb;
  user_role text;
  r text;
BEGIN
  -- Get roles from metadata: supports both array format and legacy single role
  IF NEW.raw_user_meta_data ? 'roles' AND jsonb_typeof(NEW.raw_user_meta_data->'roles') = 'array' THEN
    user_roles := NEW.raw_user_meta_data->'roles';
  ELSE
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
    user_roles := jsonb_build_array(user_role);
  END IF;

  -- Primary role = first role in array (for backward-compat RLS)
  user_role := user_roles->>0;

  INSERT INTO public.users (id, email, full_name, role, roles, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    user_roles,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  -- Create role-specific profiles for each role in the array
  FOR r IN SELECT jsonb_array_elements_text(user_roles) LOOP
    IF r IN ('seller', 'business_owner') THEN
      INSERT INTO public.seller_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF r IN ('buyer', 'operator', 'strategic_partner') THEN
      INSERT INTO public.buyer_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF r = 'broker' THEN
      INSERT INTO public.broker_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF r = 'advisor' THEN
      INSERT INTO public.advisor_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Helper function: sync role column when roles array changes
-- Call this after updating `roles` to keep `role` in sync for RLS
CREATE OR REPLACE FUNCTION public.sync_primary_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Set primary role = first element of roles array
  IF NEW.roles IS NOT NULL AND jsonb_array_length(NEW.roles) > 0 THEN
    NEW.role := NEW.roles->>0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: auto-sync role when roles array is updated
DROP TRIGGER IF EXISTS sync_role_on_roles_update ON public.users;
CREATE TRIGGER sync_role_on_roles_update
  BEFORE UPDATE OF roles ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_primary_role();
