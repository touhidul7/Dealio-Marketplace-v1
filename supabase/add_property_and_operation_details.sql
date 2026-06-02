-- ============================================
-- ADD PROPERTY, OPERATION & FINANCING DETAILS
-- Run this in the Supabase Dashboard SQL Editor
-- ============================================

-- Property Information
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('leased', 'owned', 'home_based', 'remote', 'none')),
  ADD COLUMN IF NOT EXISTS premises_details TEXT;

-- Business Operation
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS management_type TEXT CHECK (management_type IN ('owner_operated', 'manager_run', 'semi_absentee', 'absentee')),
  ADD COLUMN IF NOT EXISTS expansion_potential TEXT;

-- Other Information / Transition & Financing
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS support_training TEXT,
  ADD COLUMN IF NOT EXISTS seller_financing_available BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seller_financing_details TEXT,
  ADD COLUMN IF NOT EXISTS financing_details TEXT;
