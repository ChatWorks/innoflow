-- Fix existing data by assigning current user_id to all existing records
-- This will make existing data visible again after the security implementation

-- First, let's get all users and update their data
-- We'll update all existing records to belong to the first authenticated user

-- Update deals table
UPDATE public.deals 
SET user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c'
WHERE user_id IS NULL;

-- Update fixed_costs table  
UPDATE public.fixed_costs 
SET user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c'
WHERE user_id IS NULL;

-- Update cashflow_entries table
UPDATE public.cashflow_entries 
SET user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c'
WHERE user_id IS NULL;

-- Update recurring_revenue table
UPDATE public.recurring_revenue 
SET user_id = '4e1d4c7d-a9cc-4daa-9d26-f9d3bfb40a7c'
WHERE user_id IS NULL;

-- Make user_id columns NOT NULL for data integrity (except existing null values are now fixed)
ALTER TABLE public.deals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.fixed_costs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.cashflow_entries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.recurring_revenue ALTER COLUMN user_id SET NOT NULL;