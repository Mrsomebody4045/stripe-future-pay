import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const addons = ['Quad', 'Ski', 'Snowboard', 'Lessons'];
  const dayVariations = ['', 'Ski2Day', 'Snowboard2Day', 'Ski2Day+Snowboard2Day'];
  const packages = ['185', '245'];
  
  const generateCombinations = (basePackage: string) => {
    const baseCombinations: string[] = [];
    
    // Generate all 16 base combinations (2^4 = 16)
    // Empty combination (base package only)
    baseCombinations.push('');
    
    // Single add-ons
    addons.forEach(addon => {
      baseCombinations.push(addon);
    });
    
    // Two add-ons
    for (let i = 0; i < addons.length; i++) {
      for (let j = i + 1; j < addons.length; j++) {
        baseCombinations.push(`${addons[i]}+${addons[j]}`);
      }
    }
    
    // Three add-ons
    for (let i = 0; i < addons.length; i++) {
      for (let j = i + 1; j < addons.length; j++) {
        for (let k = j + 1; k < addons.length; k++) {
          baseCombinations.push(`${addons[i]}+${addons[j]}+${addons[k]}`);
        }
      }
    }
    
    // All four add-ons
    baseCombinations.push(addons.join('+'));
    
    // Now create all 64 combinations (16 base × 4 day variations)
    const allCombinations: string[] = [];
    
    baseCombinations.forEach(base => {
      dayVariations.forEach(dayVar => {
        const parts = [base, dayVar].filter(p => p !== '');
        const combo = parts.length > 0 ? `/${basePackage}+${parts.join('+')}` : `/${basePackage}`;
        allCombinations.push(combo);
      });
    });
    
    return allCombinations;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Trakia Trips - All Checkout Pages
          </h1>
          <p className="text-xl text-muted-foreground">
            Click any link below to view the checkout page for that package combination
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {packages.map(pkg => {
            const combinations = generateCombinations(pkg);
            return (
              <Card key={pkg}>
                <CardHeader>
                  <CardTitle>€{pkg} Package</CardTitle>
                  <CardDescription>
                    {combinations.length} checkout combinations available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {combinations.map(combo => (
                      <Link
                        key={combo}
                        to={combo}
                        className="block p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <code className="text-sm">{combo}</code>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
