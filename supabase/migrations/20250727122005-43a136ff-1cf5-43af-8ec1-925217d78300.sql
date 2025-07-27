-- First, let's check and fix the foreign key constraints to use CASCADE DELETE
-- Drop the existing constraint if it exists
ALTER TABLE public.cashflow_entries DROP CONSTRAINT IF EXISTS cashflow_entries_deal_id_fkey;

-- Recreate the constraint with CASCADE DELETE
ALTER TABLE public.cashflow_entries 
ADD CONSTRAINT cashflow_entries_deal_id_fkey 
FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;

-- Also fix recurring_revenue constraint to use CASCADE DELETE
ALTER TABLE public.recurring_revenue DROP CONSTRAINT IF EXISTS recurring_revenue_deal_id_fkey;

ALTER TABLE public.recurring_revenue 
ADD CONSTRAINT recurring_revenue_deal_id_fkey 
FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;