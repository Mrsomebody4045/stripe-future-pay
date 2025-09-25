-- Create installment payments table
CREATE TABLE public.installment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  total_amount INTEGER NOT NULL, -- amount in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create individual payments table
CREATE TABLE public.installment_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.installment_plans(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- amount in cents
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  stripe_payment_intent_id TEXT,
  payment_method_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for customers)
CREATE POLICY "Anyone can create installment plans" 
ON public.installment_plans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view installment plans" 
ON public.installment_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update installment plans" 
ON public.installment_plans 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can create installment payments" 
ON public.installment_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view installment payments" 
ON public.installment_payments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update installment payments" 
ON public.installment_payments 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_installment_plans_updated_at
  BEFORE UPDATE ON public.installment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_installment_payments_updated_at
  BEFORE UPDATE ON public.installment_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();