/**
 * eAmbrosia / GIview Quality Scheme Verification Engine
 *
 * Provides verification logic for EU Geographical Indications (PDO, PGI, TSG).
 *
 * Compliance Note:
 * COMPLIANCE-REVIEW: Never infer PDO/PGI/TSG status from seller product marketing text alone.
 * Official verification requires matching against registered eAmbrosia entries.
 */

export interface EAmbrosiaEntry {
  eAmbrosiaId: string;
  officialName: string;
  schemeType: 'PDO' | 'PGI' | 'TSG';
  countryIso2: string;
  productCategory: string;
  status: 'REGISTERED' | 'APPLIED' | 'CANCELLED';
  specificationUrl?: string;
  registeredDate?: string;
}

/**
 * Verifies whether a product name and origin match a registered eAmbrosia GI entry.
 */
export function verifyGeographicalIndication(
  productName: string,
  countryIso2: string,
  officialRegistry: EAmbrosiaEntry[]
): { isVerified: boolean; matchedEntry?: EAmbrosiaEntry; confidence: number } {
  const normalizedProduct = productName.trim().toLowerCase();
  const normalizedCountry = countryIso2.trim().toUpperCase();

  const match = officialRegistry.find(
    (entry) =>
      entry.countryIso2.toUpperCase() === normalizedCountry &&
      entry.status === 'REGISTERED' &&
      normalizedProduct.includes(entry.officialName.toLowerCase())
  );

  if (match) {
    return {
      isVerified: true,
      matchedEntry: match,
      confidence: 1.0,
    };
  }

  return {
    isVerified: false,
    confidence: 0.0,
  };
}
