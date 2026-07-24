/**
 * DSA Article 30 Best-Efforts Trader Verification Engine
 *
 * Compliance Note:
 * COMPLIANCE-REVIEW: DSA Art. 30 requires platforms to make "best efforts" to verify trader information
 * prior to allowing listings to be displayed on the marketplace.
 */

export interface DSATraderData {
  sellerId: string;
  name: string;
  email: string;
  phone: string;
  tradeRegisterNumber: string;
  taxId: string;
  vatNumber?: string;
  countryIso2: string;
  selfCertifiedCompliant: boolean;
}

export interface DSAVerificationResult {
  kycVerified: boolean;
  viesVatValid: boolean;
  tradeRegisterValid: boolean;
  selfCertificationValid: boolean;
  verificationTimestamp: string;
  reasons: string[];
}

/**
 * Validates DSA Art. 30 trader data requirements before listing activation.
 */
export function verifyDSATraderData(trader: DSATraderData): DSAVerificationResult {
  const reasons: string[] = [];
  let viesVatValid = false;
  let tradeRegisterValid = false;

  // 1. Trade Register Format Check
  if (trader.tradeRegisterNumber && trader.tradeRegisterNumber.trim().length >= 3) {
    tradeRegisterValid = true;
  } else {
    reasons.push('Missing or invalid trade registration number');
  }

  // 2. VAT Number Format Check
  if (trader.vatNumber) {
    const vatRegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/i;
    viesVatValid = vatRegex.test(trader.vatNumber.trim());
    if (!viesVatValid) {
      reasons.push('Invalid VAT number structure for EU VIES verification');
    }
  } else {
    reasons.push('No VAT number provided');
  }

  // 3. Self-certification requirement (DSA Art. 30(e))
  if (!trader.selfCertifiedCompliant) {
    reasons.push('Trader has not self-certified compliance with EU legal requirements');
  }

  const kycVerified = tradeRegisterValid && trader.selfCertifiedCompliant;

  return {
    kycVerified,
    viesVatValid,
    tradeRegisterValid,
    selfCertificationValid: trader.selfCertifiedCompliant,
    verificationTimestamp: new Date().toISOString(),
    reasons,
  };
}
