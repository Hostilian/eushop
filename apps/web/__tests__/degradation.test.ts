import {
  CircuitBreaker,
  CircuitBreakerState,
  CircuitOpenError,
  RequestTimeoutError,
  resetCircuitBreakers,
  withFallback,
  withTimeout,
} from '../lib/degradation';

describe('degradation engine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCircuitBreakers();
  });

  it('returns live data with an honest origin marker and caches it', async () => {
    const result = await withFallback(
      async () => ['live'],
      'test-live',
      () => ['demo'],
      { isOffline: false },
    );

    expect(result).toEqual({ data: ['live'], origin: 'live', degraded: false });
    expect(window.localStorage.getItem('test-live')).toContain('live');
  });

  it('uses a fresh cache before demonstration data when the provider fails', async () => {
    window.localStorage.setItem('test-cache', JSON.stringify({
      data: ['cached'],
      timestamp: Date.now(),
    }));

    const demoProvider = jest.fn(() => ['demo']);
    const result = await withFallback(
      async () => { throw new Error('provider detail must stay internal'); },
      'test-cache',
      demoProvider,
      { isOffline: false },
    );

    expect(result).toEqual({ data: ['cached'], origin: 'cache', degraded: true });
    expect(demoProvider).not.toHaveBeenCalled();
  });

  it('uses bundled demonstration data while offline', async () => {
    const apiCall = jest.fn(async () => ['live']);
    const result = await withFallback(
      apiCall,
      'test-demo',
      () => ['demo'],
      { isOffline: true },
    );

    expect(result).toEqual({ data: ['demo'], origin: 'demo', degraded: true });
    expect(apiCall).not.toHaveBeenCalled();
  });

  it('aborts an operation when its deadline expires', async () => {
    jest.useFakeTimers();
    let receivedSignal: AbortSignal | undefined;
    const timed = withTimeout(signal => {
      receivedSignal = signal;
      return new Promise<string>(() => undefined);
    }, 50);

    await Promise.resolve();
    jest.advanceTimersByTime(50);

    await expect(timed).rejects.toBeInstanceOf(RequestTimeoutError);
    expect(receivedSignal?.aborted).toBe(true);
    jest.useRealTimers();
  });

  it('opens after the configured failure threshold and recovers through half-open', async () => {
    const breaker = new CircuitBreaker(2, 0);
    const failingCall = async () => { throw new Error('unavailable'); };

    await expect(breaker.call(failingCall)).rejects.toThrow('unavailable');
    await expect(breaker.call(failingCall)).rejects.toThrow('unavailable');
    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);

    await expect(breaker.call(async () => 'recovered')).resolves.toBe('recovered');
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('short-circuits calls while an open breaker is cooling down', async () => {
    const breaker = new CircuitBreaker(1, 60_000);
    await expect(breaker.call(async () => { throw new Error('unavailable'); }))
      .rejects.toThrow('unavailable');

    await expect(breaker.call(async () => 'not called')).rejects.toBeInstanceOf(CircuitOpenError);
  });
});
