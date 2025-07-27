-- Update existing paid deals to have payment_received_date if missing
UPDATE deals 
SET payment_received_date = COALESCE(payment_received_date, updated_at::date)
WHERE status = 'paid' AND payment_received_date IS NULL;

-- Create cashflow entries for paid deals that don't have them yet
INSERT INTO cashflow_entries (
  type,
  description,
  category,
  amount,
  transaction_date,
  deal_id,
  is_projected
)
SELECT 
  'income' as type,
  'Deal betaling: ' || title as description,
  'deals' as category,
  amount,
  COALESCE(payment_received_date, updated_at::date) as transaction_date,
  id as deal_id,
  false as is_projected
FROM deals 
WHERE status = 'paid' 
AND id NOT IN (
  SELECT deal_id 
  FROM cashflow_entries 
  WHERE deal_id IS NOT NULL
);