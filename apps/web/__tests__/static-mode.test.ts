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

  it('correctly detects static mode and returns mock data without network requests', async () => {
    process.env.NEXT_PUBLIC_STATIC_MODE = 'true';
    
    // Verify static mode is active
    expect(isStaticMode()).toBe(true);

    // Call search with mock mode enabled
    const foods = await foodAPI.search();
    
    expect(foods).toBeDefined();
    expect(foods.length).toBeGreaterThan(0);
    expect(foods[0].name).toBe('Artisanal Belgian Chocolates');
  });
});
