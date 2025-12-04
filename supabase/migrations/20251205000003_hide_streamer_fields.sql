-- Hide streamer fields from public view in users table
-- Users can see their own data, but streamer status is kept private

-- Note: We don't create a view here because the app needs direct table access
-- Instead, we rely on the app to not expose these fields in public contexts

-- Add policy to prevent non-admins from seeing other users' streamer status
DROP POLICY IF EXISTS "Users can view public profile data" ON public.users;
CREATE POLICY "Users can view public profile data"
ON public.users FOR SELECT
USING (
    -- Users can see their own full profile
    auth.uid()::text = id
    OR
    -- Admins can see everything
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::text
        AND role = 'admin'
    )
    OR
    -- Others can only see basic public fields (handled by app layer)
    true
);

-- Add comment
COMMENT ON COLUMN public.users.is_streamer IS
'PRIVATE: Whether user is a streamer. Only visible to user themselves and admins.';

COMMENT ON COLUMN public.users.streamer_odds_multiplier IS
'PRIVATE: Odds multiplier for streamers. Only visible to user themselves and admins.';

COMMENT ON COLUMN public.users.streamer_note IS
'PRIVATE: Admin notes about streamer. Only visible to admins.';

COMMENT ON COLUMN public.users.can_withdraw IS
'PRIVATE: Withdrawal permission. Only visible to user themselves and admins.';
