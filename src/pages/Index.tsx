import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const addons = ['Quad', 'Ski', 'Snowboard', 'Lessons'];
  const packages = ['185', '245'];
  
  const generateCombinations = (basePackage: string) => {
    const combinations: string[] = [`/${basePackage}`];
    
    // OLD COMBINATIONS - Multiple add-ons together
    // Single add-ons
    addons.forEach(addon => {
      combinations.push(`/${basePackage}+${addon}`);
    });
    
    // Two add-ons
    for (let i = 0; i < addons.length; i++) {
      for (let j = i + 1; j < addons.length; j++) {
        combinations.push(`/${basePackage}+${addons[i]}+${addons[j]}`);
      }
    }
    
    // Three add-ons
    for (let i = 0; i < addons.length; i++) {
      for (let j = i + 1; j < addons.length; j++) {
        for (let k = j + 1; k < addons.length; k++) {
          combinations.push(`/${basePackage}+${addons[i]}+${addons[j]}+${addons[k]}`);
        }
      }
    }
    
    // All four add-ons
    combinations.push(`/${basePackage}+${addons.join('+')}`);
    
    // NEW COMBINATIONS - Day/people-based add-ons
    // Ski Gear: 1-2 days
    for (let days = 1; days <= 2; days++) {
      const suffix = days === 1 ? 'day' : 'days';
      combinations.push(`/${basePackage}+SkiGear${days}${suffix}`);
    }
    
    // Snowboard Gear: 1-2 days
    for (let days = 1; days <= 2; days++) {
      const suffix = days === 1 ? 'day' : 'days';
      combinations.push(`/${basePackage}+SnowboardGear${days}${suffix}`);
    }
    
    // Lessons: 1-15 people
    for (let people = 1; people <= 15; people++) {
      const suffix = people === 1 ? 'person' : 'people';
      combinations.push(`/${basePackage}+Lessons${people}${suffix}`);
    }
    
    return combinations;
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
