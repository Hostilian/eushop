const shouldUseMock = (): boolean => {
  if (typeof window === 'undefined') return false;
  // API_CONFIG is not defined, assuming USE_MOCK_AUTH is an environment variable
  return process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
};
