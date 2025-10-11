import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";

export default function Success() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');
  const secondAmount = searchParams.get('secondAmount');
  const date = searchParams.get('date');
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-base">
            Your booking has been confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Payment Details</h3>
            {amount && (
              <p className="text-sm">
                • Today's Payment: <span className="font-medium">€{amount}</span>
              </p>
            )}
            {secondAmount && date && (
              <p className="text-sm">
                • Next Payment: <span className="font-medium">€{secondAmount}</span> on{' '}
                {new Date(date).toLocaleDateString('en-GB', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
            {email && (
              <p className="text-sm text-muted-foreground mt-3">
                A confirmation email has been sent to <span className="font-medium">{email}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>✓ Your second payment will be automatically charged on the scheduled date</li>
              <li>✓ Contact us if you need to make any changes</li>
            </ul>
          </div>

          <a href="https://www.trakiatrips.com" className="block">
            <Button variant="outline" className="w-full">
              Return
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
