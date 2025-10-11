import { useParams, Navigate } from 'react-router-dom';
import { InstallmentPayment } from "@/components/InstallmentPayment";

// Add-ons with fixed prices
const ADDONS = {
  'Quad': { name: 'Quad Bike Adventure', price: 5000 },
  'Ski': { name: 'Ski gear', price: 1650 },
  'Snowboard': { name: 'Snowboard gear', price: 2250 },
  'Lessons': { name: 'Lessons (2hr session)', price: 5000 },
  'Ski2Day': { name: 'Ski gear (2 days)', price: 3300 },
  'Snowboard2Day': { name: 'Snowboard gear (2 days)', price: 4500 },
} as const;

// Parse add-on from slug
const parseAddon = (addonStr: string) => {
  if (addonStr in ADDONS) {
    const addon = ADDONS[addonStr as keyof typeof ADDONS];
    return {
      key: addonStr,
      name: addon.name,
      price: addon.price,
    };
  }
  return null;
};

// Base package info
const PACKAGES = {
  '185': { 
    name: '€185 Package',
    deposit: 5000, // €50
    remaining: 13500, // €135
    total: 18500
  },
  '245': { 
    name: '€245 Package',
    deposit: 7500, // €75
    remaining: 17000, // €170
    total: 24500
  },
} as const;

const DynamicCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) return <Navigate to="/" />;

  // Parse the slug (e.g., "185+Quad+Ski" or "185+Quad+Ski*5")
  // Check for people count at the end (e.g., "*5")
  const peopleMatch = slug.match(/\*(\d+)$/);
  const numberOfPeople = peopleMatch ? parseInt(peopleMatch[1]) : 1;
  const slugWithoutPeople = peopleMatch ? slug.replace(/\*\d+$/, '') : slug;
  
  const parts = slugWithoutPeople.split('+');
  const basePackage = parts[0] as keyof typeof PACKAGES;
  const addonStrings = parts.slice(1);

  // Validate base package
  if (!PACKAGES[basePackage]) {
    return <Navigate to="/" />;
  }

  // Parse and validate addons (handles both legacy and new format)
  const selectedAddons = addonStrings
    .map(addonStr => parseAddon(addonStr))
    .filter((addon): addon is NonNullable<ReturnType<typeof parseAddon>> => addon !== null);

  // Calculate totals (admin fee is 300 cents = €3)
  const packageInfo = PACKAGES[basePackage];
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const adminFee = 300;
  
  // Multiply by number of people
  const depositTotal = (packageInfo.deposit + addonsTotal) * numberOfPeople + adminFee;
  const remainingTotal = packageInfo.remaining * numberOfPeople;

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
          <h2 className="text-2xl font-semibold text-muted-foreground">
            {basePackage === '185' ? '€185 Package' : '€245 Package'}
            {numberOfPeople > 1 && ` - ${numberOfPeople} People`}
          </h2>
          <div className="space-y-2">
            {selectedAddons.length > 0 && (
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Selected Add-ons:</h3>
                <ul className="space-y-1 text-sm">
                  {selectedAddons.map((addon) => (
                    <li key={addon.key} className="flex justify-between">
                      <span>{addon.name}</span>
                      <span className="font-medium">
                        €{(addon.price / 100).toFixed(2)}{numberOfPeople > 1 && ` × ${numberOfPeople}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xl font-semibold text-primary">
            Deposit Due Today: €{(depositTotal / 100).toFixed(2)}
          </p>
          <p className="text-lg text-muted-foreground">
            Secure your trip with our flexible payment plan
          </p>
        </div>
        <InstallmentPayment 
          firstAmount={depositTotal}
          secondAmount={remainingTotal}
          secondPaymentDate="2026-01-06T00:00:00Z"
          title={`Deposit Due Today`}
          description={`Payment Schedule:\n• Today: €${(depositTotal / 100).toFixed(2)}\n• Admin Fee: €3.00 (included in today's total)\n• Remaining €${(remainingTotal / 100).toFixed(2)} charged automatically by 6 January 2026\n• Total: €${((depositTotal + remainingTotal) / 100).toFixed(2)}`}
          packageType={basePackage}
          selectedAddons={addonStrings}
          adminFee={adminFee}
        />
      </div>
    </div>
  );
};

export default DynamicCheckout;
