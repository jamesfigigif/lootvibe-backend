-- Critical fixes for boxes access and free box claiming
-- Run this directly in Supabase SQL Editor

-- 1. Fix boxes table to allow anonymous read access
DROP POLICY IF EXISTS "Anyone can view boxes" ON public.boxes;
DROP POLICY IF EXISTS "Anyone can read active boxes" ON public.boxes;

CREATE POLICY "Anyone can view boxes"
ON public.boxes FOR SELECT
USING (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.boxes TO anon;
GRANT SELECT ON public.boxes TO authenticated;

-- 2. Verify boxes table has RLS enabled
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;
