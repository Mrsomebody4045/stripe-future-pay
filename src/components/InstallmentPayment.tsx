import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_live_51S1VA0Lb8rPy9vMDy4jdzYaXKxvd5NawJ3GsGRUnMnKGLgSIj0GsqJ1bVidhzQXq7WbLo2JD88HsMivfOZ9ddXyU00uI1Zy6t3');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Set up Apple Pay / Google Pay
  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'IE',
        currency: 'eur',
        total: {
          label: 'First Installment Payment',
          amount: 300, // €3 in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check if Apple Pay / Google Pay is available
      pr.canMakePayment().then(result => {
        console.log('Payment Request canMakePayment result:', result);
        if (result) {
          console.log('Apple Pay/Google Pay is available');
          setPaymentRequest(pr);
          setCanMakePayment(true);
        } else {
          console.log('Apple Pay/Google Pay is not available');
        }
      }).catch(error => {
        console.error('Error checking payment request availability:', error);
      });

      pr.on('paymentmethod', async (event) => {
        try {
          // Validate required fields
          if (!event.payerName || !event.payerEmail) {
            event.complete('fail');
            toast({
              title: "Error",
              description: "Name and email are required for installment payments",
              variant: "destructive",
            });
            return;
          }

          // Create installment plan
          const { data, error } = await supabase.functions.invoke('create-installment-plan', {
            body: {
              customer_name: event.payerName,
              customer_email: event.payerEmail,
            },
          });

      if (error) throw error;

      const { client_secret, setup_intent_client_secret, first_payment_id } = data;

      // Set up the payment method for future use
      const setupResult = await stripe.confirmCardSetup(setup_intent_client_secret, {
        payment_method: event.paymentMethod.id,
      });

      if (setupResult.error) {
        throw new Error(setupResult.error.message);
      }

      // Confirm the immediate payment
      const paymentResult = await stripe.confirmCardPayment(client_secret, {
        payment_method: event.paymentMethod.id,
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      // Update first payment record to succeeded
      const { error: updateError } = await supabase
        .from('installment_payments')
        .update({
          status: 'succeeded',
          paid_at: new Date().toISOString(),
          payment_method_id: event.paymentMethod.id
        })
        .eq('id', first_payment_id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
      }

      event.complete('success');
          toast({
            title: "Payment Successful!",
            description: "First payment of €3 completed. Next payment of €7 will be automatically charged on October 2nd, 2025.",
          });

          // Reset form
          setCustomerName('');
          setCustomerEmail('');

        } catch (error) {
          console.error('Payment failed:', error);
          event.complete('fail');
          toast({
            title: "Payment Failed",
            description: error instanceof Error ? error.message : "An error occurred",
            variant: "destructive",
          });
        }
      });
    }
  }, [stripe, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !customerName || !customerEmail) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create installment plan
      const { data, error } = await supabase.functions.invoke('create-installment-plan', {
        body: {
          customer_name: customerName,
          customer_email: customerEmail,
        },
      });

      if (error) throw error;

      const { client_secret, setup_intent_client_secret, first_payment_id } = data;

      // Confirm the payment for first installment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // First, set up the payment method for future use
      const setupResult = await stripe.confirmCardSetup(setup_intent_client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      });

      if (setupResult.error) {
        throw new Error(setupResult.error.message);
      }

      // Then confirm the immediate payment
      const paymentResult = await stripe.confirmCardPayment(client_secret, {
        payment_method: setupResult.setupIntent.payment_method as string,
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      // Update first payment record to succeeded
      const { error: updateError } = await supabase
        .from('installment_payments')
        .update({
          status: 'succeeded',
          paid_at: new Date().toISOString(),
          payment_method_id: setupResult.setupIntent.payment_method as string
        })
        .eq('id', first_payment_id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
      }

      toast({
        title: "Payment Successful!",
        description: "First payment of €3 completed. Next payment of €7 will be automatically charged on October 2nd, 2025.",
      });

      // Reset form
      setCustomerName('');
      setCustomerEmail('');

    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Installment Payment</CardTitle>
        <CardDescription>
          Pay €3 now, then €7 automatically on October 2nd, 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Card Information</Label>
            <div className="p-3 border rounded-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: 'hsl(var(--foreground))',
                      '::placeholder': {
                        color: 'hsl(var(--muted-foreground))',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {canMakePayment && paymentRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quick Payment</Label>
                <div className="border rounded-md p-3">
                  <PaymentRequestButtonElement
                    options={{
                      paymentRequest,
                      style: {
                        paymentRequestButton: {
                          type: 'default',
                          theme: 'dark',
                          height: '40px',
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or pay with card</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment Schedule:</h4>
            <ul className="text-sm space-y-1">
              <li>• Today: €3.00</li>
              <li>• October 2nd, 2025: €7.00</li>
              <li className="font-medium">• Total: €10.00</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || loading}
          >
            {loading ? 'Processing...' : 'Pay €3 Now'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const InstallmentPayment = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};