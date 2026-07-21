/**
 * Automated Buyer Dispute Escalation Service.
 * Escalates unfulfilled cross-border EU orders to DSA Art. 21 Out-of-Court Dispute Resolution.
 */

export interface EscalationStatus {
  orderNumber: string;
  daysUnfulfilled: number;
  shouldEscalate: boolean;
  recommendedAction: string;
  legalBasis: string;
}

/**
 * Checks if a cross-border shipment exceeds statutory EU delivery deadlines (30 days under Consumer Rights Directive 2011/83/EU).
 */
export function checkDisputeEscalation(orderNumber: string, orderDateStr: string, isDelivered: boolean): EscalationStatus {
  if (isDelivered) {
    return {
      orderNumber,
      daysUnfulfilled: 0,
      shouldEscalate: false,
      recommendedAction: 'Order delivered. Standard 14-day statutory withdrawal period active.',
      legalBasis: 'Directive 2011/83/EU Article 9',
    };
  }

  const orderDate = new Date(orderDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - orderDate.getTime());
  const daysUnfulfilled = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const shouldEscalate = daysUnfulfilled >= 30;

  return {
    orderNumber,
    daysUnfulfilled,
    shouldEscalate,
    recommendedAction: shouldEscalate
      ? 'Automatic Escalation: Exceeds 30-day EU statutory delivery deadline. Escalated to DSA Art. 20 dispute portal for refund.'
      : `Order in transit (${daysUnfulfilled} days). Statutory deadline in ${30 - daysUnfulfilled} days.`,
    legalBasis: 'Directive 2011/83/EU Article 18 (Delivery Deadline)',
  };
}
