import apiClient from './api-client';

export interface FoodItem {
  id: string;
  name: string;
  country: string;
  price: number;
  description: string;
  imageUrl?: string;
  sellerId: string;
  finderFee?: number;
  category?: string;
  dietaryRestrictions?: string[];
  allergens?: string[];
  images?: string[];
  seller?: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  kycVerified: boolean;
  emailVerified: boolean;
  selfCertifiedCompliant: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface BecomeSellerRequest {
  taxId: string;
  vatNumber?: string;
  tradeRegisterNumber: string;
  addressStreet: string;
  addressCity: string;
  addressPostalCode: string;
  selfCertifiedCompliant: boolean;
}

export interface CreateOrderRequest {
  foodId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  finderFee: number;
  shippingAddress: string;
  message: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export const foodAPI = {
  search: async (query?: string, country?: string, page: number = 1, size: number = 20): Promise<FoodItem[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (country) params.append('country', country);
    params.append('page', (page - 1).toString()); // Spring Boot pages are 0-indexed
    params.append('size', size.toString());

    const response = await apiClient.get('/foods', { params });
    return response.data.content || response.data; // Spring returns Page object
  },

  getById: async (id: string): Promise<FoodItem> => {
    const response = await apiClient.get(`/foods/${id}`);
    return response.data;
  },

  getTrending: async (): Promise<FoodItem[]> => {
    const response = await apiClient.get('/foods/trending');
    return response.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    // On successful login, the server sets an httpOnly cookie.
    // The response body contains user details, but no token.
    localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user details (non-sensitive)
    return response.data;
  },

  signup: async (email: string, password: string, name: string, country: string): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', { email, password, name, country });
    // On successful signup (and auto-login), the server sets an httpOnly cookie.
    // The response body contains user details, but no token.
    localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user details (non-sensitive)
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('user'); // Clear local user details
    // The server will clear the httpOnly cookie
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(response.data.data)); // Update local user details
      return response.data.data; // Spring ApiResponse wraps the user object
    } catch (error) {
      localStorage.removeItem('user'); // Clear local user details if session is invalid
      return null;
    }
  },

  becomeSeller: async (userId: string, data: BecomeSellerRequest): Promise<any> => {
    const response = await apiClient.put(`/users/${userId}/become-seller`, data);
    // After becoming a seller, update local user role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      localStorage.setItem('user', JSON.stringify({ ...user, role: 'SELLER' }));
    }
    return response.data;
  },
};

export const paymentAPI = {
  createPaymentIntent: async (amount: number, currency: string = 'eur', sellerId?: string): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post('/payments/create-payment-intent', { amount, currency, sellerId });
    return response.data;
  },
};

export const orderAPI = {
  create: async (order: CreateOrderRequest): Promise<any> => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not logged in');
    const user = JSON.parse(userStr);

    const response = await apiClient.post('/orders', order, {
      headers: {
        'X-User-Id': user.id, // Spring Boot controller expects X-User-Id header
      },
    });
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  getBuyerOrders: async (): Promise<any[]> => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not logged in');
    const user = JSON.parse(userStr);
    const response = await apiClient.get('/orders', {
      headers: {
        'X-User-Id': user.id,
      },
    });
    return response.data.content || response.data;
  },

  getSellerOrders: async (): Promise<any[]> => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not logged in');
    const user = JSON.parse(userStr);
    const response = await apiClient.get('/orders/seller', {
      headers: {
        'X-User-Id': user.id,
      },
    });
    return response.data.content || response.data;
  },

  updateStatus: async (orderId: string, status: string): Promise<any> => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not logged in');
    const user = JSON.parse(userStr);
    const response = await apiClient.put(`/orders/${orderId}/status`, null, {
      params: { status },
      headers: {
        'X-User-Id': user.id,
      },
    });
    return response.data;
  }
};
