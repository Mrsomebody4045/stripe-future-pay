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
    const { customer_name, customer_email, customer_phone, first_amount, second_amount, second_payment_date, package_type, selected_addons } = await req.json();

    console.log('Creating installment plan for:', customer_email);

    // Generate idempotency key to prevent duplicate charges
    const idempotencyKey = `${customer_email}-${Date.now()}`;

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
        customer_phone: customer_phone || null,
        total_amount: first_amount + second_amount,
        currency: 'eur',
        stripe_customer_id: customer.id,
        status: 'pending',
        package_type: package_type || null,
        selected_addons: selected_addons || []
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating plan:', planError);
      throw planError;
    }

    console.log('Created installment plan:', plan.id);

    // Create immediate payment intent for first payment with idempotency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: first_amount,
      currency: 'eur',
      customer: customer.id,
      setup_future_usage: 'off_session',
      metadata: {
        plan_id: plan.id,
        payment_type: 'first_installment',
        customer_email: customer_email
      }
    }, {
      idempotencyKey: `payment-${idempotencyKey}`
    });

    console.log('Created payment intent:', paymentIntent.id);

    // Create the two payment records
    const { data: firstPayment, error: firstPaymentError } = await supabase
      .from('installment_payments')
      .insert({
        plan_id: plan.id,
        amount: first_amount,
        due_date: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id, // Link to payment intent
        status: 'pending' // Will be updated to succeeded after payment confirmation
      })
      .select()
      .single();

    if (firstPaymentError) {
      console.error('Error creating first payment:', firstPaymentError);
      throw firstPaymentError;
    }

    const { error: secondPaymentError } = await supabase
      .from('installment_payments')
      .insert({
        plan_id: plan.id,
        amount: second_amount,
        due_date: second_payment_date,
        status: 'pending'
      });

    if (secondPaymentError) {
      console.error('Error creating second payment:', secondPaymentError);
      throw secondPaymentError;
    }

    console.log('Created installment payments');

    return new Response(
      JSON.stringify({
        plan_id: plan.id,
        first_payment_id: firstPayment.id,
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