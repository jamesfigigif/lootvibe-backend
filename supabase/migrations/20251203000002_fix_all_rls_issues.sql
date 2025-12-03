-- COMPREHENSIVE FIX FOR ALL RLS ISSUES
-- This migration fixes:
-- 1. User creation RLS policy (42501 error)
-- 2. Recursive policy issues causing 500 errors
-- 3. Admin policies that may cause infinite loops

-- ============================================
-- PART 1: Fix User Creation Policy
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (
    -- Allow if the ID of the new row matches the authenticated user's ID (from Clerk)
    (auth.jwt() ->> 'sub') = id
    OR
    (auth.jwt() ->> 'user_id') = id
);

-- ============================================
-- PART 2: Fix Admin Policies (Remove Recursion)
-- ============================================

-- The previous admin policies had a recursive SELECT that could cause 500 errors
-- We need to use a simpler approach that doesn't query the users table within the policy

-- Drop all existing admin policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can update all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can view all box openings" ON public.box_openings;

-- For now, we'll rely on the service role for admin operations
-- The frontend AdminPanel should use a service role key or Edge Function
-- This avoids the recursive policy issue entirely

-- ============================================
-- PART 3: Ensure RLS is Enabled
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_openings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: Grant Necessary Permissions
-- ============================================

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
GRANT ALL ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
GRANT ALL ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
GRANT ALL ON public.box_openings TO authenticated;
GRANT ALL ON public.box_openings TO service_role;
