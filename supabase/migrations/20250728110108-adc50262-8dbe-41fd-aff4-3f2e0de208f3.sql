-- Add cost_type column to fixed_costs table to distinguish between recurring and one-time costs
ALTER TABLE public.fixed_costs 
ADD COLUMN cost_type TEXT NOT NULL DEFAULT 'recurring' CHECK (cost_type IN ('recurring', 'one_time'));

-- Update existing records to be recurring costs
UPDATE public.fixed_costs 
SET cost_type = 'recurring' 
WHERE cost_type IS NULL OR cost_type = 'recurring';