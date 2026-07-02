import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';
import API_CONFIG from './config';

// Generate a correlation ID for each request
const generateCorrelationId = (): string => {
  return `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
           (error.response && error.response.status >= 500);
  },
});

// Add token and correlation ID to requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add correlation ID
  if (!config.headers['X-Correlation-ID']) {
    config.headers['X-Correlation-ID'] = generateCorrelationId();
  }
  return config;
});

// Handle 401 errors (unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      typeof window !== 'undefined' && localStorage.removeItem('token');
      typeof window !== 'undefined' && localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
