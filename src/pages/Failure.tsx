import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

export default function Failure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error') || 'An unexpected error occurred';
  const returnUrl = searchParams.get('return') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription className="text-base">
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-destructive/10 p-4 rounded-lg">
            <h3 className="font-semibold text-destructive mb-2">Error Details</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">What You Can Do</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Check your card details and try again</li>
              <li>• Ensure you have sufficient funds</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
              <li>• Contact our support team for assistance</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <a href="https://www.trakiatrips.com" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Back
              </Button>
            </a>
            <Link to={returnUrl} className="flex-1">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
