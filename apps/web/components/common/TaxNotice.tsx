import React from 'react';
import { EU_FOOD_VAT_RATES, OSS_THRESHOLD_EUR } from '@eushop/compliance';

interface TaxNoticeProps {
  destinationCountryIso2?: string;
  subtotalEur?: number;
  compact?: boolean;
}

const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
  CZ: 'Czech Republic', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
  DE: 'Germany', GR: 'Greece', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
  LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia',
  ES: 'Spain', SE: 'Sweden',
};

export function TaxNotice({ destinationCountryIso2 = 'DE', subtotalEur = 0, compact = false }: TaxNoticeProps) {
  const vatRate = EU_FOOD_VAT_RATES[destinationCountryIso2.toUpperCase()] ?? 0.19;
  const vatPercentage = Math.round(vatRate * 100);
  const countryName = COUNTRY_NAMES[destinationCountryIso2.toUpperCase()] || destinationCountryIso2;
  const estimatedVat = Math.round(subtotalEur * vatRate * 100) / 100;

  if (compact) {
    return (
      <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1" data-testid="tax-notice-compact">
        <span>🇪🇺</span>
        <span>Includes {vatPercentage}% reduced VAT ({countryName} OSS rate: €{estimatedVat.toFixed(2)})</span>
      </span>
    );
  }

  return (
    <div
      className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs space-y-1.5"
      data-testid="tax-notice-full"
    >
      <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
        <span className="flex items-center gap-1.5">
          <span>🇪🇺</span>
          <span>EU OSS Destination Tax Calculation</span>
        </span>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-[10px]">
          {vatPercentage}% VAT ({destinationCountryIso2.toUpperCase()})
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
        Under EU Directive 2006/112/EC (One-Stop-Shop scheme, threshold €{OSS_THRESHOLD_EUR.toLocaleString()} EUR), destination VAT is calculated at <strong>{vatPercentage}%</strong> for delivery to <strong>{countryName}</strong>.
      </p>
      {subtotalEur > 0 && (
        <div className="flex justify-between pt-1 border-t border-blue-200/50 dark:border-blue-800/50 text-[11px] font-medium text-blue-800 dark:text-blue-300">
          <span>Estimated VAT amount:</span>
          <span>€{estimatedVat.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
