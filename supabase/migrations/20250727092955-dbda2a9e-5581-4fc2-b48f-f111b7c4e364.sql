-- Create authentication profiles table for team access
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create fixed costs table for recurring expenses
CREATE TABLE public.fixed_costs (
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

-- Enable RLS for fixed costs
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for fixed costs
CREATE POLICY "Fixed costs are viewable by authenticated users" 
ON public.fixed_costs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage fixed costs" 
ON public.fixed_costs 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create deals table for pipeline management
CREATE TABLE public.deals (
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
CREATE POLICY "Deals are viewable by authenticated users" 
ON public.deals 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage deals" 
ON public.deals 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create cashflow_entries table for tracking actual income/expenses
CREATE TABLE public.cashflow_entries (
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
CREATE POLICY "Cashflow entries are viewable by authenticated users" 
ON public.cashflow_entries 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage cashflow entries" 
ON public.cashflow_entries 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixed_costs_updated_at
  BEFORE UPDATE ON public.fixed_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashflow_entries_updated_at
  BEFORE UPDATE ON public.cashflow_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();