-- Create fixed costs table for recurring expenses
CREATE TABLE IF NOT EXISTS public.fixed_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for fixed costs if not already enabled
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for fixed costs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fixed_costs' AND policyname = 'Fixed costs are viewable by authenticated users') THEN
        CREATE POLICY "Fixed costs are viewable by authenticated users" 
        ON public.fixed_costs 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fixed_costs' AND policyname = 'Authenticated users can manage fixed costs') THEN
        CREATE POLICY "Authenticated users can manage fixed costs" 
        ON public.fixed_costs 
        FOR ALL 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Create deals table for pipeline management
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'potential' CHECK (status IN ('potential', 'confirmed', 'invoiced', 'paid')),
  expected_date DATE,
  invoice_date DATE,
  payment_due_date DATE,
  payment_received_date DATE,
  description TEXT,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies for deals
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Deals are viewable by authenticated users') THEN
        CREATE POLICY "Deals are viewable by authenticated users" 
        ON public.deals 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Authenticated users can manage deals') THEN
        CREATE POLICY "Authenticated users can manage deals" 
        ON public.deals 
        FOR ALL 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Create cashflow_entries table for tracking actual income/expenses
CREATE TABLE IF NOT EXISTS public.cashflow_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  deal_id UUID REFERENCES public.deals(id),
  fixed_cost_id UUID REFERENCES public.fixed_costs(id),
  is_projected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for cashflow entries
ALTER TABLE public.cashflow_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for cashflow entries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cashflow_entries' AND policyname = 'Cashflow entries are viewable by authenticated users') THEN
        CREATE POLICY "Cashflow entries are viewable by authenticated users" 
        ON public.cashflow_entries 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cashflow_entries' AND policyname = 'Authenticated users can manage cashflow entries') THEN
        CREATE POLICY "Authenticated users can manage cashflow entries" 
        ON public.cashflow_entries 
        FOR ALL 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fixed_costs_updated_at') THEN
        CREATE TRIGGER update_fixed_costs_updated_at
          BEFORE UPDATE ON public.fixed_costs
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deals_updated_at') THEN
        CREATE TRIGGER update_deals_updated_at
          BEFORE UPDATE ON public.deals
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cashflow_entries_updated_at') THEN
        CREATE TRIGGER update_cashflow_entries_updated_at
          BEFORE UPDATE ON public.cashflow_entries
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;