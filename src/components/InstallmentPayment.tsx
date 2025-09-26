import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51S1VA0Lb8rPy9vMDTL2NCdvJKu0zLJc88gOhfXQiNtlKXX2Shz0BAGnLK2fw4D1BKWNJfyKHZgmdSXZOkb7aEHnT00xVNJGGqW');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const triggerPaymentNow = async () => {
    setProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-payment-now', {
        body: {}
      });
      
      if (error) throw error;
      
      toast({
        title: "Payment Processed!",
        description: "The remaining €7 payment has been charged successfully.",
      });
    } catch (error) {
      console.error('Payment trigger failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

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

      const { client_secret, setup_intent_client_secret } = data;

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

      toast({
        title: "Payment Successful!",
        description: "First payment of €3 completed. Next payment of €7 will be automatically charged on September 26, 2025.",
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
          Pay €3 now, then €7 automatically on September 26, 2025
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

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment Schedule:</h4>
            <ul className="text-sm space-y-1">
              <li>• Today: €3.00</li>
              <li>• September 26, 2025: €7.00</li>
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
          
          <div className="pt-4 border-t">
            <Button 
              type="button"
              variant="outline"
              className="w-full" 
              onClick={triggerPaymentNow}
              disabled={processingPayment}
            >
              {processingPayment ? 'Processing €7 Payment...' : 'Process Remaining €7 Now'}
            </Button>
          </div>
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