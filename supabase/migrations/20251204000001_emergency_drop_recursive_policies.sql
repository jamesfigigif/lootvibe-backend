-- EMERGENCY: Just drop ALL policies and recreate from scratch
-- This will fix the infinite recursion immediately

-- Drop ALL policies on box_openings
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'box_openings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.box_openings';
    END LOOP;
END $$;

-- Drop ALL policies on users (except the insert one we need)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND policyname != 'Users can insert own profile') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
END $$;

-- Create SIMPLE non-recursive policies

-- Users can see their own profile (NO recursion)
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own profile (NO recursion)
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
USING (auth.uid()::text = id);

-- Users can see their own box openings (NO recursion - no admin check)
CREATE POLICY "box_openings_select_own"
ON public.box_openings FOR SELECT
USING (auth.uid()::text = user_id);

-- Allow service role to do everything (Edge Functions use this)
-- Service role bypasses RLS anyway, but having policies helps with clarity
CREATE POLICY "box_openings_service_insert"
ON public.box_openings FOR INSERT
WITH CHECK (true);
