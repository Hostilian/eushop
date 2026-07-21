import { checkFicArticle15LanguageCompliance } from '../src/language-compliance';

describe('FIC Reg. 1169/2011 Art. 15 Language Compliance Checker (Task 76)', () => {
  it('returns compliant when German is available for German destination market', () => {
    const result = checkFicArticle15LanguageCompliance('DE', ['de', 'en']);
    expect(result.isCompliant).toBe(true);
    expect(result.missingLanguages).toHaveLength(0);
  });

  it('flags non-compliance when German is missing for German destination market', () => {
    const result = checkFicArticle15LanguageCompliance('DE', ['fr', 'it']);
    expect(result.isCompliant).toBe(false);
    expect(result.missingLanguages).toContain('de');
  });
});
