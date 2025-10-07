-- Add columns to installment_plans to support cancellation and package tracking
ALTER TABLE public.installment_plans 
ADD COLUMN IF NOT EXISTS package_type text,
ADD COLUMN IF NOT EXISTS selected_addons jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cancellation_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Add comment to explain the columns
COMMENT ON COLUMN public.installment_plans.package_type IS 'The base package type: 185 or 245';
COMMENT ON COLUMN public.installment_plans.selected_addons IS 'Array of selected add-on keys: Quad, Ski, Snowboard, Lessons';
COMMENT ON COLUMN public.installment_plans.cancellation_requested IS 'Whether the customer has requested cancellation';
COMMENT ON COLUMN public.installment_plans.cancelled_at IS 'Timestamp when cancellation was requested';