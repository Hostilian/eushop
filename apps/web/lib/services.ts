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
  taxId?: string;
  vatNumber?: string;
  tradeRegisterNumber?: string;
  address?: string;
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
  businessName?: string;
  country?: string;
  phone?: string;
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

// -------------------------------------------------------------
// STATIC MOCK DATABASE FOR OFFLINE / STATIC MODE DEGRADATION
// -------------------------------------------------------------

export const fallbackTrendingFoods: FoodItem[] = [
  {
    id: '1',
    name: 'Artisanal Belgian Chocolates',
    country: 'Belgium',
    price: 24.99,
    description: 'Fine handmade pralines and truffles crafted by master chocolatiers in Brussels using 100% cocoa butter.',
    sellerId: 'seller_belgium@eushop.local',
    category: 'Sweets & Confectionery',
    allergens: ['Milk', 'Soy', 'Nuts'],
    imageUrl: '/images/belgian_chocolates.png',
    seller: { id: 'seller_belgium@eushop.local', name: 'Brussels Praline Co.', rating: 4.9, verified: true }
  },
  {
    id: '2',
    name: 'Aceto Balsamico Tradizionale',
    country: 'Italy',
    price: 49.99,
    description: 'Authentic aged balsamic vinegar of Modena DOP, matured in oak casks for rich complex flavors.',
    sellerId: 'seller_italy@eushop.local',
    category: 'Condiments',
    allergens: ['Sulfites'],
    imageUrl: '/images/italian_olive_oil.png',
    seller: { id: 'seller_italy@eushop.local', name: 'Modena Olive & Vineyards', rating: 4.8, verified: true }
  },
  {
    id: '3',
    name: 'Spanish Manchego Cheese DOP',
    country: 'Spain',
    price: 29.99,
    description: 'Cured sheep milk cheese from the La Mancha region, matured for 12 months with a firm, nutty flavor.',
    sellerId: 'seller_spain@eushop.local',
    category: 'Dairy & Cheese',
    allergens: ['Milk'],
    imageUrl: '/images/spanish_manchego.png',
    seller: { id: 'seller_spain@eushop.local', name: 'Queserías de la Mancha', rating: 4.7, verified: true }
  },
  {
    id: '4',
    name: 'German Black Forest Ham',
    country: 'Germany',
    price: 18.99,
    description: 'Traditional smoked ham cured with pine needles and cold-smoked in the Black Forest region.',
    sellerId: 'seller_germany@eushop.local',
    category: 'Meat & Deli',
    allergens: [],
    imageUrl: '/images/german_delicatessen.png',
    seller: { id: 'seller_germany@eushop.local', name: 'Schwarzwald Metzgerei', rating: 4.6, verified: true }
  },
  {
    id: '5',
    name: 'French Camembert de Normandie',
    country: 'France',
    price: 14.50,
    description: 'Creamy, rich raw milk cheese crafted in Normandy, with a bloomy rind and earthy aroma.',
    sellerId: 'seller_france@eushop.local',
    category: 'Dairy & Cheese',
    allergens: ['Milk'],
    seller: { id: 'seller_france@eushop.local', name: 'Normandie Fromagerie', rating: 4.9, verified: true }
  },
  {
    id: '6',
    name: 'Greek Kalamata Olive Oil',
    country: 'Greece',
    price: 22.00,
    description: 'First cold-pressed extra virgin olive oil made from hand-picked Kalamata olives.',
    sellerId: 'seller_greece@eushop.local',
    category: 'Condiments',
    allergens: [],
    seller: { id: 'seller_greece@eushop.local', name: 'Peloponnese Olives', rating: 4.8, verified: true }
  },
  {
    id: '7',
    name: 'Austrian Sachertorte',
    country: 'Austria',
    price: 34.00,
    description: 'Classic Viennese double-layer chocolate cake with apricot jam filling and dark chocolate glaze.',
    sellerId: 'seller_austria@eushop.local',
    category: 'Sweets & Confectionery',
    allergens: ['Gluten', 'Eggs', 'Milk'],
    seller: { id: 'seller_austria@eushop.local', name: 'Vienna Royal Bakery', rating: 4.7, verified: true }
  },
  {
    id: '8',
    name: 'Portuguese Pastéis de Nata',
    country: 'Portugal',
    price: 12.00,
    description: 'Box of 6 traditional egg tart pastries dusted with cinnamon and powdered sugar.',
    sellerId: 'seller_portugal@eushop.local',
    category: 'Sweets & Confectionery',
    allergens: ['Gluten', 'Eggs', 'Milk'],
    seller: { id: 'seller_portugal@eushop.local', name: 'Lisbon Pastry Hub', rating: 4.9, verified: true }
  },
  {
    id: '9',
    name: 'Dutch Aged Gouda Cheese',
    country: 'Netherlands',
    price: 26.50,
    description: 'Rich, crumbly cow milk cheese aged for 24 months with sweet butterscotch flavor crystals.',
    sellerId: 'seller_netherlands@eushop.local',
    category: 'Dairy & Cheese',
    allergens: ['Milk'],
    seller: { id: 'seller_netherlands@eushop.local', name: 'Gouda Masters', rating: 4.8, verified: true }
  },
  {
    id: '10',
    name: 'Italian Prosciutto di Parma',
    country: 'Italy',
    price: 32.00,
    description: 'Dry-cured ham sliced paper-thin, aged 18 months, with sweet delicate texture.',
    sellerId: 'seller_italy@eushop.local',
    category: 'Meat & Deli',
    allergens: [],
    seller: { id: 'seller_italy@eushop.local', name: 'Emilia-Romagna Meats', rating: 4.9, verified: true }
  }
];

// Helper functions for client-side storage simulation
const getLocalFoods = (): FoodItem[] => {
  if (typeof window === 'undefined') return fallbackTrendingFoods;
  try {
    const raw = localStorage.getItem('local_foods');
    const parsed = raw ? JSON.parse(raw) : [];
    return [...fallbackTrendingFoods, ...parsed];
  } catch {
    return fallbackTrendingFoods;
  }
};

const saveLocalFood = (item: FoodItem) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('local_foods');
    const parsed = raw ? JSON.parse(raw) : [];
    parsed.push(item);
    localStorage.setItem('local_foods', JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to save local food listing:', e);
  }
};

const getLocalOrders = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('orders');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalOrder = (order: any) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('orders');
    const parsed = raw ? JSON.parse(raw) : [];
    parsed.push({ ...order, id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, createdAt: new Date().toISOString() });
    localStorage.setItem('orders', JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to save local order:', e);
  }
};

const getLocalSellers = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('seller_applications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalSeller = (application: any) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('seller_applications');
    const parsed = raw ? JSON.parse(raw) : [];
    parsed.push({
      ...application,
      id: `app-${Date.now()}`,
      status: 'PENDING'
    });
    localStorage.setItem('seller_applications', JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to save local seller application:', e);
  }
};

const getLocalUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('local_users');
    if (!raw) {
      const defaultUsers: User[] = [
        { id: '1', email: 'demo@eushop.local', name: 'Demo User', country: 'DE', role: 'ADMIN', kycVerified: true, emailVerified: true, selfCertifiedCompliant: true }
      ];
      localStorage.setItem('local_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('local_users', JSON.stringify(users));
};

// -------------------------------------------------------------
// API SERVICES IMPLEMENTATION WITH AUTOMATIC FALLBACKS
// -------------------------------------------------------------

const shouldUseMock = (): boolean => {
  if (typeof window === 'undefined') return false;
  return process.env.NODE_ENV !== 'production' && API_CONFIG.USE_MOCK_AUTH;
};

export const foodAPI = {
  search: async (query?: string, country?: string, page: number = 1, size: number = 20, config?: any): Promise<FoodItem[]> => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (country) params.append('country', country);
      params.append('page', (page - 1).toString());
      params.append('size', size.toString());

      const response = await apiClient.get('/foods', { params, ...config });
      return response.data.content || response.data;
    } catch (e) {
      if (!shouldUseMock()) {
        throw e;
      }
      console.warn('foodAPI.search failed. Falling back to local database simulation.');
      let allFoods = getLocalFoods();
      
      if (query) {
        const q = query.toLowerCase();
        allFoods = allFoods.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || (f.category && f.category.toLowerCase().includes(q)));
      }
      if (country) {
        allFoods = allFoods.filter(f => f.country.toLowerCase() === country.toLowerCase());
      }
      
      const start = (page - 1) * size;
      return allFoods.slice(start, start + size);
    }
  },

  getById: async (id: string, config?: any): Promise<FoodItem> => {
    try {
      const response = await apiClient.get(`/foods/${id}`, config);
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn(`foodAPI.getById(${id}) failed. Falling back to local database simulation.`);
      const allFoods = getLocalFoods();
      const found = allFoods.find(f => f.id === id);
      if (!found) throw new Error('Food details not found in simulated database');
      return found;
    }
  },

  getTrending: async (): Promise<FoodItem[]> => {
    try {
      const response = await apiClient.get('/foods/trending');
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('foodAPI.getTrending failed. Falling back to local database simulation.');
      return getLocalFoods().slice(0, 3);
    }
  },

  syncCart: async (cartItems: any[]): Promise<any> => {
    try {
      return await apiClient.post('/cart/sync', cartItems);
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('foodAPI.syncCart failed. Storing in local storage only.');
      return { status: 'sync_delayed' };
    }
  },

  addCustomListing: async (listing: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
    const newItem: FoodItem = {
      ...listing,
      id: `food-${Date.now()}`,
      seller: listing.seller || {
        id: listing.sellerId,
        name: 'Local Producer',
        rating: 5.0,
        verified: true
      }
    };
    
    try {
      const response = await apiClient.post('/foods', newItem);
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('foodAPI.addCustomListing failed. Saving to local storage simulated database.');
      saveLocalFood(newItem);
      return newItem;
    }
  }
};

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.user) {
        sessionStorage.setItem('userProfile', JSON.stringify(response.data.user));
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.login failed. Simulating local session.');
      const users = getLocalUsers();
      let matched = users.find(u => u.email === email);
      if (!matched) {
        // Auto-register a default account if it doesn't exist to ease testing
        matched = {
          id: `usr-${Date.now()}`,
          email,
          name: email.split('@')[0].toUpperCase(),
          country: 'DE',
          role: email.includes('admin') ? 'ADMIN' : 'BUYER',
          kycVerified: false,
          emailVerified: true,
          selfCertifiedCompliant: false
        };
        users.push(matched);
        saveLocalUsers(users);
      }
      
      const payload: LoginResponse = {
        message: 'Mock login successful',
        user: matched
      };
      sessionStorage.setItem('userProfile', JSON.stringify(matched));
      localStorage.setItem('user', JSON.stringify(matched));
      window.dispatchEvent(new Event('auth-changed'));
      return payload;
    }
  },

  signup: async (email: string, password: string, name: string, country: string): Promise<SignupResponse> => {
    try {
      const response = await apiClient.post('/auth/signup', { email, password, name, country });
      if (response.data.user) {
        sessionStorage.setItem('userProfile', JSON.stringify(response.data.user));
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.signup failed. Simulating local signup.');
      const users = getLocalUsers();
      if (users.some(u => u.email === email)) {
        throw new Error('Email is already registered');
      }
      
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email,
        name,
        country,
        role: email.includes('admin') ? 'ADMIN' : 'BUYER',
        kycVerified: false,
        emailVerified: true,
        selfCertifiedCompliant: false
      };
      users.push(newUser);
      saveLocalUsers(users);
      
      const payload: SignupResponse = {
        message: 'Mock signup successful',
        user: newUser
      };
      sessionStorage.setItem('userProfile', JSON.stringify(newUser));
      localStorage.setItem('user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth-changed'));
      return payload;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.logout network call failed. Performing client-side logout.');
    } finally {
      sessionStorage.removeItem('userProfile');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('auth-changed'));
    }
  },

  getCurrentUser: async (config?: any): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me', config);
      const user = response.data.data;
      if (user) {
        sessionStorage.setItem('userProfile', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user ?? null;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      // Return local storage profile if offline/api down
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) as User : null;
      }
      return null;
    }
  },

  getCachedProfile: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  becomeSeller: async (userId: string, data: BecomeSellerRequest): Promise<any> => {
    try {
      const response = await apiClient.put(`/users/${userId}/become-seller`, data);
      sessionStorage.removeItem('userProfile');
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.becomeSeller failed. Recording seller application locally.');
      
      // Update local application registry
      saveLocalSeller({
        userId,
        name: data.businessName || 'Artisanal Merchant',
        email: data.phone || 'seller@eushop.local',
        country: data.country || 'EU',
        taxId: data.taxId,
        vatNumber: data.vatNumber,
        tradeRegisterNumber: data.tradeRegisterNumber,
        address: `${data.addressStreet}, ${data.addressCity}, ${data.addressPostalCode}`,
        selfCertified: data.selfCertifiedCompliant
      });

      // Instantly mark local user as SELLER for demo responsiveness
      const currentUser = authAPI.getCachedProfile();
      if (currentUser && currentUser.id === userId) {
        const updated = {
          ...currentUser,
          role: 'SELLER' as const,
          selfCertifiedCompliant: data.selfCertifiedCompliant,
          taxId: data.taxId,
          vatNumber: data.vatNumber,
          tradeRegisterNumber: data.tradeRegisterNumber,
          address: `${data.addressStreet}, ${data.addressCity}, ${data.addressPostalCode}`
        };
        localStorage.setItem('user', JSON.stringify(updated));
        sessionStorage.setItem('userProfile', JSON.stringify(updated));
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      return { success: true, message: 'Simulated seller registration registered' };
    }
  },

  exportUserData: async (userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/users/${userId}/export`, {
        headers: { 'X-User-Id': userId }
      });
      return response.data.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.exportUserData failed. Generating client-side export.');
      const user = authAPI.getCachedProfile();
      const orders = getLocalOrders().filter(o => o.buyerEmail === user?.email);
      return {
        userProfile: user,
        ordersList: orders,
        exportedAt: new Date().toISOString(),
        gdprRegulatoryNotice: 'This is an export of data stored in your local browser sandbox.'
      };
    }
  },

  deleteAccount: async (userId: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`/users/${userId}/account`, {
        headers: { 'X-User-Id': userId }
      });
      sessionStorage.removeItem('userProfile');
      localStorage.removeItem('user');
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.deleteAccount failed. Clearing local data sandbox.');
      sessionStorage.removeItem('userProfile');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      const users = getLocalUsers().filter(u => u.id !== userId);
      saveLocalUsers(users);
      window.dispatchEvent(new Event('auth-changed'));
      return { success: true };
    }
  },

  recordConsent: async (userId: string, consentType: string, consentVersion: string, granted: boolean): Promise<any> => {
    try {
      const response = await apiClient.post(`/users/${userId}/consent`, {
        consentType,
        consentVersion,
        granted
      }, {
        headers: { 'X-User-Id': userId }
      });
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('authAPI.recordConsent failed. Storing consent locally.');
      localStorage.setItem(`consent_${consentType}`, JSON.stringify({ granted, version: consentVersion, timestamp: new Date().toISOString() }));
      return { success: true };
    }
  },
};

export const paymentAPI = {
  createPaymentIntent: async (amount: number, currency: string = 'eur', sellerId?: string): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiClient.post('/payments/create-payment-intent', { amount, currency, sellerId });
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('paymentAPI.createPaymentIntent failed. Returning simulated client secret.');
      return {
        clientSecret: `pi_mock_secret_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        id: `pi_mock_id_${Date.now()}`
      };
    }
  },
};

export const orderAPI = {
  create: async (order: CreateOrderRequest): Promise<any> => {
    try {
      const profile = authAPI.getCachedProfile();
      if (!profile) throw new Error('Not authenticated');
      const response = await apiClient.post('/orders', order, {
        headers: { 'X-User-Id': profile.id },
      });
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('orderAPI.create failed. Storing order in local browser database.');
      const profile = authAPI.getCachedProfile();
      const allFoods = getLocalFoods();
      const foodItem = allFoods.find(f => f.id === order.foodId);
      
      const newOrder = {
        foodId: order.foodId,
        productName: foodItem?.name || 'Artisanal Delicacy',
        sellerId: order.sellerId,
        sellerName: foodItem?.seller?.name || 'Local Seller',
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        finderFee: order.finderFee,
        shippingAddress: order.shippingAddress,
        buyerEmail: profile?.email || 'guest@eushop.local',
        status: 'PROCESSING',
        stripePaymentIntentId: order.stripePaymentIntentId || `pi_mock_${Date.now()}`
      };
      
      saveLocalOrder(newOrder);
      return newOrder;
    }
  },

  getById: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn(`orderAPI.getById(${id}) failed. Returning from local simulated storage.`);
      const orders = getLocalOrders();
      const found = orders.find(o => o.id === id);
      if (!found) throw new Error('Order not found');
      return found;
    }
  },

  getBuyerOrders: async (): Promise<any[]> => {
    try {
      const profile = authAPI.getCachedProfile();
      if (!profile) throw new Error('Not authenticated');
      const response = await apiClient.get('/orders', {
        headers: { 'X-User-Id': profile.id },
      });
      return response.data.content || response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('orderAPI.getBuyerOrders failed. Loading from browser storage.');
      const profile = authAPI.getCachedProfile();
      const orders = getLocalOrders();
      return orders.filter(o => o.buyerEmail === profile?.email);
    }
  },

  getSellerOrders: async (): Promise<any[]> => {
    try {
      const profile = authAPI.getCachedProfile();
      if (!profile) throw new Error('Not authenticated');
      const response = await apiClient.get('/orders/seller', {
        headers: { 'X-User-Id': profile.id },
      });
      return response.data.content || response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('orderAPI.getSellerOrders failed. Loading from browser storage.');
      const profile = authAPI.getCachedProfile();
      const orders = getLocalOrders();
      return orders.filter(o => o.sellerId === profile?.id || o.sellerId === profile?.email);
    }
  },

  updateStatus: async (orderId: string, status: string): Promise<any> => {
    try {
      const profile = authAPI.getCachedProfile();
      if (!profile) throw new Error('Not authenticated');
      const response = await apiClient.put(`/orders/${orderId}/status`, null, {
        params: { status },
        headers: { 'X-User-Id': profile.id },
      });
      return response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
      console.warn('orderAPI.updateStatus failed. Updating local browser record.');
      const orders = getLocalOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx > -1) {
        orders[idx].status = status;
        localStorage.setItem('orders', JSON.stringify(orders));
        return orders[idx];
      }
      throw new Error('Order not found in simulation');
    }
  },
};

