import { DAC7_THRESHOLDS } from '@eushop/compliance';

// COMPLIANCE-REVIEW: DAC7 Directive 2021/514 Event Bus.
// Single source of truth for DAC7 reporting thresholds is packages/compliance.

export interface DAC7TransactionEvent {
  eventId: string;
  sellerId: string;
  orderId: string;
  amountEur: number;
  timestamp: string;
}

export interface DAC7SellerStatus {
  sellerId: string;
  totalConsiderationEur: number;
  totalTransactionsCount: number;
  thresholdExceeded: boolean;
  dac7ReportRequired: boolean;
}

const sellerAggregates = new Map<string, { totalAmount: number; count: number }>();

/**
 * Processes a transaction event and evaluates DAC7 reporting thresholds.
 */
export async function processDAC7TransactionEvent(event: DAC7TransactionEvent): Promise<DAC7SellerStatus> {
  const current = sellerAggregates.get(event.sellerId) || { totalAmount: 0, count: 0 };
  
  const updatedAmount = current.totalAmount + event.amountEur;
  const updatedCount = current.count + 1;

  sellerAggregates.set(event.sellerId, {
    totalAmount: updatedAmount,
    count: updatedCount,
  });

  const thresholdExceeded = 
    updatedCount >= DAC7_THRESHOLDS.TRANSACTIONS_COUNT || 
    updatedAmount >= DAC7_THRESHOLDS.CONSIDERATION_EUR;

  return {
    sellerId: event.sellerId,
    totalConsiderationEur: updatedAmount,
    totalTransactionsCount: updatedCount,
    thresholdExceeded,
    dac7ReportRequired: thresholdExceeded,
  };
}
