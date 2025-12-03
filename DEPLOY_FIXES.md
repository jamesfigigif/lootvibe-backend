# Deployment Instructions

## 1. Deploy the Fixed Edge Function
Run the following command in your terminal to deploy the updated `claim-free-box` function:

```bash
npx supabase functions deploy claim-free-box --no-verify-jwt
```

## 2. Apply the SQL Migration
You MUST run the SQL migration I created to fix the RLS errors and 500 errors.
Copy the content of the file below and run it in your Supabase SQL Editor:

**File:** `supabase/migrations/20251203000002_fix_all_rls_issues.sql`

```sql
-- COMPREHENSIVE FIX FOR ALL RLS ISSUES

-- 1. Fix User Creation Policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (
    (auth.jwt() ->> 'sub') = id OR (auth.jwt() ->> 'user_id') = id
);

-- 2. Fix Admin Policies (Remove Recursion)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can update all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can view all box openings" ON public.box_openings;

-- 3. Ensure RLS is Enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_openings ENABLE ROW LEVEL SECURITY;

-- 4. Grant Permissions
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
```
