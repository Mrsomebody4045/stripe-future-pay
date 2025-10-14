-- Add customer information to installment_payments for easier tracking
ALTER TABLE installment_payments 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_email TEXT;

-- Populate existing records with customer info from installment_plans
UPDATE installment_payments ip
SET 
  customer_name = pl.customer_name,
  customer_email = pl.customer_email
FROM installment_plans pl
WHERE ip.plan_id = pl.id;

-- Delete abandoned installment plans (pending with no successful payments)
-- First delete the associated payments
DELETE FROM installment_payments
WHERE plan_id IN (
  SELECT pl.id
  FROM installment_plans pl
  LEFT JOIN installment_payments pmt ON pmt.plan_id = pl.id AND pmt.status = 'succeeded'
  WHERE pl.status = 'pending' 
  AND pmt.id IS NULL
);

-- Then delete the abandoned plans
DELETE FROM installment_plans
WHERE status = 'pending'
AND id NOT IN (
  SELECT DISTINCT plan_id 
  FROM installment_payments 
  WHERE status = 'succeeded'
);