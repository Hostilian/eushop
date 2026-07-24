import React from 'react';
import { SellerTraceabilityCard, SellerTraceabilityProps } from './SellerTraceabilityCard';

/**
 * DSA Article 30 Compliant Persistent Trader Traceability Card
 *
 * COMPLIANCE-REVIEW: Implements Regulation (EU) 2022/2065 (DSA) Art. 30 requirements:
 * Name, address, registration number, VAT ID, and self-certified legal status.
 */
export const TraderTraceabilityCard: React.FC<SellerTraceabilityProps> = (props) => {
  return <SellerTraceabilityCard {...props} />;
};

export type { SellerTraceabilityProps };
