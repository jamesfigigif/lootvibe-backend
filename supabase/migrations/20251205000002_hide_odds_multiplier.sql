-- Hide odds_multiplier from public view
-- Only admins can see the multiplier used in box openings

-- Create a view for public box openings (without odds_multiplier)
CREATE OR REPLACE VIEW public_box_openings AS
SELECT
    id,
    box_id,
    user_id,
    item_won,
    box_price,
    item_value,
    profit_loss,
    client_seed,
    server_seed,
    nonce,
    random_value,
    outcome,
    created_at
    -- Deliberately excluding odds_multiplier
FROM public.box_openings;

-- Grant access to the view
GRANT SELECT ON public_box_openings TO authenticated, anon;

-- Add comment for clarity
COMMENT ON VIEW public_box_openings IS
'Public view of box openings without sensitive fields like odds_multiplier. Only admins can access the full table.';

-- Update RLS policy on box_openings to restrict non-admin access
ALTER TABLE public.box_openings ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own openings (but odds_multiplier should be accessed via view)
DROP POLICY IF EXISTS "Users can view their own box openings" ON public.box_openings;
CREATE POLICY "Users can view their own box openings"
ON public.box_openings FOR SELECT
USING (auth.uid()::text = user_id OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role = 'admin'
));

-- Admins can see everything including odds_multiplier
DROP POLICY IF EXISTS "Admins can view all box openings" ON public.box_openings;
CREATE POLICY "Admins can view all box openings"
ON public.box_openings FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role = 'admin'
));
