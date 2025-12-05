-- Add odds_multiplier column to box_openings table for transparency
-- This allows anyone to see if a streamer multiplier was used in a box opening

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'box_openings'
        AND column_name = 'odds_multiplier'
    ) THEN
        ALTER TABLE public.box_openings
        ADD COLUMN odds_multiplier DECIMAL(3, 2) DEFAULT 1.00 NOT NULL;

        -- Add helpful comment
        COMMENT ON COLUMN public.box_openings.odds_multiplier IS
        'Odds multiplier applied to this opening (1.00 = normal, >1.00 = streamer boost). Recorded for transparency.';
    END IF;
END $$;
