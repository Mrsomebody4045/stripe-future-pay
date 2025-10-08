-- Enable RLS on guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert guests
CREATE POLICY "Anyone can insert guests"
ON public.guests
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view guests
CREATE POLICY "Anyone can view guests"
ON public.guests
FOR SELECT
USING (true);

-- Allow anyone to update guests
CREATE POLICY "Anyone can update guests"
ON public.guests
FOR UPDATE
USING (true);