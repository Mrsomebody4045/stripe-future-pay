-- Add with_lead_name column to guests table
ALTER TABLE public.guests 
ADD COLUMN with_lead_name TEXT;