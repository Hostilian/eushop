import axios, { AxiosInstance } from 'axios';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';
import CircuitBreaker from 'opossum';
import logger from './logger';

const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:3001';

// Create base axios client
const createCoreServiceClient = (correlationId: string): AxiosInstance => {
  const client = axios.create({
    baseURL: CORE_SERVICE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    },
  });

  // Configure retry logic
  axiosRetry(client, {
    retries: 3,
    retryDelay: (retryCount) => {
      // Exponential backoff with jitter
      const baseDelay = Math.pow(2, retryCount) * 1000;
      const jitter = Math.random() * 1000;
      return baseDelay + jitter;
    },
    retryCondition: (error) => {
      // Retry on network errors or 5xx status codes
      return isNetworkOrIdempotentRequestError(error) || 
             (error.response && error.response.status >= 500);
    },
    onRetry: (retryCount, error, requestConfig) => {
      logger.warn({
        retryCount,
        url: requestConfig.url,
        method: requestConfig.method,
        error: error.message,
        correlationId: requestConfig.headers?.['X-Correlation-ID'],
      }, 'Retrying request to core service');
    },
  });

  return client;
};

// Circuit breaker options
const circuitBreakerOptions = {
  timeout: 30000, // If request takes longer than 30s, trigger failure
  errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
  resetTimeout: 30000, // After 30s, try half-open state
  rollingCountTimeout: 10000, // Count errors in 10s window
  rollingCountBuckets: 10, // 10 buckets of 1s each
};

// Create circuit breaker for core service calls
export const createCoreServiceCircuitBreaker = (correlationId: string) => {
  const client = createCoreServiceClient(correlationId);

  const breaker = new CircuitBreaker(async (options: any) => {
    const { method, url, data, params, headers } = options;
    logger.info({ method, url, correlationId }, 'Calling core service');
    const response = await client({
      method,
      url,
      data,
      params,
      headers: { ...headers, 'X-Correlation-ID': correlationId },
    });
    logger.info({ method, url, status: response.status, correlationId }, 'Core service response');
    return response;
  }, circuitBreakerOptions);

  // Event listeners for circuit breaker
  breaker.on('open', () => {
    logger.error({ correlationId }, 'Circuit breaker OPEN - core service is failing');
  });

  breaker.on('halfOpen', () => {
    logger.warn({ correlationId }, 'Circuit breaker HALF-OPEN - testing core service');
  });

  breaker.on('close', () => {
    logger.info({ correlationId }, 'Circuit breaker CLOSED - core service is healthy');
  });

  breaker.fallback(() => {
    logger.error({ correlationId }, 'Circuit breaker fallback triggered');
    throw new Error('Core service unavailable - circuit breaker open');
  });

  return breaker;
};

export default createCoreServiceClient;
