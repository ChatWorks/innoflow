-- Fix the deals table constraint to allow flexible recurring deals
ALTER TABLE public.deals 
DROP CONSTRAINT IF EXISTS check_mrr_monthly_amount;

-- Add a more flexible constraint that allows recurring deals without mandatory monthly_amount initially
ALTER TABLE public.deals 
ADD CONSTRAINT check_recurring_deal_data 
CHECK (
  (deal_type = 'one_time') OR 
  (deal_type = 'recurring' AND (monthly_amount IS NULL OR monthly_amount > 0))
);

-- Make start_date optional for recurring deals
-- Update recurring_revenue table to allow NULL end_date for indefinite contracts
ALTER TABLE public.recurring_revenue 
ALTER COLUMN end_date DROP NOT NULL;