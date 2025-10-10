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
    
    // Create variations where Ski2Day replaces Ski, Snowboard2Day replaces Snowboard
    const allBaseCombinations: string[] = [];
    
    baseCombinations.forEach(base => {
      const parts = base ? base.split('+') : [];
      const hasSki = parts.includes('Ski');
      const hasSnowboard = parts.includes('Snowboard');
      
      // Always add the base combination
      const baseCombo = base ? `${base}` : '';
      allBaseCombinations.push(baseCombo);
      
      // If has Ski, create a variant with Ski2Day replacing Ski
      if (hasSki) {
        const withSki2Day = parts.map(p => p === 'Ski' ? 'Ski2Day' : p).join('+');
        allBaseCombinations.push(withSki2Day);
      }
      
      // If has Snowboard, create a variant with Snowboard2Day replacing Snowboard
      if (hasSnowboard) {
        const withSnowboard2Day = parts.map(p => p === 'Snowboard' ? 'Snowboard2Day' : p).join('+');
        allBaseCombinations.push(withSnowboard2Day);
      }
      
      // If has both Ski and Snowboard, create a variant with both replaced
      if (hasSki && hasSnowboard) {
        const withBoth2Day = parts.map(p => {
          if (p === 'Ski') return 'Ski2Day';
          if (p === 'Snowboard') return 'Snowboard2Day';
          return p;
        }).join('+');
        allBaseCombinations.push(withBoth2Day);
      }
    });
    
    // Now generate all combinations with people counts (1 person = default, 2-15 people)
    const allCombinations: string[] = [];
    
    allBaseCombinations.forEach(combo => {
      // Default (1 person, no suffix)
      const defaultPath = combo ? `/${basePackage}+${combo}` : `/${basePackage}`;
      allCombinations.push(defaultPath);
      
      // 2-15 people variants
      for (let people = 2; people <= 15; people++) {
        const peoplePath = combo ? `/${basePackage}+${combo}*${people}` : `/${basePackage}*${people}`;
        allCombinations.push(peoplePath);
      }
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
