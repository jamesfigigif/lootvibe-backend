-- Safely add winner columns if they don't exist
DO $$ 
BEGIN 
    -- Add winner_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'battles' AND column_name = 'winner_id') THEN
        ALTER TABLE public.battles ADD COLUMN winner_id TEXT;
        COMMENT ON COLUMN public.battles.winner_id IS 'User ID of the battle winner, set when status becomes FINISHED';
    END IF;

    -- Add winner_total_value column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'battles' AND column_name = 'winner_total_value') THEN
        ALTER TABLE public.battles ADD COLUMN winner_total_value NUMERIC DEFAULT 0;
        COMMENT ON COLUMN public.battles.winner_total_value IS 'Total value of items won by the winner across all rounds';
    END IF;

    -- Add results column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'battles' AND column_name = 'results') THEN
        ALTER TABLE public.battles ADD COLUMN results JSONB;
        COMMENT ON COLUMN public.battles.results IS 'Array of all players results: [{ playerId, items, totalValue }]';
    END IF;
END $$;

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_battles_winner_id ON public.battles(winner_id);
