"""
DAC7 threshold and reporting logic for EU marketplaces.

Thresholds:
- €2,000 or 30+ transactions in a calendar year.
- Sellers meeting either threshold must be reported annually by January 31.
"""

import { DAC7Seller } from './types';

/**
 * Checks if a seller meets DAC7 reporting thresholds.
 * Thresholds: €2,000 or 30+ transactions in a calendar year.
 */
export const meetsDAC7Threshold = (seller: DAC7Seller): boolean => {
  const { annualRevenue, transactionCount } = seller;
  return annualRevenue >= 2000 || transactionCount >= 30;
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