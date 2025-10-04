import { useParams, Navigate } from 'react-router-dom';
import { InstallmentPayment } from "@/components/InstallmentPayment";

// Add-on pricing (all in cents)
const ADDONS = {
  'Quad': { name: 'Quad Bike Adventure', price: 5000 },
  'Ski': { name: 'Ski gear', price: 1650 },
  'Snowboard': { name: 'Snowboard gear', price: 2250 },
  'Lessons': { name: 'Lessons (2hr session)', price: 5000 },
} as const;

// Base package info
const PACKAGES = {
  '185': { 
    name: '€185 Package',
    deposit: 5600, // €56
    remaining: 12900, // €129
    total: 18500
  },
  '245': { 
    name: '€245 Package',
    deposit: 7400, // €74
    remaining: 17100, // €171
    total: 24500
  },
} as const;

const DynamicCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) return <Navigate to="/" />;

  // Parse the slug (e.g., "185+Quad+Ski" or "245")
  const parts = slug.split('+');
  const basePackage = parts[0] as keyof typeof PACKAGES;
  const addonKeys = parts.slice(1);

  // Validate base package
  if (!PACKAGES[basePackage]) {
    return <Navigate to="/" />;
  }

  // Validate and filter addons
  const selectedAddons = addonKeys
    .filter(key => key in ADDONS)
    .map(key => ({
      key,
      ...ADDONS[key as keyof typeof ADDONS]
    }));

  // Calculate totals
  const packageInfo = PACKAGES[basePackage];
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const depositTotal = packageInfo.deposit + addonsTotal;
  const remainingTotal = packageInfo.remaining;

  // Build description
  const addonsList = selectedAddons.length > 0 
    ? selectedAddons.map(a => a.name).join(', ')
    : 'No add-ons';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 p-4">
      <div className="space-y-8 w-full max-w-2xl">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Trakia Trips Booking
          </h1>
          <div className="space-y-2">
            <p className="text-2xl font-semibold">{packageInfo.name}</p>
            {selectedAddons.length > 0 && (
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Selected Add-ons:</h3>
                <ul className="space-y-1 text-sm">
                  {selectedAddons.map((addon) => (
                    <li key={addon.key} className="flex justify-between">
                      <span>{addon.name}</span>
                      <span className="font-medium">
                        €{(addon.price / 100).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xl text-muted-foreground">
            Secure your trip with our flexible payment plan
          </p>
        </div>
        <InstallmentPayment 
          firstAmount={depositTotal}
          secondAmount={remainingTotal}
          secondPaymentDate="2026-01-06T00:00:00Z"
          title={`${packageInfo.name} ${selectedAddons.length > 0 ? '+ Add-ons' : ''}`}
          description={`Pay €${(depositTotal / 100).toFixed(2)} deposit now (includes ${addonsList}), €${(remainingTotal / 100).toFixed(2)} due by January 6th`}
        />
      </div>
    </div>
  );
};

export default DynamicCheckout;
