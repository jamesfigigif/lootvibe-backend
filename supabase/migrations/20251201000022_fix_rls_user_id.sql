-- Update all RLS policies to use 'user_id' instead of 'sub' from Clerk JWT

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own non-sensitive data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Service role has full access to users" ON public.users;

DROP POLICY IF EXISTS "Users can read own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Service role has full access to inventory" ON public.inventory_items;

DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Service role has full access to transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can read own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Service role has full access to shipments" ON public.shipments;

DROP POLICY IF EXISTS "Users can view their own box openings" ON public.box_openings;

DROP POLICY IF EXISTS "Users can read own battles" ON public.battles;
DROP POLICY IF EXISTS "Users can view own battle results" ON public.battle_results;

-- Recreate policies using (auth.jwt() ->> 'user_id') instead of (auth.jwt() ->> 'sub')

-- Users
CREATE POLICY "Users can read own data" 
ON public.users FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = id);

CREATE POLICY "Users can update own non-sensitive data" 
ON public.users FOR UPDATE 
USING ((auth.jwt() ->> 'user_id') = id);

CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'user_id') = id);

CREATE POLICY "Service role has full access to users" 
ON public.users FOR ALL 
USING (auth.role() = 'service_role');

-- Inventory
CREATE POLICY "Users can read own inventory" 
ON public.inventory_items FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = user_id);

CREATE POLICY "Service role has full access to inventory" 
ON public.inventory_items FOR ALL 
USING (auth.role() = 'service_role');

-- Transactions
CREATE POLICY "Users can read own transactions" 
ON public.transactions FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = user_id);

CREATE POLICY "Service role has full access to transactions" 
ON public.transactions FOR ALL 
USING (auth.role() = 'service_role');

-- Shipments
CREATE POLICY "Users can read own shipments" 
ON public.shipments FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = user_id);

CREATE POLICY "Service role has full access to shipments" 
ON public.shipments FOR ALL 
USING (auth.role() = 'service_role');

-- Box Openings
CREATE POLICY "Users can view their own box openings" 
ON public.box_openings FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = user_id);

-- Battles
CREATE POLICY "Users can read own battles" 
ON public.battles FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = ANY(string_to_array(players::text, ',')::text[]));

-- Battle Results
CREATE POLICY "Users can view own battle results" 
ON public.battle_results FOR SELECT 
USING ((auth.jwt() ->> 'user_id') = winner_id);
