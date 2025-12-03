-- Fix boxes table to allow anonymous read access
-- This allows users to see boxes before signing in

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view boxes" ON public.boxes;

-- Create policy that allows both authenticated and anonymous users to view boxes
CREATE POLICY "Anyone can view boxes"
ON public.boxes FOR SELECT
TO public
USING (enabled = true OR active = true);

-- Ensure anon role has SELECT permission
GRANT SELECT ON public.boxes TO anon;
GRANT SELECT ON public.boxes TO authenticated;
