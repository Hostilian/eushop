import React from 'react';

export interface SellerTraceabilityProps {
  sellerName: string;
  tradeRegisterNumber: string;
  vatNumber?: string;
  address: string;
  countryIso2: string;
  kycVerified: boolean;
  selfCertifiedCompliant: boolean;
}

/**
 * DSA Article 30 Compliant Persistent Seller Card
 *
 * DSA Art. 30 requires clear, persistent, non-decorative display of trader
 * identity data before buyers conclude transactions on the platform.
 */
export const SellerTraceabilityCard: React.FC<SellerTraceabilityProps> = ({
  sellerName,
  tradeRegisterNumber,
  vatNumber,
  address,
  countryIso2,
  kycVerified,
  selfCertifiedCompliant,
}) => {
  return (
    <div
      className="p-4 border rounded-lg bg-surface text-text shadow-sm"
      data-testid="dsa-seller-traceability-card"
      id={`seller-card-${sellerName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase font-semibold text-text-secondary tracking-wider">
          Sold & Shipped By
        </span>
        {kycVerified ? (
          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            DSA Verified Trader
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-700/50 rounded-full">
            Self-Certified Merchant
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold mb-1">{sellerName}</h3>
      <p className="text-sm text-text-secondary mb-3">{address}, {countryIso2}</p>

      <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
        <div>
          <span className="text-text-secondary block">Trade Register ID:</span>
          <span className="font-mono font-medium">{tradeRegisterNumber}</span>
        </div>
        {vatNumber && (
          <div>
            <span className="text-text-secondary block">EU VAT ID:</span>
            <span className="font-mono font-medium">{vatNumber}</span>
          </div>
        )}
      </div>

      {selfCertifiedCompliant && (
        <div className="mt-3 text-xs text-text-secondary flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Self-certified compliance with EU food safety regulations
        </div>
      )}
    </div>
  );
};
