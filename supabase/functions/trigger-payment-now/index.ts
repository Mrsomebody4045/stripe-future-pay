import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update the €7 payment due date to now so it gets processed
    const { data: updatedPayment, error: updateError } = await supabase
      .from('installment_payments')
      .update({ due_date: new Date().toISOString() })
      .eq('amount', 700)
      .eq('status', 'pending')
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('Updated payment due date:', updatedPayment);

    // Now call the process-scheduled-payments function
    const { data: processResult, error: processError } = await supabase.functions.invoke(
      'process-scheduled-payments',
      { body: {} }
    );

    if (processError) {
      throw processError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Payment triggered successfully',
        processResult 
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