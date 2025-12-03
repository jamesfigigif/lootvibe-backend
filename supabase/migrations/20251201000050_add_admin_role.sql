-- Add role column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Update RLS policies to allow admins to view everything

-- USERS
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" 
ON public.users FOR UPDATE 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

-- TRANSACTIONS
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" 
ON public.transactions FOR SELECT 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

-- SHIPMENTS
DROP POLICY IF EXISTS "Admins can view all shipments" ON public.shipments;
CREATE POLICY "Admins can view all shipments" 
ON public.shipments FOR SELECT 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update all shipments" ON public.shipments;
CREATE POLICY "Admins can update all shipments" 
ON public.shipments FOR UPDATE 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

-- INVENTORY
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.inventory_items;
CREATE POLICY "Admins can view all inventory" 
ON public.inventory_items FOR SELECT 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

-- BOX OPENINGS
DROP POLICY IF EXISTS "Admins can view all box openings" ON public.box_openings;
CREATE POLICY "Admins can view all box openings" 
ON public.box_openings FOR SELECT 
USING (
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'sub')) = 'admin'
  OR
  (SELECT role FROM public.users WHERE id = (auth.jwt() ->> 'user_id')) = 'admin'
);

-- Function to make a user admin (callable by service role or existing admin)
CREATE OR REPLACE FUNCTION make_admin(target_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users SET role = 'admin' WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
