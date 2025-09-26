-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the process-scheduled-payments function to run daily at midnight UTC
SELECT cron.schedule(
  'process-scheduled-payments',
  '0 0 * * *', -- Run daily at midnight UTC
  $$
  SELECT net.http_post(
    url := 'https://pqzznpnbtlgmrlsmdhkv.supabase.co/functions/v1/process-scheduled-payments',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxenpucG5idGxnbXJsc21kaGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDM0NDksImV4cCI6MjA3NDM3OTQ0OX0.pWRnfEwJ0FhZhLU9JNQ1q5zYRJ3o8bx0Ij0tO_udlt0"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);