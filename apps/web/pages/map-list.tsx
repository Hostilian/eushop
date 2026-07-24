import React from 'react';

export interface RegionalFoodItem {
  id: string;
  name: string;
  category: string;
  countryIso2: string;
  region: string;
  qualityScheme?: 'PDO' | 'PGI' | 'TSG';
  sellerOfferCount: number;
}

const SAMPLE_FOODS: RegionalFoodItem[] = [
  { id: '1', name: 'Parmigiano Reggiano 24-Month', category: 'Cheese', countryIso2: 'IT', region: 'Emilia-Romagna', qualityScheme: 'PDO', sellerOfferCount: 4 },
  { id: '2', name: 'Queijo Serra da Estrela', category: 'Cheese', countryIso2: 'PT', region: 'Serra da Estrela', qualityScheme: 'PDO', sellerOfferCount: 2 },
  { id: '3', name: 'Kalamata PDO Extra Virgin Olive Oil', category: 'Oil', countryIso2: 'GR', region: 'Peloponnese', qualityScheme: 'PDO', sellerOfferCount: 5 },
  { id: '4', name: 'Turrón de Jijona', category: 'Confectionery', countryIso2: 'ES', region: 'Valencia', qualityScheme: 'PGI', sellerOfferCount: 3 },
];

export default function LivingMapListFallback() {
  return (
    <main className="min-h-screen bg-background text-text p-6 max-w-5xl mx-auto">
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Living Map of European Food — Accessible Directory</h1>
        <p className="text-text-secondary text-sm">
          Accessible, screen-reader friendly directory of regional specialty foods across Europe.
          This view provides full feature parity with the interactive spatial map.
        </p>
      </header>

      <section aria-labelledby="region-list-heading">
        <h2 id="region-list-heading" className="text-xl font-semibold mb-4">Regional Specialty Foods</h2>
        
        <ul className="space-y-4" role="list">
          {SAMPLE_FOODS.map((food) => (
            <li
              key={food.id}
              className="p-4 rounded-lg border border-border bg-surface hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{food.name}</span>
                    {food.qualityScheme && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">
                        {food.qualityScheme}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {food.category} • {food.region}, {food.countryIso2}
                  </p>
                </div>

                <a
                  href={`/food/${food.id}`}
                  className="px-3 py-1.5 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-ring"
                >
                  View Offers ({food.sellerOfferCount})
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
