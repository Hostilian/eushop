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

export const foodAPI = {
  search: async (query?: string, country?: string) => {
    const response = await apiClient.get('/foods', {
      params: { search: query, country },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/foods/${id}`);
    return response.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/auth/signup', { email, password, name });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
  },
};
