# Free Box Fix - Deployment Instructions

## Issues Fixed
1. ✅ CORS error in claim-free-box edge function (missing Access-Control-Allow-Methods header)
2. ✅ Incomplete code in claim-free-box edge function (broken logic between lines 65-97)
3. ✅ RLS policy for boxes table preventing anonymous users from viewing boxes
4. ✅ Free box already hides on index page after claiming (existing logic verified)

## Deployment Steps

### Step 1: Deploy the Fixed Edge Function

Deploy the updated `claim-free-box` edge function with the fixed CORS headers and complete logic:

```bash
npx supabase functions deploy claim-free-box --no-verify-jwt
```

**What this fixes:**
- Adds `Access-Control-Allow-Methods: POST, OPTIONS` to CORS headers
- Implements complete free box claiming logic:
  - Verifies user hasn't already claimed
  - Fetches the welcome_gift box from database
  - Selects random item using weighted odds
  - Updates user balance and marks free_box_claimed as true
- Uses consistent CORS headers across all responses

### Step 2: Apply Database Migrations

You need to apply **TWO** migrations in order:

#### Migration 1: Fix RLS Issues (if not already applied)
This fixes user creation and admin policy issues.

**File:** `supabase/migrations/20251203000002_fix_all_rls_issues.sql`

Run in Supabase SQL Editor:
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

#### Migration 2: Fix Boxes Anonymous Access (NEW - REQUIRED)
This fixes the 400 error when fetching boxes before login.

**File:** `supabase/migrations/20251203000003_fix_boxes_anon_access.sql`

Run in Supabase SQL Editor:
```sql
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
```

### Step 3: Verify Environment Variables

Make sure these environment variables are set in your Supabase Edge Functions:

```bash
CLERK_PEM_PUBLIC_KEY=<your-clerk-pem-public-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

You can set them using:
```bash
npx supabase secrets set CLERK_PEM_PUBLIC_KEY="<value>"
```

### Step 4: Test the Fix

1. Open your website in an incognito/private browser window
2. You should now see boxes loading without the 400 error
3. Sign up for a new account
4. Click "CLAIM FREE BOX" button
5. The free box should open successfully
6. After claiming, the free box card should disappear from the index page
7. Verify the user's balance increased

### Step 5: Verify Database State

Check that the welcome_gift box exists:
```sql
SELECT id, name, items FROM boxes WHERE id = 'welcome_gift';
```

If it doesn't exist, you need to create it. The free box claiming logic expects:
- Box with id: `'welcome_gift'`
- Box must have an `items` JSONB field with array of items
- Each item should have: `{ name, value, rarity, odds, image }`

## How It Works

### Frontend Flow (App.tsx)
1. User clicks "CLAIM FREE BOX" button
2. `handleLogin(true)` is called, which sets `pendingWelcomeSpin` flag
3. After Clerk authentication, `confirmLogin()` is called
4. If `pendingWelcomeSpin` flag is set and `freeBoxClaimed` is false, triggers `handleWelcomeSpin()`
5. `handleWelcomeSpin()` calls the edge function with Clerk token
6. On success, updates user state with `freeBoxClaimed: true`
7. Frontend filters out the welcome_gift box from display (line 1349 in App.tsx)

### Backend Flow (claim-free-box edge function)
1. Verifies Clerk JWT token
2. Creates Supabase admin client (bypasses RLS)
3. Checks if user has already claimed (`free_box_claimed` field)
4. Fetches the `welcome_gift` box from database
5. Selects random item using weighted odds algorithm
6. Updates user's balance and sets `free_box_claimed = true`
7. Returns winning item and roll result

### Database Schema Requirements
- `users` table must have columns:
  - `free_box_claimed` (boolean, default: false)
  - `balance` (numeric/decimal)
- `boxes` table must have a row with id='welcome_gift'
- The welcome_gift box must have properly formatted items in JSONB

## Troubleshooting

### "Failed to send a request to the Edge Function"
- Check CORS headers are properly set (fixed in this deployment)
- Verify Edge Function is deployed
- Check browser console for specific CORS errors

### "Welcome box not found"
- Run: `SELECT * FROM boxes WHERE id = 'welcome_gift'`
- Ensure the box exists and has items

### "User not found"
- Verify Clerk integration is working
- Check that users are being created properly on signup
- Verify CLERK_PEM_PUBLIC_KEY is correct

### "You have already claimed your free box"
- This is correct behavior - user can only claim once
- The free box card should be hidden from the index page
- To reset for testing: `UPDATE users SET free_box_claimed = false WHERE id = 'user_id'`

### Boxes still show 400 error
- Ensure Migration 2 was applied correctly
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'boxes';`
- Check policy exists: `SELECT * FROM pg_policies WHERE tablename = 'boxes';`

## Changes Made

### Modified Files:
1. `supabase/functions/claim-free-box/index.ts`
   - Added `Access-Control-Allow-Methods` to CORS headers
   - Fixed incomplete code (lines 65-97)
   - Added welcome box fetching logic
   - Added weighted random item selection
   - Added proper error handling with CORS headers
   - Used consistent corsHeaders object throughout

### New Files:
1. `supabase/migrations/20251203000003_fix_boxes_anon_access.sql`
   - Allows anonymous users to view enabled boxes
   - Grants SELECT permission to anon and authenticated roles

## Notes
- The free box can only be claimed once per user (enforced in database with `.eq('free_box_claimed', false)`)
- The frontend already has logic to hide the free box after claiming (verified at App.tsx:1349)
- All CORS errors should be resolved
- Anonymous users can now view boxes before signing in
