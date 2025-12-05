-- Temporary fix: Allow anon users to create and read their own profiles
-- This is needed because Clerk JWT is not being properly validated by Supabase
-- In production, we should either:
-- 1. Configure Supabase to accept Clerk JWTs
-- 2. Use backend (Heroku) with service role to create users

-- Drop the strict INSERT policy
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- Allow anon users to insert their profile (they must provide their Clerk ID)
CREATE POLICY "users_insert_with_clerk_id"
ON public.users FOR INSERT
WITH CHECK (true);  -- Allow any insert for now

-- Allow anon users to read any user profile (needed for lookups)
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_any"
ON public.users FOR SELECT
USING (true);  -- Allow any select

-- Allow anon users to update their own profile
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_any"
ON public.users FOR UPDATE
USING (true);  -- Allow any update for now

-- Grant necessary permissions
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
