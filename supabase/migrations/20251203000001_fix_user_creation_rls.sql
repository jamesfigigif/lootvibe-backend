-- Fix RLS policy for user creation
-- The previous policy required the row to exist to check the ID, which fails for INSERT.
-- We need to allow INSERT if the new row's ID matches the authenticated user's ID.

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (
    -- Allow if the ID of the new row matches the authenticated user's ID (from Clerk)
    (auth.jwt() ->> 'sub') = id
    OR
    (auth.jwt() ->> 'user_id') = id
);

-- Ensure the policy is applied
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
