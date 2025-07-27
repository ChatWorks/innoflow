-- Phase 1: Critical RLS Policy Fixes
-- Add user_id columns to tables that need user-specific access control

-- Add user_id to deals table
ALTER TABLE public.deals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to fixed_costs table  
ALTER TABLE public.fixed_costs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to cashflow_entries table
ALTER TABLE public.cashflow_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to recurring_revenue table
ALTER TABLE public.recurring_revenue ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing data to set user_id for current authenticated users
-- Note: This will need to be handled manually for existing data

-- Drop existing overly permissive RLS policies for deals
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.deals;
DROP POLICY IF EXISTS "Deals are viewable by authenticated users" ON public.deals;

-- Create user-specific RLS policies for deals
CREATE POLICY "Users can view their own deals" 
ON public.deals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" 
ON public.deals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" 
ON public.deals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing overly permissive RLS policies for fixed_costs
DROP POLICY IF EXISTS "Authenticated users can manage fixed costs" ON public.fixed_costs;
DROP POLICY IF EXISTS "Fixed costs are viewable by authenticated users" ON public.fixed_costs;

-- Create user-specific RLS policies for fixed_costs
CREATE POLICY "Users can view their own fixed costs" 
ON public.fixed_costs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixed costs" 
ON public.fixed_costs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed costs" 
ON public.fixed_costs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed costs" 
ON public.fixed_costs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing overly permissive RLS policies for cashflow_entries
DROP POLICY IF EXISTS "Authenticated users can manage cashflow entries" ON public.cashflow_entries;
DROP POLICY IF EXISTS "Cashflow entries are viewable by authenticated users" ON public.cashflow_entries;

-- Create user-specific RLS policies for cashflow_entries
CREATE POLICY "Users can view their own cashflow entries" 
ON public.cashflow_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cashflow entries" 
ON public.cashflow_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cashflow entries" 
ON public.cashflow_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cashflow entries" 
ON public.cashflow_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing overly permissive RLS policies for recurring_revenue
DROP POLICY IF EXISTS "Authenticated users can manage recurring revenue" ON public.recurring_revenue;
DROP POLICY IF EXISTS "Recurring revenue is viewable by authenticated users" ON public.recurring_revenue;

-- Create user-specific RLS policies for recurring_revenue
CREATE POLICY "Users can view their own recurring revenue" 
ON public.recurring_revenue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring revenue" 
ON public.recurring_revenue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring revenue" 
ON public.recurring_revenue 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring revenue" 
ON public.recurring_revenue 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix database security configuration issues
-- Update function security for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';