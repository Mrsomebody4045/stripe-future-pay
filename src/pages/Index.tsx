import { InstallmentPayment } from "@/components/InstallmentPayment";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Trakia Trips Booking
          </h1>
          <p className="text-xl text-gray-600">
            Secure your trip with our flexible payment plan
          </p>
        </div>
        <InstallmentPayment />
      </div>
    </div>
  );
};

export default Index;
