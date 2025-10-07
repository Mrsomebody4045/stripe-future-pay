import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_name, customer_email } = await req.json();

    console.log('Processing cancellation request for:', customer_email);

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find the installment plan by email
    const { data: plans, error: planError } = await supabase
      .from('installment_plans')
      .select('*')
      .eq('customer_email', customer_email.toLowerCase().trim())
      .eq('status', 'pending');

    if (planError) {
      console.error('Error fetching plan:', planError);
      throw planError;
    }

    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active booking found for this email address' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Verify customer name matches (case-insensitive)
    const plan = plans.find(p => 
      p.customer_name?.toLowerCase().trim() === customer_name.toLowerCase().trim()
    );

    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Customer name does not match our records' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Check if due date has passed
    const { data: payments } = await supabase
      .from('installment_payments')
      .select('due_date, status')
      .eq('plan_id', plan.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: false });

    if (payments && payments.length > 0) {
      const nextPayment = payments[0];
      const dueDate = new Date(nextPayment.due_date);
      const today = new Date();
      
      // Check if today is the due date
      if (dueDate.toDateString() === today.toDateString()) {
        return new Response(
          JSON.stringify({ error: 'Cancellations are not allowed on the due date' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
    }

    // Update plan to mark as cancellation requested
    const { error: updatePlanError } = await supabase
      .from('installment_plans')
      .update({
        cancellation_requested: true,
        cancelled_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', plan.id);

    if (updatePlanError) {
      console.error('Error updating plan:', updatePlanError);
      throw updatePlanError;
    }

    // Cancel all pending payments for this plan
    const { error: updatePaymentsError } = await supabase
      .from('installment_payments')
      .update({ status: 'cancelled' })
      .eq('plan_id', plan.id)
      .eq('status', 'pending');

    if (updatePaymentsError) {
      console.error('Error updating payments:', updatePaymentsError);
      throw updatePaymentsError;
    }

    console.log('Booking cancelled successfully:', plan.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking cancelled successfully. Future payments will not be charged.',
        plan_id: plan.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
