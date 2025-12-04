-- Fix INSERT policy for user creation
-- The previous policy was checking JWT fields that don't match Clerk's format
-- This creates a more permissive policy that allows authenticated users to create their profile

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a new INSERT policy that works with Clerk authentication
-- Allow any authenticated user to insert a row where the ID matches their auth.uid()
CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
WITH CHECK (
    -- Check if the new row's ID matches the authenticated user's ID
    auth.uid()::text = id
);

-- Also ensure authenticated users have the necessary GRANT
GRANT INSERT ON public.users TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
