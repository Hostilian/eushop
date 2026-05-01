/**
 * API Error Handler
 * Provides utilities for handling and formatting API errors
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'APIError';
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Format API error response
 */
export function formatErrorResponse(error: any) {
  if (error instanceof APIError) {
    return error.toJSON();
  }

  if (error.response) {
    // Axios error with response
    return {
      error: error.response.data?.error || 'Request failed',
      statusCode: error.response.status,
      details: error.response.data?.details || error.message,
    };
  }

  if (error.request) {
    // Axios error without response
    return {
      error: 'No response from server',
      statusCode: 0,
      details: error.message,
    };
  }

  // Generic error
  return {
    error: error.message || 'An error occurred',
    statusCode: 500,
    details: error.stack,
  };
}

/**
 * Retry logic for failed API calls
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on 4xx errors (except 429 and 503)
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        if (![429, 503].includes(error.response.status)) {
          throw error;
        }
      }

      // Calculate backoff delay
      const delay = initialDelay * Math.pow(2, attempt);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (!error.response) return true; // Network errors are retryable
  
  const status = error.response.status;
  // Retry on 429 (Rate Limited), 503 (Service Unavailable), 504 (Gateway Timeout)
  return [429, 503, 504].includes(status);
}
