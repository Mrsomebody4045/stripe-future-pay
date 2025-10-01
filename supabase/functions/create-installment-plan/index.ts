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
    const { customer_name, customer_email } = await req.json();

    console.log('Creating installment plan for:', customer_email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: customer_email,
      name: customer_name,
    });

    console.log('Created Stripe customer:', customer.id);

    // Create payment method setup for future payments
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    // Create installment plan in database
    const { data: plan, error: planError } = await supabase
      .from('installment_plans')
      .insert({
        customer_email,
        customer_name,
        total_amount: 1000, // €10 total (3 + 7)
        currency: 'eur',
        stripe_customer_id: customer.id,
        status: 'pending'
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating plan:', planError);
      throw planError;
    }

    console.log('Created installment plan:', plan.id);

    // Create the two payments
    const payments = [
      {
        plan_id: plan.id,
        amount: 300, // €3 in cents
        due_date: new Date().toISOString(), // Pay now
      },
      {
        plan_id: plan.id,
        amount: 700, // €7 in cents
        due_date: new Date('2025-10-02').toISOString(), // Oct 2, 2025
      }
    ];

    const { error: paymentsError } = await supabase
      .from('installment_payments')
      .insert(payments);

    if (paymentsError) {
      console.error('Error creating payments:', paymentsError);
      throw paymentsError;
    }

    console.log('Created installment payments');

    // Create immediate payment intent for first payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 300, // €3
      currency: 'eur',
      customer: customer.id,
      setup_future_usage: 'off_session',
      metadata: {
        plan_id: plan.id,
        payment_type: 'first_installment'
      }
    });

    console.log('Created payment intent:', paymentIntent.id);

    return new Response(
      JSON.stringify({
        plan_id: plan.id,
        client_secret: paymentIntent.client_secret,
        setup_intent_client_secret: setupIntent.client_secret,
        customer_id: customer.id
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
        status: 400,
      }
    );
  }
});