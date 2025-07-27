-- Add new columns to deals table for revenue models
ALTER TABLE public.deals 
ADD COLUMN deal_type TEXT NOT NULL DEFAULT 'one_time',
ADD COLUMN monthly_amount NUMERIC,
ADD COLUMN contract_length INTEGER, -- in months
ADD COLUMN start_date DATE;

-- Create recurring_revenue table for MRR tracking
CREATE TABLE public.recurring_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  monthly_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on recurring_revenue table
ALTER TABLE public.recurring_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recurring_revenue
CREATE POLICY "Authenticated users can manage recurring revenue" ON public.recurring_revenue
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Recurring revenue is viewable by authenticated users" ON public.recurring_revenue
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at on recurring_revenue
CREATE TRIGGER update_recurring_revenue_updated_at
  BEFORE UPDATE ON public.recurring_revenue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraint to ensure monthly_amount is provided for MRR deals
ALTER TABLE public.deals 
ADD CONSTRAINT check_mrr_monthly_amount 
CHECK (
  (deal_type = 'one_time') OR 
  (deal_type = 'recurring' AND monthly_amount IS NOT NULL AND monthly_amount > 0)
);