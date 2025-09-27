-- Enable extensions properly (they will be in public schema by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to process scheduled payments every 10 minutes
SELECT cron.schedule(
  'process-scheduled-payments',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://pqzznpnbtlgmrlsmdhkv.supabase.co/functions/v1/process-scheduled-payments',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxenpucG5idGxnbXJsc21kaGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDM0NDksImV4cCI6MjA3NDM3OTQ0OX0.pWRnfEwJ0FhZhLU9JNQ1q5zYRJ3o8bx0Ij0tO_udlt0"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);