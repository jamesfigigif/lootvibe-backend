-- Add winner tracking and results to battles table
-- This migration is idempotent (safe to run multiple times)

-- Add winner_id column to track who won the battle
ALTER TABLE public.battles 
ADD COLUMN IF NOT EXISTS winner_id TEXT;

-- Add winner_total_value to track the winner's total item value
ALTER TABLE public.battles 
ADD COLUMN IF NOT EXISTS winner_total_value NUMERIC DEFAULT 0;

-- Add results column to store all players' final results
ALTER TABLE public.battles 
ADD COLUMN IF NOT EXISTS results JSONB;

-- Add index for performance when querying by winner
CREATE INDEX IF NOT EXISTS idx_battles_winner_id ON public.battles(winner_id);

-- Add comments for documentation
COMMENT ON COLUMN public.battles.winner_id IS 'User ID of the battle winner, set when status becomes FINISHED';
COMMENT ON COLUMN public.battles.winner_total_value IS 'Total value of items won by the winner across all rounds';
COMMENT ON COLUMN public.battles.results IS 'Array of all players results: [{ playerId, items, totalValue }]';
