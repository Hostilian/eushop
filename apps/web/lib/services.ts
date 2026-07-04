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
  stripePaymentIntentId?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
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
    // The server sets an httpOnly; Secure; SameSite=Strict cookie — no token stored here.
    // We cache only non-sensitive display info (name, email, role) for UI purposes.
    if (response.data.user) {
      sessionStorage.setItem('userProfile', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (email: string, password: string, name: string, country: string): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', { email, password, name, country });
    // Server sets httpOnly cookie. Cache display-only profile.
    if (response.data.user) {
      sessionStorage.setItem('userProfile', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    // Clear cached display profile. The server clears the httpOnly session cookie.
    sessionStorage.removeItem('userProfile');
    localStorage.removeItem('cart');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Always validate via the server — the cookie is the source of truth.
      const response = await apiClient.get('/auth/me');
      const user = response.data.data; // Spring ApiResponse<UserDTO> wrapper
      if (user) {
        sessionStorage.setItem('userProfile', JSON.stringify(user));
      }
      return user ?? null;
    } catch {
      sessionStorage.removeItem('userProfile');
      return null;
    }
  },

  /**
   * Returns the cached display profile from sessionStorage without a network call.
   * Use only for non-auth UI decisions (e.g. showing the user's name in the navbar).
   * Never use this for authorization checks — always rely on server-side cookie auth.
   */
  getCachedProfile: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('userProfile');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  becomeSeller: async (userId: string, data: BecomeSellerRequest): Promise<any> => {
    const response = await apiClient.put(`/users/${userId}/become-seller`, data);
    // Invalidate cached profile so next call refreshes from server.
    sessionStorage.removeItem('userProfile');
    return response.data;
  },

  exportUserData: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/export`, {
      headers: { 'X-User-Id': userId }
    });
    return response.data.data;
  },

  deleteAccount: async (userId: string): Promise<any> => {
    const response = await apiClient.delete(`/users/${userId}/account`, {
      headers: { 'X-User-Id': userId }
    });
    sessionStorage.removeItem('userProfile');
    return response.data;
  },

  recordConsent: async (userId: string, consentType: string, consentVersion: string, granted: boolean): Promise<any> => {
    const response = await apiClient.post(`/users/${userId}/consent`, {
      consentType,
      consentVersion,
      granted
    }, {
      headers: { 'X-User-Id': userId }
    });
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
    const profile = authAPI.getCachedProfile();
    if (!profile) throw new Error('Not authenticated');
    const response = await apiClient.post('/orders', order, {
      headers: { 'X-User-Id': profile.id },
    });
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  getBuyerOrders: async (): Promise<any[]> => {
    const profile = authAPI.getCachedProfile();
    if (!profile) throw new Error('Not authenticated');
    const response = await apiClient.get('/orders', {
      headers: { 'X-User-Id': profile.id },
    });
    return response.data.content || response.data;
  },

  getSellerOrders: async (): Promise<any[]> => {
    const profile = authAPI.getCachedProfile();
    if (!profile) throw new Error('Not authenticated');
    const response = await apiClient.get('/orders/seller', {
      headers: { 'X-User-Id': profile.id },
    });
    return response.data.content || response.data;
  },

  updateStatus: async (orderId: string, status: string): Promise<any> => {
    const profile = authAPI.getCachedProfile();
    if (!profile) throw new Error('Not authenticated');
    const response = await apiClient.put(`/orders/${orderId}/status`, null, {
      params: { status },
      headers: { 'X-User-Id': profile.id },
    });
    return response.data;
  },
};

