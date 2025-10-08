-- Make booking_id nullable in guests table
ALTER TABLE public.guests ALTER COLUMN booking_id DROP NOT NULL;