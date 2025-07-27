-- Clean up inconsistent cashflow data
-- Remove old cashflow entries that were created for testing/demo and don't match current active fixed costs

-- First, let's remove old projected/test cashflow entries that are causing confusion
DELETE FROM public.cashflow_entries 
WHERE user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c'
AND (
  is_projected = true 
  OR (description LIKE '%januari%' OR description LIKE '%februari%')
  OR category IN ('Consulting', 'Project Revenue', 'Personeel', 'Huisvesting', 'Marketing')
)
AND deal_id IS NULL;

-- Also clean up any orphaned fixed cost entries in cashflow
DELETE FROM public.cashflow_entries 
WHERE user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c'
AND fixed_cost_id IS NOT NULL
AND fixed_cost_id NOT IN (
  SELECT id FROM public.fixed_costs 
  WHERE user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c' 
  AND is_active = true
);