/**
 * FIC Reg. 1169/2011 Article 15 Language Compliance Checker.
 * Single Source of Regulatory Truth for Member State mandatory language requirements.
 */

export interface LanguageComplianceCheckResult {
  isCompliant: boolean;
  requiredLanguages: string[];
  missingLanguages: string[];
  notice: string;
}

const MANDATORY_MEMBER_STATE_LANGUAGES: Record<string, string[]> = {
  DE: ['de'],
  AT: ['de'],
  FR: ['fr'],
  IT: ['it'],
  ES: ['es'],
  CZ: ['cs'],
  PL: ['pl'],
  NL: ['nl'],
  BE: ['nl', 'fr', 'de'],
  IE: ['en'],
  LU: ['fr', 'de'],
};

/**
 * Validates whether food labelling information is provided in the statutory language(s)
 * required by the destination EU Member State under FIC Art. 15.
 */
export function checkFicArticle15LanguageCompliance(
  destinationCountry: string,
  availableLanguages: string[]
): LanguageComplianceCheckResult {
  const targetCountry = destinationCountry.toUpperCase();
  const required = MANDATORY_MEMBER_STATE_LANGUAGES[targetCountry] || ['en'];
  const availableLower = availableLanguages.map((l) => l.toLowerCase());

  const missing = required.filter((req) => !availableLower.includes(req));

  const isCompliant = missing.length === 0;

  return {
    isCompliant,
    requiredLanguages: required,
    missingLanguages: missing,
    notice: isCompliant
      ? `FIC Art. 15 Compliant for ${targetCountry} market.`
      : `FIC Art. 15 Warning: Missing statutory language(s) [${missing.join(', ')}] for ${targetCountry} market.`,
  };
}
