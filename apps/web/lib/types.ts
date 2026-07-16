export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Add other common types here