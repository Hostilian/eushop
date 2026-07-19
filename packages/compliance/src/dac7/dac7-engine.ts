/**
 * DAC7 threshold and reporting logic for EU marketplaces.
 *
 * COMPLIANCE-REVIEW: Reporting deadlines and seller exclusions require review
 * in every reporting jurisdiction before a filing is generated.
 */

import { DAC7Seller } from './types';
import { isDAC7Reportable } from '../vat';

/**
 * Checks if a seller meets DAC7 reporting thresholds.
 * Thresholds: €2,000 or 30+ transactions in a calendar year.
 */
export const meetsDAC7Threshold = (seller: DAC7Seller): boolean => {
  const { annualRevenue, transactionCount } = seller;
  return isDAC7Reportable(transactionCount, annualRevenue);
};

/**
 * Generates DAC7 report data for submission to EU tax authorities.
 */
export const generateDAC7Report = (sellers: DAC7Seller[]): any => {
  return sellers
    .filter(meetsDAC7Threshold)
    .map(seller => ({
      name: seller.legalName,
      address: seller.address,
      taxId: seller.taxId,
      financialAccount: seller.financialAccount,
      annualRevenue: seller.annualRevenue,
      transactionCount: seller.transactionCount,
    }));
};
