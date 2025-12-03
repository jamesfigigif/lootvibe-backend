# Quick Start - Apply Withdrawal System Migration

## Step 1: Apply Database Migration

**IMPORTANT**: You need to run the SQL migration to enable the withdrawal system.

### Using Supabase SQL Editor (Easiest Method)

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/hpflcuyxmwzrknxjgavd/sql/new

2. **Copy the migration file**:
   - Open: `/Users/luke/Downloads/lootvibe/supabase/migrations/APPLY_THIS_FIRST.sql`
   - Select all and copy (Cmd+A, Cmd+C)

3. **Paste and run**:
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for "Migration completed successfully!" message

**That's it!** The migration will create all the necessary tables and functions.

## Step 2: Set Environment Variables

Create or update your `.env.local` file with these **REQUIRED** variables:

```env
# Supabase (you already have these)
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Bitcoin Wallet - CRITICAL: Generate a new mnemonic or use existing
# Generate at: https://iancoleman.io/bip39/ (12 or 24 words)
BTC_MASTER_SEED="word1 word2 word3 ... word12"

# Ethereum Wallet - CRITICAL: Generate a new mnemonic or use existing
ETH_MASTER_SEED="word1 word2 word3 ... word12"

# Email (SendGrid) - Get API key from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
EMAIL_ENABLED=true

# Blockchain RPC - Get free API key from: https://infura.io
INFURA_API_KEY=your_infura_api_key_here

# Optional: Discord alerts for low balance notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Environment
NODE_ENV=development  # Use 'production' when ready
```

### ⚠️ SECURITY WARNING

**NEVER commit your wallet seeds to git!** These control your crypto funds.

- For **testing**: Let the system generate new seeds (they'll be logged on first start)
- For **production**: Use hardware wallets or secure key management systems

## Step 3: Start the Backend

```bash
cd /Users/luke/Downloads/lootvibe/backend
npm install  # If not already installed
npm start
```

You should see these logs:
```
⚠️  BTC Wallet initialized
⚠️  ETH Wallet initialized
✅ Hot Wallet Monitor started
✅ Withdrawal Processor started
✅ Email Service initialized
```

If you see "WARNING: No BTC_MASTER_SEED found", the system will generate one for you. **Copy it and save it securely!**

## Step 4: Configure Platform Settings

Update the auto-withdrawal threshold via Supabase SQL Editor:

```sql
UPDATE platform_settings
SET
  auto_approve_withdrawals = true,
  manual_approval_threshold = 100.00  -- Auto-approve under $100 for testing
WHERE id = 'default';
```

## Step 5: Test a Withdrawal

1. **Request a test withdrawal**:
   - Log in to your app
   - Go to withdrawal page
   - Request $25-50 BTC or ETH withdrawal
   - Enter a valid test address

2. **Check admin panel**:
   - Should appear in withdrawals tab
   - Status will be APPROVED (if auto-approve is enabled)

3. **Wait ~30 seconds**:
   - Withdrawal processor runs every 30 seconds
   - Check logs for processing messages

4. **Verify completion**:
   - Status should change to COMPLETED
   - Transaction hash should be recorded
   - Email should be sent (if enabled)

## What's Working Now

✅ **Address Validation** - Rejects invalid BTC/ETH addresses
✅ **Withdrawal Limits** - Enforces daily ($10k) and monthly ($100k) limits
✅ **Hot Wallet Monitoring** - Alerts when balance is low
✅ **Auto-Processing** - Automatically signs and broadcasts transactions
✅ **Email Notifications** - Sends updates on deposit/withdrawal status
✅ **VIP Tiers** - Supports higher limits for VIP users

## Troubleshooting

### "Column vip_tier does not exist"
**Solution**: You haven't applied the migration yet. Follow Step 1 above.

### "Insufficient hot wallet funds"
**Solution**: Fund your hot wallet addresses (displayed in server logs on startup)

### Withdrawal stuck in APPROVED status
**Solution**:
- Check backend logs for errors
- Verify INFURA_API_KEY is set
- Verify hot wallet has funds

### Email not sending
**Solution**:
- Verify SENDGRID_API_KEY is valid
- Set EMAIL_ENABLED=true
- Check SendGrid account is active

## Next Steps

Once you've tested successfully:

1. **Fund hot wallets** with real funds
2. **Set production environment**: `NODE_ENV=production`
3. **Use mainnet RPC endpoints** (remove testnet URLs)
4. **Increase auto-approval threshold** to $1000+
5. **Set up monitoring** for hot wallet balances
6. **Enable production mode** in all services

## Need Help?

Check the full deployment guide: `WITHDRAWAL_SYSTEM_DEPLOYMENT.md`

---

**Generated with Claude Code** 🤖
