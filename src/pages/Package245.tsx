import { InstallmentPayment } from "@/components/InstallmentPayment";

const Package245 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 p-4">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Trakia Trips Booking - €245 Package
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure your trip with our flexible payment plan
          </p>
        </div>
        <InstallmentPayment 
          firstAmount={7400}
          secondAmount={17100}
          secondPaymentDate="2026-01-06T00:00:00Z"
          title="€245 Package Payment"
          description="Pay €74 deposit now, €171 due by January 6th"
        />
      </div>
    </div>
  );
};

export default Package245;
