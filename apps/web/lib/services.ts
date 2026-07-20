import apiClient from './api-client';
import {
  REQUEST_TIMEOUT_MS,
  type DegradationResult,
  type StatusOrigin,
  withFallback,
} from './degradation';
import { removeSafeStorage } from './storageSafety';
import {
  findDemonstrationProduct,
  getDemonstrationCatalogue,
  searchDemonstrationCatalogue,
} from '../services/demo-catalog';
import type { FoodItem } from '../data/demo-products';

export type { FoodItem } from '../data/demo-products';

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
  vatRate?: number;
  vatAmount?: number;
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

export const fallbackTrendingFoods: FoodItem[] = getDemonstrationCatalogue();

// Helper functions for client-side public catalogue simulation.
const volatileLocalFoods: FoodItem[] = [];

const getLocalFoods = (): FoodItem[] => {
  return [...fallbackTrendingFoods, ...volatileLocalFoods];
};

const saveLocalFood = (item: FoodItem) => {
  if (typeof window === 'undefined') return;
  // COMPLIANCE-REVIEW: a demo listing may include trader personal data and is
  // therefore kept in memory only. Server persistence requires the KYBC gate.
  volatileLocalFoods.push(item);
};

const volatileOrders: any[] = [];
const volatileSellerApplications: any[] = [];

const getLocalOrders = (): any[] => volatileOrders;

const saveLocalOrder = (order: any) => {
  if (typeof window === 'undefined') return;
  // COMPLIANCE-REVIEW: demo orders stay in memory to avoid persisting buyer
  // addresses/messages. Production order retention belongs to the server.
  volatileOrders.push({
    ...order,
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  });
};

const getLocalSellers = (): any[] => volatileSellerApplications;

const saveLocalSeller = (application: any) => {
  if (typeof window === 'undefined') return;
  // COMPLIANCE-REVIEW: DSA/DAC7 intake data must not be browser-persisted.
  // This volatile preview is not a submission or KYBC verification record.
  volatileSellerApplications.push({
    ...application,
    id: `app-${Date.now()}`,
    status: 'PREVIEW_ONLY',
  });
};

const getDemoFoods = (
  query?: string,
  country?: string,
  page = 1,
  size = 20,
  category?: string,
  allergenFree?: string,
): FoodItem[] => searchDemonstrationCatalogue({
  query,
  country,
  page,
  size,
  category,
  allergenFree: allergenFree ? allergenFree.split(',') : [],
});

// -------------------------------------------------------------
// API SERVICES IMPLEMENTATION WITH AUTOMATIC FALLBACKS
// -------------------------------------------------------------

export const isStaticMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_STATIC_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_API_URL
  );
};

const shouldUseMock = (): boolean => {
  if (typeof window === 'undefined') return false;
  return isStaticMode(); // Removed mock auth fallback — Auth0 is now the only provider
};

function asDegradedResult<T>(data: T, origin: StatusOrigin): DegradationResult<T> {
  return { data, origin, degraded: origin !== 'live' };
}

function filterFoods(
  foods: FoodItem[],
  query?: string,
  country?: string,
  page = 1,
  size = 20,
  category?: string,
  allergenFree?: string[],
): FoodItem[] {
  let filtered = [...foods];
  if (query) {
    const normalizedQuery = query.toLowerCase();
    filtered = filtered.filter(food =>
      food.name.toLowerCase().includes(normalizedQuery) ||
      food.description.toLowerCase().includes(normalizedQuery) ||
      food.category?.toLowerCase().includes(normalizedQuery),
    );
  }
  if (country) {
    filtered = filtered.filter(food => food.country.toLowerCase() === country.toLowerCase());
  }
  if (category) {
    filtered = filtered.filter(food => food.category?.toLowerCase() === category.toLowerCase());
  }
  if (allergenFree && allergenFree.length > 0) {
    filtered = filtered.filter(food =>
      !allergenFree.some(allergen => food.allergens?.some(foodAllergen => foodAllergen.toLowerCase() === allergen.toLowerCase()))
    );
  }

  const start = (page - 1) * size;
  return filtered.slice(start, start + size);
}

/** Keeps free-text search terms out of browser storage keys. */
function getSearchCacheKey(value: string): string {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return `food-search-${(hash >>> 0).toString(16)}`;
}

async function searchFoodsWithOrigin(
  query?: string,
  country?: string,
  page = 1,
  size = 20,
  category?: string,
  allergenFree?: string,
  config?: any,
): Promise<DegradationResult<FoodItem[]>> {
  const allergens = allergenFree ? allergenFree.split(',') : [];
  if (isStaticMode()) {
    if (volatileLocalFoods.length > 0) {
      return asDegradedResult(filterFoods(
        getLocalFoods(),
        query,
        country,
        page,
        size,
        category,
        allergens,
      ), 'local');
    }
    return asDegradedResult(
      getDemoFoods(query, country, page, size, category, allergenFree),
      'demo',
    );
  }

  const cacheDescriptor = JSON.stringify({ query, country, page, size, category, allergenFree });
  return withFallback<FoodItem[]>(
    async signal => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (country) params.append('country', country);
      if (category) params.append('category', category);
      if (allergenFree) params.append('allergenFree', allergenFree);
      params.append('page', (page - 1).toString());
      params.append('size', size.toString());

      const response = await apiClient.get('/foods/search', { ...config, params, signal });
      return response.data.data?.content || response.data.content || response.data;
    },
    getSearchCacheKey(cacheDescriptor),
    () => getDemoFoods(query, country, page, size, category, allergenFree),
    {
      apiTimeoutMs: REQUEST_TIMEOUT_MS.interactive,
      cacheDurationMs: 5 * 60 * 1000,
      demoDataTimeoutMs: REQUEST_TIMEOUT_MS.product,
    },
  );
}

async function getFoodByIdWithOrigin(
  id: string,
  config?: any,
): Promise<DegradationResult<FoodItem>> {
  if (isStaticMode()) {
    const localFood = volatileLocalFoods.find(food => food.id === id);
    if (localFood) return asDegradedResult(localFood, 'local');
    const demoFood = findDemonstrationProduct(id);
    if (!demoFood) throw new Error('Food details are unavailable.');
    return asDegradedResult(demoFood, 'demo');
  }

  return withFallback<FoodItem>(
    async signal => {
      const response = await apiClient.get(`/foods/${id}`, { ...config, signal });
      return response.data;
    },
    `food-getById-${id}`,
    () => {
      const demoFood = findDemonstrationProduct(id);
      if (!demoFood) throw new Error('Demonstration food was not found.');
      return demoFood;
    },
    {
      apiTimeoutMs: REQUEST_TIMEOUT_MS.product,
      cacheDurationMs: 10 * 60 * 1000,
      demoDataTimeoutMs: REQUEST_TIMEOUT_MS.product,
    },
  );
}

async function getTrendingFoodsWithOrigin(): Promise<DegradationResult<FoodItem[]>> {
  if (isStaticMode()) {
    if (volatileLocalFoods.length > 0) {
      return asDegradedResult(getLocalFoods().slice(0, 3), 'local');
    }
    return asDegradedResult(getDemoFoods(undefined, undefined, 1, 3), 'demo');
  }

  return withFallback<FoodItem[]>(
    async signal => {
      const response = await apiClient.get('/foods/trending', { signal });
      return response.data;
    },
    'food-getTrending',
    () => getDemoFoods(undefined, undefined, 1, 3),
    {
      apiTimeoutMs: REQUEST_TIMEOUT_MS.product,
      cacheDurationMs: 30 * 60 * 1000,
      demoDataTimeoutMs: REQUEST_TIMEOUT_MS.product,
    },
  );
}

export const foodAPI = {
  search: async (
    query?: string,
    country?: string,
    page: number = 1,
    size: number = 20,
    category?: string,
    allergenFree?: string,
    config?: any
  ): Promise<FoodItem[]> => (await searchFoodsWithOrigin(
    query,
    country,
    page,
    size,
    category,
    allergenFree,
    config,
  )).data,

  searchWithOrigin: searchFoodsWithOrigin,

  getById: async (id: string, config?: any): Promise<FoodItem> =>
    (await getFoodByIdWithOrigin(id, config)).data,

  getByIdWithOrigin: getFoodByIdWithOrigin,

  getTrending: async (): Promise<FoodItem[]> => (await getTrendingFoodsWithOrigin()).data,

  getTrendingWithOrigin: getTrendingFoodsWithOrigin,

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

let currentUserProfile: User | null = null;

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.user) {
      currentUserProfile = response.data.user;
      window.dispatchEvent(new Event('auth-changed'));
    }
    return response.data;
  },

  signup: async (email: string, password: string, name: string, country: string): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', { email, password, name, country });
    if (response.data.user) {
      currentUserProfile = response.data.user;
      window.dispatchEvent(new Event('auth-changed'));
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      currentUserProfile = null;
      removeSafeStorage('userProfile', 'session');
      removeSafeStorage('cart');
      window.dispatchEvent(new Event('auth-changed'));
    }
  },

  getCurrentUser: async (config?: any): Promise<User | null> => {
    const response = await apiClient.get('/auth/me', config);
    const user = response.data.data;
    currentUserProfile = user ?? null;
    return user ?? null;
  },

  getCachedProfile: (): User | null => currentUserProfile,

  becomeSeller: async (userId: string, data: BecomeSellerRequest): Promise<any> => {
    // COMPLIANCE-REVIEW: the server must enforce DSA trader-data completeness
    // and KYBC review; the browser must never grant or simulate seller status.
    const response = await apiClient.put(`/users/${userId}/become-seller`, data);
    currentUserProfile = null;
    removeSafeStorage('userProfile', 'session');
    return response.data;
  },

  exportUserData: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/export`);
    return response.data.data;
  },

  deleteAccount: async (userId: string): Promise<any> => {
    const response = await apiClient.delete(`/users/${userId}/account`);
    currentUserProfile = null;
    removeSafeStorage('userProfile', 'session');
    window.dispatchEvent(new Event('auth-changed'));
    return response.data;
  },

  recordConsent: async (userId: string, consentType: string, consentVersion: string, granted: boolean): Promise<any> => {
    const response = await apiClient.post(`/users/${userId}/consent`, {
      consentType,
      consentVersion,
      granted
    });
    return response.data;
  },
};

export const paymentAPI = {
  createPaymentIntent: async (amount: number, currency: string = 'eur', sellerId?: string): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiClient.post('/payments/create-payment-intent', { amount, currency, sellerAccountId: sellerId });
      return response.data.data || response.data;
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
        vatRate: order.vatRate,
        vatAmount: order.vatAmount,
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
        return orders[idx];
      }
      throw new Error('Order not found in simulation');
    }
  },
};
