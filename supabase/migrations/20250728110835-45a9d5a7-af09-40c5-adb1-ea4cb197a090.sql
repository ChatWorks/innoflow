-- Remove the old frequency check constraint and add a new one that includes 'one_time'
ALTER TABLE public.fixed_costs 
DROP CONSTRAINT IF EXISTS fixed_costs_frequency_check;

ALTER TABLE public.fixed_costs 
ADD CONSTRAINT fixed_costs_frequency_check 
CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one_time'));