import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Triggering specific €7 payment...');

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the specific €7 pending payment
    const { data: payment, error: fetchError } = await supabase
      .from('installment_payments')
      .select(`
        *,
        installment_plans (
          stripe_customer_id,
          customer_email
        )
      `)
      .eq('amount', 700)
      .eq('status', 'pending')
      .single();

    if (fetchError || !payment) {
      throw new Error('No pending €7 payment found');
    }

    console.log(`Processing €7 payment ${payment.id} for customer ${payment.installment_plans.stripe_customer_id}`);

    // Get customer's saved payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: payment.installment_plans.stripe_customer_id,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      throw new Error('No payment methods found for customer');
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
      off_session: true,
      metadata: {
        plan_id: payment.plan_id,
        payment_id: payment.id,
        payment_type: 'manual_trigger'
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
      throw updateError;
    }

    // If payment succeeded, check if all payments for this plan are completed
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

    return new Response(
      JSON.stringify({ 
        message: 'Payment processed successfully',
        amount: payment.amount,
        status: paymentIntent.status
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