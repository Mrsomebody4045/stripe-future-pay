import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    console.log('Processing scheduled payments...');

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get due payments
    const { data: duePayments, error: fetchError } = await supabase
      .from('installment_payments')
      .select(`
        *,
        installment_plans (
          stripe_customer_id,
          customer_email
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching due payments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${duePayments?.length || 0} due payments`);

    for (const payment of duePayments || []) {
      try {
        console.log(`Processing payment ${payment.id} for ${payment.amount} cents`);

        // Get customer's saved payment methods
        const paymentMethods = await stripe.paymentMethods.list({
          customer: payment.installment_plans.stripe_customer_id,
          type: 'card',
        });

        if (paymentMethods.data.length === 0) {
          console.log(`No payment methods found for customer ${payment.installment_plans.stripe_customer_id}`);
          continue;
        }

        // Use the first available payment method
        const paymentMethod = paymentMethods.data[0];

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: payment.amount,
          currency: 'eur',
          customer: payment.installment_plans.stripe_customer_id,
          payment_method: paymentMethod.id,
          confirmation_method: 'automatic',
          confirm: true,
          off_session: true, // This indicates it's for a saved payment method
          metadata: {
            plan_id: payment.plan_id,
            payment_id: payment.id,
            payment_type: 'scheduled_installment'
          }
        });

        console.log(`Payment intent created: ${paymentIntent.id}, status: ${paymentIntent.status}`);

        // Update payment record
        const { error: updateError } = await supabase
          .from('installment_payments')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            payment_method_id: paymentMethod.id,
            status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
            paid_at: paymentIntent.status === 'succeeded' ? new Date().toISOString() : null
          })
          .eq('id', payment.id);

        if (updateError) {
          console.error('Error updating payment:', updateError);
        }

        // If all payments for this plan are completed, update plan status
        if (paymentIntent.status === 'succeeded') {
          const { data: allPayments } = await supabase
            .from('installment_payments')
            .select('status')
            .eq('plan_id', payment.plan_id);

          const allSucceeded = allPayments?.every(p => p.status === 'succeeded');
          
          if (allSucceeded) {
            await supabase
              .from('installment_plans')
              .update({ status: 'completed' })
              .eq('id', payment.plan_id);
            
            console.log(`Plan ${payment.plan_id} completed`);
          }
        }

      } catch (paymentError) {
        console.error(`Error processing payment ${payment.id}:`, paymentError);
        
        // Update payment as failed
        await supabase
          .from('installment_payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Scheduled payments processed',
        processed: duePayments?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});