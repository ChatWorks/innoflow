-- Create expenses table for comprehensive expense tracking
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  linked_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  budget_category TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budgets table for budget management
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  current_spent NUMERIC DEFAULT 0,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  is_active BOOLEAN DEFAULT true,
  alert_threshold NUMERIC DEFAULT 0.8, -- Alert at 80% by default
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, month_year)
);

-- Create expense_categories table for managing categories and subcategories
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_category_id UUID REFERENCES public.expense_categories(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, parent_category_id)
);

-- Enable RLS on all tables
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Users can manage their own expenses" ON public.expenses
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Expenses are viewable by owner" ON public.expenses
FOR SELECT 
USING (auth.uid() = user_id);

-- Create RLS policies for budgets
CREATE POLICY "Users can manage their own budgets" ON public.budgets
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Budgets are viewable by owner" ON public.budgets
FOR SELECT 
USING (auth.uid() = user_id);

-- Create RLS policies for expense_categories
CREATE POLICY "Users can manage their own categories" ON public.expense_categories
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Categories are viewable by owner" ON public.expense_categories
FOR SELECT 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default expense categories
INSERT INTO public.expense_categories (user_id, name, is_default) VALUES
(auth.uid(), 'Kantoor', true),
(auth.uid(), 'Marketing', true),
(auth.uid(), 'Software', true),
(auth.uid(), 'Personeel', true),
(auth.uid(), 'Travel', true),
(auth.uid(), 'Hardware', true),
(auth.uid(), 'Training', true),
(auth.uid(), 'Legal', true);

-- Function to update budget current_spent when expenses are added/updated/deleted
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current month's budget
  UPDATE public.budgets 
  SET current_spent = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.expenses
    WHERE user_id = budgets.user_id
    AND category = budgets.category
    AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM TO_DATE(budgets.month_year, 'YYYY-MM'))
    AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM TO_DATE(budgets.month_year, 'YYYY-MM'))
  )
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  AND category = COALESCE(NEW.category, OLD.category)
  AND month_year = TO_CHAR(COALESCE(NEW.expense_date, OLD.expense_date), 'YYYY-MM');
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update budget spent amounts
CREATE TRIGGER update_budget_on_expense_change
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent();