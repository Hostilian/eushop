import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';
import API_CONFIG from './config';
import { removeSafeStorage } from './storageSafety';

// Generate a correlation ID for each request
const generateCorrelationId = (): string => {
  return `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: This sends cookies with cross-origin requests
});

// Configure retry logic
axiosRetry(apiClient, {
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
           Boolean(error.response && error.response.status >= 500);
  },
});

// Add correlation ID to requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Remove Authorization header if it was set from localStorage, as we now rely on httpOnly cookies
  // If you have other clients (e.g., mobile app) that still use Authorization header,
  // you might need a separate axios instance for them.
  delete config.headers.Authorization; 
  
  // Add correlation ID
  if (!config.headers['X-Correlation-ID']) {
    config.headers['X-Correlation-ID'] = generateCorrelationId();
  }
  return config;
});

// Handle 401 errors (unauthorized) — session cookie has expired or is invalid
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        removeSafeStorage('userProfile', 'session');
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
