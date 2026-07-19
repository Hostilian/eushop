/**
 * Minimal seller data used by the in-package DAC7 report projection.
 *
 * COMPLIANCE-REVIEW: Confirm the complete jurisdiction-specific filing schema,
 * identifier formats, and data-minimisation basis before exporting seller data.
 */
export interface DAC7Seller {
  legalName: string;
  address: string;
  taxId: string;
  financialAccount: string;
  annualRevenue: number;
  transactionCount: number;
}
