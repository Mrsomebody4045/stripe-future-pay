-- Add add_ons column to guests table for storing individual guest experiences
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS add_ons jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.guests.add_ons IS 'Array of add-on experiences (quad, ski, snowboard, lessons) for this guest';