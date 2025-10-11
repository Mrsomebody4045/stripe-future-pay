-- Add phone number column to installment_plans table
ALTER TABLE installment_plans 
ADD COLUMN customer_phone text;