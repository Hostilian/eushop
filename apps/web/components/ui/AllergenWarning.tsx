import React from 'react';
import { getAllergenTranslation, type EUSingleMarketLanguage } from '@eushop/compliance';

interface AllergenWarningProps {
  allergens?: string[];
  locale?: EUSingleMarketLanguage;
  compact?: boolean;
}

export function AllergenWarning({ allergens = [], locale = 'en', compact = false }: AllergenWarningProps) {
  if (!allergens || allergens.length === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold rounded-lg">
        <span>✅</span>
        <span>No EU Annex II Allergens Contained</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1" data-testid="allergen-warning-compact">
        {allergens.map((allergen) => (
          <span
            key={allergen}
            className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[10px] font-bold rounded-md"
          >
            ⚠️ {getAllergenTranslation(allergen as any, locale)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl space-y-2"
      data-testid="allergen-warning-full"
    >
      <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200 text-xs uppercase tracking-wider">
        <span>⚠️ Statutory EU Food Allergen Warning (Reg. 1169/2011 Annex II)</span>
      </div>
      <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
        This product contains the following <strong>{allergens.length}</strong> mandatory regulated food allergen(s):
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {allergens.map((allergen) => (
          <span
            key={allergen}
            className="px-2.5 py-1 bg-rose-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
          >
            <span>•</span>
            <span>{getAllergenTranslation(allergen as any, locale)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
