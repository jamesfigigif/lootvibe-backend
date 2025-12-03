-- ============================================
-- WITHDRAWAL SYSTEM ENHANCEMENTS
-- ============================================
-- This migration adds:
-- 1. withdrawal_limits table for daily/monthly limits
-- 2. hot_wallet_balances table for historical tracking
-- 3. hot_wallet_alerts table for alert logging
-- 4. Additional fields to withdrawals table
-- 5. Helper functions and triggers

-- ============================================
-- PART 1: withdrawal_limits TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.withdrawal_limits (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    daily_limit DECIMAL(10, 2) DEFAULT 10000 NOT NULL,
    monthly_limit DECIMAL(10, 2) DEFAULT 100000 NOT NULL,
    daily_withdrawn DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    monthly_withdrawn DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    last_daily_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_monthly_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    vip_tier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_limits_user_id ON public.withdrawal_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_limits_vip_tier ON public.withdrawal_limits(vip_tier);

-- Enable RLS
ALTER TABLE public.withdrawal_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own limits" ON public.withdrawal_limits;
CREATE POLICY "Users can view their own limits"
ON public.withdrawal_limits FOR SELECT
USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Service role has full access to limits" ON public.withdrawal_limits;
CREATE POLICY "Service role has full access to limits"
ON public.withdrawal_limits FOR ALL
USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.withdrawal_limits TO authenticated;
GRANT ALL ON public.withdrawal_limits TO service_role;

-- ============================================
-- PART 2: hot_wallet_balances TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.hot_wallet_balances (
    id SERIAL PRIMARY KEY,
    btc_balance DECIMAL(10, 8) DEFAULT 0 NOT NULL,
    eth_balance DECIMAL(18, 8) DEFAULT 0 NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_hot_wallet_balances_recorded_at ON public.hot_wallet_balances(recorded_at DESC);

-- Enable RLS (admin only)
ALTER TABLE public.hot_wallet_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only service role can access balances" ON public.hot_wallet_balances;
CREATE POLICY "Only service role can access balances"
ON public.hot_wallet_balances FOR ALL
USING (auth.role() = 'service_role');

GRANT ALL ON public.hot_wallet_balances TO service_role;
GRANT USAGE, SELECT ON SEQUENCE hot_wallet_balances_id_seq TO service_role;

-- ============================================
-- PART 3: hot_wallet_alerts TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.hot_wallet_alerts (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('CRITICAL', 'WARNING', 'INFO')),
    currency TEXT NOT NULL CHECK (currency IN ('BTC', 'ETH')),
    balance DECIMAL(18, 8) NOT NULL,
    threshold DECIMAL(18, 8) NOT NULL,
    message TEXT NOT NULL,
    action TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hot_wallet_alerts_created_at ON public.hot_wallet_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hot_wallet_alerts_level ON public.hot_wallet_alerts(level);
CREATE INDEX IF NOT EXISTS idx_hot_wallet_alerts_resolved ON public.hot_wallet_alerts(resolved);

-- Enable RLS (admin only)
ALTER TABLE public.hot_wallet_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only service role can access alerts" ON public.hot_wallet_alerts;
CREATE POLICY "Only service role can access alerts"
ON public.hot_wallet_alerts FOR ALL
USING (auth.role() = 'service_role');

GRANT ALL ON public.hot_wallet_alerts TO service_role;

-- ============================================
-- PART 4: Update withdrawals TABLE
-- ============================================

-- Add ip_address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'withdrawals'
                  AND column_name = 'ip_address') THEN
        ALTER TABLE public.withdrawals ADD COLUMN ip_address TEXT;
    END IF;
END $$;

-- Add actual_fee column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'withdrawals'
                  AND column_name = 'actual_fee') THEN
        ALTER TABLE public.withdrawals ADD COLUMN actual_fee DECIMAL(10, 8);
    END IF;
END $$;

-- Update status check constraint if needed
DO $$
BEGIN
    -- Drop old constraint
    ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_status_check;

    -- Add new constraint with additional statuses
    ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_status_check
    CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED'));
END $$;

-- ============================================
-- PART 5: Helper Functions
-- ============================================

-- Function to automatically reset daily limits
CREATE OR REPLACE FUNCTION reset_daily_withdrawal_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.withdrawal_limits
    SET daily_withdrawn = 0,
        last_daily_reset = NOW(),
        updated_at = NOW()
    WHERE DATE(last_daily_reset) < CURRENT_DATE;
END;
$$;

-- Function to automatically reset monthly limits
CREATE OR REPLACE FUNCTION reset_monthly_withdrawal_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.withdrawal_limits
    SET monthly_withdrawn = 0,
        last_monthly_reset = NOW(),
        updated_at = NOW()
    WHERE DATE_TRUNC('month', last_monthly_reset) < DATE_TRUNC('month', NOW());
END;
$$;

-- Function to update withdrawal limits updated_at timestamp
CREATE OR REPLACE FUNCTION update_withdrawal_limits_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_withdrawal_limits_updated_at ON public.withdrawal_limits;
CREATE TRIGGER trigger_withdrawal_limits_updated_at
    BEFORE UPDATE ON public.withdrawal_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_withdrawal_limits_updated_at();

-- ============================================
-- PART 6: platform_settings TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    auto_approve_withdrawals BOOLEAN DEFAULT FALSE,
    manual_approval_threshold DECIMAL(10, 2) DEFAULT 1000,
    min_withdrawal_amount DECIMAL(10, 2) DEFAULT 25,
    max_withdrawal_amount DECIMAL(10, 2) DEFAULT 100000,
    btc_withdrawal_fee DECIMAL(10, 8) DEFAULT 0.0001,
    eth_withdrawal_fee DECIMAL(18, 8) DEFAULT 0.001,
    withdrawal_processing_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO public.platform_settings (id, auto_approve_withdrawals, manual_approval_threshold)
VALUES ('default', FALSE, 100)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (admin only)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view settings" ON public.platform_settings;
CREATE POLICY "Anyone can view settings"
ON public.platform_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Only service role can modify settings" ON public.platform_settings;
CREATE POLICY "Only service role can modify settings"
ON public.platform_settings FOR ALL
USING (auth.role() = 'service_role');

GRANT SELECT ON public.platform_settings TO authenticated, anon;
GRANT ALL ON public.platform_settings TO service_role;

-- ============================================
-- PART 7: Add users.vip_tier column if not exists
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'users'
                  AND column_name = 'vip_tier') THEN
        ALTER TABLE public.users ADD COLUMN vip_tier TEXT CHECK (vip_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'));
    END IF;
END $$;

-- ============================================
-- PART 8: Add users.email column if not exists
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'users'
                  AND column_name = 'email') THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
    END IF;
END $$;

-- ============================================
-- Summary
-- ============================================
-- ✅ Created withdrawal_limits table for daily/monthly limits
-- ✅ Created hot_wallet_balances table for historical tracking
-- ✅ Created hot_wallet_alerts table for alert logging
-- ✅ Updated withdrawals table with ip_address and actual_fee
-- ✅ Created helper functions for limit resets
-- ✅ Created platform_settings table for configuration
-- ✅ Added vip_tier and email to users table
-- ✅ Configured RLS policies for all tables
