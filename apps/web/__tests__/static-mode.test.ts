import { foodAPI, isStaticMode } from '../lib/services';

describe('Static Mode Graceful Degradation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('detects static mode and identifies bundled data as demonstration data', async () => {
    process.env.NEXT_PUBLIC_STATIC_MODE = 'true';
    
    // Verify static mode is active
    expect(isStaticMode()).toBe(true);

    const result = await foodAPI.searchWithOrigin();
    
    expect(result.origin).toBe('demo');
    expect(result.degraded).toBe(true);
    expect(result.data).toHaveLength(12);
    expect(result.data[0].name).toBe('Belgian Hazelnut Pralines');
    expect(result.data[0].isDemo).toBe(true);
  });
});
