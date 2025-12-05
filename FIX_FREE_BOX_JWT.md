# Fix Free Box JWT Authentication Error

## Problem
Getting `401 Unauthorized - Invalid JWT` when claiming free box.

## Root Cause
The Clerk PEM public key in Supabase doesn't match your Clerk application's actual public key.

## Solution

### Step 1: Get Your Clerk PEM Public Key

1. Go to: https://dashboard.clerk.com
2. Select your LootVibe application
3. Navigate to: **Configure → API Keys**
4. Scroll to: **Advanced → Show JWT public key**
5. Click **"Show PEM public key"**
6. Copy the entire key (including `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----`)

### Step 2: Update Supabase Secret

Run this command with YOUR actual key:

```bash
cd /Users/luke/Downloads/lootvibe

supabase secrets set CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...your key here...
-----END PUBLIC KEY-----"
```

**Important:** Make sure to include the quotation marks and the full key.

### Step 3: Redeploy Edge Function

```bash
supabase functions deploy claim-free-box
```

### Step 4: Test

1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Try claiming the free box again
3. Should work now!

## Quick Test Command

After setting the key, test with:

```bash
# Check if secret is set
supabase secrets list | grep CLERK_PEM_PUBLIC_KEY
```

## Alternative: Use Clerk JWKS (Recommended)

The `claim-free-box` function already supports JWKS verification. Check if `CLERK_DOMAIN` secret is set:

```bash
supabase secrets list | grep CLERK_DOMAIN
```

If it's not set:

```bash
supabase secrets set CLERK_DOMAIN="your-app-name.clerk.accounts.dev"
```

Then the function will automatically use JWKS instead of PEM key.

## Troubleshooting

### Still getting 401?

1. **Check Supabase logs:**
   https://supabase.com/dashboard/project/hpflcuyxmwzrknxjgavd/logs/edge-functions

2. **Verify token template:**
   Frontend uses `getToken({ template: 'supabase' })` - this is correct.

3. **Check Clerk JWT template exists:**
   - Go to Clerk Dashboard
   - Navigate to: **Configure → JWT Templates**
   - Make sure you have a template named "supabase"

4. **Test token manually:**
   ```javascript
   // In browser console while logged in:
   const { getToken } = useAuth();
   const token = await getToken({ template: 'supabase' });
   console.log(token);
   // Copy token and decode at: https://jwt.io
   ```

## Fixed Issues

- ✅ Added close button to welcome screen
- ✅ Made welcome screen mobile-responsive
- ✅ Improved text sizing for mobile devices
- ⚠️ JWT authentication - needs Clerk PEM key update

---

**Last Updated:** 2025-12-05
