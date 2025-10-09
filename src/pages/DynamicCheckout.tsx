import { useParams, Navigate } from 'react-router-dom';
import { InstallmentPayment } from "@/components/InstallmentPayment";

// Add-on pricing configuration
const ADDON_PRICING = {
  'SkiGear': { name: 'Ski Gear', pricePerUnit: 1650, unit: 'day', minUnits: 1, maxUnits: 2 },
  'SnowboardGear': { name: 'Snowboard Gear', pricePerUnit: 2250, unit: 'day', minUnits: 1, maxUnits: 2 },
  'Lessons': { name: 'Lessons (2hr session)', pricePerUnit: 5000, unit: 'person', minUnits: 1, maxUnits: 15 },
  'Quad': { name: 'Quad Bike Adventure', pricePerUnit: 5000, unit: 'item', minUnits: 1, maxUnits: 1 },
} as const;

// Parse add-on from slug (e.g., "SkiGear1day", "Lessons5people", "Quad")
const parseAddon = (addonStr: string) => {
  // Try to match pattern: AddonName + Number + Unit (e.g., "SkiGear1day", "Lessons5people")
  const match = addonStr.match(/^([A-Za-z]+)(\d+)(day|days|person|people)$/);
  
  if (match) {
    const [, addonType, quantity] = match;
    return { addonType, quantity: parseInt(quantity) };
  }
  
  // Check if it's a legacy addon (Quad, Ski, Snowboard, Lessons without quantity)
  if (addonStr === 'Quad') {
    return { addonType: 'Quad', quantity: 1 };
  }
  
  return null;
};

// Base package info
const PACKAGES = {
  '185': { 
    name: '€185 Package',
    deposit: 5000, // €50
    remaining: 12900, // €129
    total: 18500
  },
  '245': { 
    name: '€245 Package',
    deposit: 7500, // €75
    remaining: 17100, // €171
    total: 24500
  },
} as const;

const DynamicCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) return <Navigate to="/" />;

  // Parse the slug (e.g., "185+SkiGear1day+Lessons5people" or "245")
  const parts = slug.split('+');
  const basePackage = parts[0] as keyof typeof PACKAGES;
  const addonStrings = parts.slice(1);

  // Validate base package
  if (!PACKAGES[basePackage]) {
    return <Navigate to="/" />;
  }

  // Parse and validate addons
  const selectedAddons = addonStrings
    .map(addonStr => {
      const parsed = parseAddon(addonStr);
      if (!parsed || !(parsed.addonType in ADDON_PRICING)) return null;
      
      const config = ADDON_PRICING[parsed.addonType as keyof typeof ADDON_PRICING];
      const { quantity, addonType } = parsed;
      
      // Validate quantity is within limits
      if (quantity < config.minUnits || quantity > config.maxUnits) return null;
      
      const price = config.pricePerUnit * quantity;
      const displayName = quantity === 1 
        ? `${config.name} (${quantity} ${config.unit})`
        : `${config.name} (${quantity} ${config.unit}s)`;
      
      return {
        key: addonStr,
        name: displayName,
        price,
        addonType,
        quantity
      };
    })
    .filter((addon): addon is NonNullable<typeof addon> => addon !== null);

  // Calculate totals (admin fee is 300 cents = €3)
  const packageInfo = PACKAGES[basePackage];
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const adminFee = 300;
  const depositTotal = packageInfo.deposit + addonsTotal + adminFee;
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
          <h2 className="text-2xl font-semibold text-muted-foreground">
            {basePackage === '185' ? '€185 Package' : '€245 Package'}
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
          title={`€${packageInfo.deposit / 100} Deposit${selectedAddons.length > 0 ? ' + Add-ons' : ''}`}
          description={`Pay €${(depositTotal / 100).toFixed(2)} now, €${(remainingTotal / 100).toFixed(2)} Charged Automatically January 6th`}
          packageType={basePackage}
          selectedAddons={addonStrings}
          adminFee={adminFee}
        />
      </div>
    </div>
  );
};

export default DynamicCheckout;
