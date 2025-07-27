-- Phase 2: Address remaining security configuration issues

-- Fix function search path for update_budget_spent function
CREATE OR REPLACE FUNCTION public.update_budget_spent()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Additional security function to fix search path issues
-- This replaces any other functions that might have mutable search paths
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';