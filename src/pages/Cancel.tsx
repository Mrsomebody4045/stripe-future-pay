import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Cancel = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: {
          customer_name: name,
          customer_email: email,
        }
      });

      if (error) throw error;

      if (data?.error) {
        setError(data.error);
        return;
      }

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully. Future payments will not be charged.',
      });

      // Reset form
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Cancellation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cancel Your Booking</CardTitle>
          <CardDescription>
            Enter your details to cancel your booking and prevent future payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCancel} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Cancellations are not allowed on the due date (January 6th, 2026). 
                Your deposit is non-refundable. Only future scheduled payments will be cancelled.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="destructive" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Cancel Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cancel;
