import { verifyQualitySchemeClaim } from '../src/quality-scheme-verifier';

describe('EU Reg. 1151/2012 PDO/PGI Quality Scheme Verification Engine (Task 75)', () => {
  it('verifies Parma Ham as authentic PDO with registration number', () => {
    const result = verifyQualitySchemeClaim('Prosciutto di Parma');
    expect(result.isVerified).toBe(true);
    expect(result.claimedScheme).toBe('PDO');
    expect(result.registrationNumber).toBe('PDO-IT-0001');
    expect(result.eAmbrosiaUrl).toContain('PDO-IT-0001');
  });

  it('marks unknown products with claimed PGI as unverified pending check', () => {
    const result = verifyQualitySchemeClaim('Custom Artisan Cheese', 'PGI');
    expect(result.isVerified).toBe(false);
    expect(result.claimedScheme).toBe('PGI');
    expect(result.schemeLabel).toContain('Pending');
  });
});
