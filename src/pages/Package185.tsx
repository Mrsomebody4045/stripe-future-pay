import { InstallmentPayment } from "@/components/InstallmentPayment";

const Package185 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 p-4">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Trakia Trips Booking - €195 Package
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure your trip with our flexible payment plan
          </p>
        </div>
        <InstallmentPayment 
          firstAmount={5800}
          secondAmount={14000}
          secondPaymentDate="2026-01-06T00:00:00Z"
          title="Deposit Due Today"
          description="Payment Schedule:\n• Today: €58.00\n• Admin Fee: €3.00 (included in today's total)\n• Remaining €140.00 charged automatically by 6 January 2026\n• Total: €198.00"
          packageType="185"
          selectedAddons={[]}
          adminFee={300}
        />
      </div>
    </div>
  );
};

export default Package185;
