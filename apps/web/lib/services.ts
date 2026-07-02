import apiClient from './api-client';

export interface FoodItem {
  id: string;
  name: string;
  country: string;
  price: number;
  description: string;
  imageUrl?: string;
  sellerId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface SignupResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export const foodAPI = {
  search: async (query?: string, country?: string, page: number = 1, limit: number = 20) => {
    const response = await apiClient.get('/foods', {
      params: { search: query, country, page, limit },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/foods/${id}`);
    return response.data;
  },

  getTrending: async () => {
    const response = await apiClient.get('/foods/trending');
    return response.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (email: string, password: string, name: string, country?: string): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', { email, password, name, country });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  verifyToken: async (token: string) => {
    const response = await apiClient.post('/auth/verify', { token });
    return response.data;
  },

  becomeSeller: async (userId: string, data: any) => {
    const response = await apiClient.post(`/users/${userId}/become-seller`, data);
    return response.data;
  },
};

export const paymentAPI = {
  createConnectAccount: async (email: string, country: string) => {
    const response = await apiClient.post('/payments/connect/account', { email, country });
    return response.data;
  },

  createAccountLink: async (accountId: string, returnUrl: string, refreshUrl: string) => {
    const response = await apiClient.post('/payments/connect/link', { accountId, returnUrl, refreshUrl });
    return response.data;
  },

  createPaymentIntent: async (amount: number, currency: string = 'eur', sellerAccountId?: string) => {
    const response = await apiClient.post('/payments/create-payment-intent', { amount, currency, sellerAccountId });
    return response.data;
  },
};

export const orderAPI = {
  create: async (order: any) => {
    const response = await apiClient.post('/orders', order);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  getBuyerOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await apiClient.get('/orders/seller');
    return response.data;
  },

  updateStatus: async (orderId: string, status: string) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

