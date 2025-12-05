-- ============================================
-- STREAMER SYSTEM
-- ============================================
-- This migration adds:
-- 1. Streamer role support
-- 2. Withdrawal permissions control
-- 3. Odds boost for streamers
-- 4. Admin controls for managing streamers

-- ============================================
-- PART 1: Add streamer fields to users table
-- ============================================

-- Add is_streamer flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'users'
                  AND column_name = 'is_streamer') THEN
        ALTER TABLE public.users ADD COLUMN is_streamer BOOLEAN DEFAULT FALSE NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_users_is_streamer ON public.users(is_streamer);
    END IF;
END $$;

-- Add can_withdraw flag (default TRUE for normal users, can be FALSE for streamers)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'users'
                  AND column_name = 'can_withdraw') THEN
        ALTER TABLE public.users ADD COLUMN can_withdraw BOOLEAN DEFAULT TRUE NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_users_can_withdraw ON public.users(can_withdraw);
    END IF;
END $$;

-- Add streamer_odds_multiplier (1.0 = normal, 2.0 = 2x better odds, etc.)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'users'
                  AND column_name = 'streamer_odds_multiplier') THEN
        ALTER TABLE public.users ADD COLUMN streamer_odds_multiplier DECIMAL(3, 2) DEFAULT 1.00 NOT NULL
        CHECK (streamer_odds_multiplier >= 1.00 AND streamer_odds_multiplier <= 10.00);
    END IF;
END $$;

-- Add streamer_note (for admins to add notes about the streamer)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'users'
                  AND column_name = 'streamer_note') THEN
        ALTER TABLE public.users ADD COLUMN streamer_note TEXT;
    END IF;
END $$;

-- ============================================
-- PART 2: Update RLS policies for admin access
-- ============================================

-- Allow admins to update streamer fields
DROP POLICY IF EXISTS "Admins can update user streamer status" ON public.users;
CREATE POLICY "Admins can update user streamer status"
ON public.users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::text
        AND role = 'admin'
    )
);

-- ============================================
-- PART 3: Create streamer_activity_log table
-- ============================================

CREATE TABLE IF NOT EXISTS public.streamer_activity_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('MADE_STREAMER', 'REMOVED_STREAMER', 'BALANCE_EDITED', 'WITHDRAWAL_ENABLED', 'WITHDRAWAL_DISABLED', 'ODDS_CHANGED')),
    admin_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    old_value TEXT,
    new_value TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_streamer_activity_log_user_id ON public.streamer_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_streamer_activity_log_admin_id ON public.streamer_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_streamer_activity_log_created_at ON public.streamer_activity_log(created_at DESC);

-- Enable RLS (admin only)
ALTER TABLE public.streamer_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view streamer activity log" ON public.streamer_activity_log;
CREATE POLICY "Admins can view streamer activity log"
ON public.streamer_activity_log FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::text
        AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can insert streamer activity log" ON public.streamer_activity_log;
CREATE POLICY "Admins can insert streamer activity log"
ON public.streamer_activity_log FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::text
        AND role = 'admin'
    )
);

GRANT SELECT, INSERT ON public.streamer_activity_log TO authenticated;
GRANT ALL ON public.streamer_activity_log TO service_role;

-- ============================================
-- PART 4: Function to set user as streamer
-- ============================================

CREATE OR REPLACE FUNCTION set_user_as_streamer(
    target_user_id TEXT,
    admin_user_id TEXT,
    odds_multiplier DECIMAL DEFAULT 2.00,
    allow_withdrawals BOOLEAN DEFAULT FALSE,
    admin_note TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update user
    UPDATE public.users
    SET
        is_streamer = TRUE,
        can_withdraw = allow_withdrawals,
        streamer_odds_multiplier = odds_multiplier,
        streamer_note = admin_note
    WHERE id = target_user_id;

    -- Log activity
    INSERT INTO public.streamer_activity_log (user_id, action, admin_id, new_value, note)
    VALUES (
        target_user_id,
        'MADE_STREAMER',
        admin_user_id,
        json_build_object(
            'odds_multiplier', odds_multiplier,
            'can_withdraw', allow_withdrawals
        )::text,
        admin_note
    );

    result := json_build_object(
        'success', true,
        'message', 'User successfully set as streamer'
    );

    RETURN result;
END;
$$;

-- ============================================
-- PART 5: Function to remove streamer status
-- ============================================

CREATE OR REPLACE FUNCTION remove_streamer_status(
    target_user_id TEXT,
    admin_user_id TEXT,
    admin_note TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update user
    UPDATE public.users
    SET
        is_streamer = FALSE,
        can_withdraw = TRUE,
        streamer_odds_multiplier = 1.00,
        streamer_note = NULL
    WHERE id = target_user_id;

    -- Log activity
    INSERT INTO public.streamer_activity_log (user_id, action, admin_id, note)
    VALUES (target_user_id, 'REMOVED_STREAMER', admin_user_id, admin_note);

    result := json_build_object(
        'success', true,
        'message', 'Streamer status removed'
    );

    RETURN result;
END;
$$;

-- ============================================
-- PART 6: Function to edit streamer balance
-- ============================================

CREATE OR REPLACE FUNCTION edit_streamer_balance(
    target_user_id TEXT,
    admin_user_id TEXT,
    new_balance DECIMAL,
    admin_note TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_balance DECIMAL;
    result JSON;
BEGIN
    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get old balance
    SELECT balance INTO old_balance FROM public.users WHERE id = target_user_id;

    -- Update balance
    UPDATE public.users
    SET balance = new_balance
    WHERE id = target_user_id;

    -- Log activity
    INSERT INTO public.streamer_activity_log (user_id, action, admin_id, old_value, new_value, note)
    VALUES (
        target_user_id,
        'BALANCE_EDITED',
        admin_user_id,
        old_balance::text,
        new_balance::text,
        admin_note
    );

    result := json_build_object(
        'success', true,
        'message', 'Balance updated successfully',
        'old_balance', old_balance,
        'new_balance', new_balance
    );

    RETURN result;
END;
$$;

-- ============================================
-- PART 7: Function to toggle withdrawal permission
-- ============================================

CREATE OR REPLACE FUNCTION toggle_user_withdrawal(
    target_user_id TEXT,
    admin_user_id TEXT,
    allow_withdraw BOOLEAN,
    admin_note TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update withdrawal permission
    UPDATE public.users
    SET can_withdraw = allow_withdraw
    WHERE id = target_user_id;

    -- Log activity
    INSERT INTO public.streamer_activity_log (user_id, action, admin_id, new_value, note)
    VALUES (
        target_user_id,
        CASE WHEN allow_withdraw THEN 'WITHDRAWAL_ENABLED' ELSE 'WITHDRAWAL_DISABLED' END,
        admin_user_id,
        allow_withdraw::text,
        admin_note
    );

    result := json_build_object(
        'success', true,
        'message', CASE WHEN allow_withdraw THEN 'Withdrawals enabled' ELSE 'Withdrawals disabled' END
    );

    RETURN result;
END;
$$;

-- ============================================
-- Summary
-- ============================================
-- ✅ Added is_streamer flag to users
-- ✅ Added can_withdraw permission control
-- ✅ Added streamer_odds_multiplier for improved odds
-- ✅ Added streamer_note for admin notes
-- ✅ Created streamer_activity_log for audit trail
-- ✅ Created helper functions for streamer management
-- ✅ Configured RLS policies
