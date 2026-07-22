import { useState, useCallback } from 'react';
import { FoodItem } from '../../data/demo-products';
import { clsx } from 'clsx';

// List of EU member states (as of 2026)
const EU_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
] as const;

interface OriginFilterProps {
  products: FoodItem[];
  selectedOrigins: string[]; // array of country codes
  onSelectOrigin: (selected: string[]) => void;
}

export default function OriginFilter({ selectedOrigins, onSelectOrigin }: OriginFilterProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Helper to get country flag emoji
  const getCountryFlag = (isoCode: string): string => {
    const EU_FLAGS: Record<string, string> = {
      AT: '🇦🇹', BE: '🇧🇪', BG: '🇧🇬', HR: '🇭🇷', CY: '🇨🇾', CZ: '🇨🇿',
      DK: '🇩🇰', EE: '🇪🇪', FI: '🇫🇮', FR: '🇫🇷', DE: '🇩🇪', GR: '🇬🇷',
      HU: '🇭🇺', IE: '🇮🇪', IT: '🇮🇹', LV: '🇱🇻', LT: '🇱🇹', LU: '🇱🇺',
      MT: '🇲🇹', NL: '🇳🇱', PL: '🇵🇱', PT: '🇵🇹', RO: '🇷🇴', SK: '🇸🇰',
      SI: '🇸🇮', ES: '🇪🇸', SE: '🇸🇪',
    };
    return EU_FLAGS[isoCode.toUpperCase()] ?? '🇪🇺';
  };

  // Handler to toggle a country
  const toggleOrigin = useCallback((countryCode: string) => {
    const isSelected = selectedOrigins.includes(countryCode);
    let newSelection: string[];
    if (isSelected) {
      newSelection = selectedOrigins.filter(c => c !== countryCode);
    } else {
      newSelection = [...selectedOrigins, countryCode];
    }
    onSelectOrigin(newSelection);
  }, [selectedOrigins, onSelectOrigin]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold text-brand-dark dark:text-white flex items-center gap-2">
          <span aria-hidden="true">🌍</span>
          Origin Filter
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Filter products by their country of origin. Select one or more countries.
        </p>
      </div>

      {/* Origin selection buttons */}
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {EU_COUNTRIES.map(({ code, name }) => {
            const isSelected = selectedOrigins.includes(code);
            const flag = getCountryFlag(code);

            return (
              <div
                key={code}
                onMouseEnter={() => setShowTooltip(code)}
                onMouseLeave={() => setShowTooltip(null)}
                className="group"
              >
                <button
                  onClick={() => toggleOrigin(code)}
                  className={[
                    'w-full flex flex-col items-center justify-center gap-1 p-3 text-center',
                    'border rounded-xl transition-all duration-200 hover:shadow-md',
                    isSelected
                      ? 'bg-brand-dark/10 border-brand-dark/20 text-brand-dark hover:bg-brand-dark/20'
                      : 'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'
                  ].join(' ')}
                  aria-pressed={isSelected}
                >
                  <div className="text-2xl">{flag}</div>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {name}
                  </span>
                </button>

                {/* Tooltip */}
                {showTooltip === code && (
                  <div className={[
                    'absolute left-0 top-full mt-2 w-48 p-3 rounded-xl shadow-lg',
                    'bg-gray-900 text-white text-xs',
                    'z-50 max-w-xs whitespace-normal'
                  ].join(' ')}>
                    <div className="flex items-start gap-2">
                      <span aria-hidden="true">🌍</span>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="mt-1">Country code: {code}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear button */}
        {selectedOrigins.length > 0 && (
          <button
            onClick={() => onSelectOrigin([])}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
            variant="secondary"
            size="sm"
          >
            <span aria-hidden="true">🗑️</span>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}