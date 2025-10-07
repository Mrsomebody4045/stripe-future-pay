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
          firstAmount={7800}
          secondAmount={17100}
          secondPaymentDate="2026-01-06T00:00:00Z"
          title="€75 Deposit"
          description="Pay €78 deposit now (includes €3 admin fee), €171 Charged Automatically January 6th"
          packageType="245"
          selectedAddons={[]}
          adminFee={300}
        />
      </div>
    </div>
  );
};

export default Package245;
