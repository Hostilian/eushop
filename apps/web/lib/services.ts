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

<<<<<<< HEAD
export type { FoodItem } from '../data/demo-products';
=======
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
>>>>>>> pull-1

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
<<<<<<< HEAD
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

=======
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
      console.warn('foodAPI.getTrending failed. Falling back to local database simulation.');
      return getLocalFoods().slice(0, 3);
    }
  },

  syncCart: async (cartItems: any[]): Promise<any> => {
    try {
      return await apiClient.post('/cart/sync', cartItems);
    } catch (e) {
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
    
>>>>>>> pull-1
    try {
      const response = await apiClient.post('/foods', newItem);
      return response.data;
    } catch (e) {
<<<<<<< HEAD
      if (!shouldUseMock()) throw e;
=======
>>>>>>> pull-1
      console.warn('foodAPI.addCustomListing failed. Saving to local storage simulated database.');
      saveLocalFood(newItem);
      return newItem;
    }
  }
};

let currentUserProfile: User | null = null;

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
<<<<<<< HEAD
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
=======
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.user) {
        sessionStorage.setItem('userProfile', JSON.stringify(response.data.user));
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (e) {
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
    } catch {
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
      console.warn('authAPI.recordConsent failed. Storing consent locally.');
      localStorage.setItem(`consent_${consentType}`, JSON.stringify({ granted, version: consentVersion, timestamp: new Date().toISOString() }));
      return { success: true };
    }
>>>>>>> pull-1
  },
};

export const paymentAPI = {
  createPaymentIntent: async (amount: number, currency: string = 'eur', sellerId?: string): Promise<PaymentIntentResponse> => {
    try {
<<<<<<< HEAD
      const response = await apiClient.post('/payments/create-payment-intent', { amount, currency, sellerAccountId: sellerId });
      return response.data.data || response.data;
    } catch (e) {
      if (!shouldUseMock()) throw e;
=======
      const response = await apiClient.post('/payments/create-payment-intent', { amount, currency, sellerId });
      return response.data;
    } catch (e) {
>>>>>>> pull-1
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
<<<<<<< HEAD
      if (!shouldUseMock()) throw e;
=======
>>>>>>> pull-1
      console.warn('orderAPI.create failed. Storing order in local browser database.');
      const profile = authAPI.getCachedProfile();
      const allFoods = getLocalFoods();
      const foodItem = allFoods.find(f => f.id === order.foodId);
<<<<<<< HEAD

=======
      
>>>>>>> pull-1
      const newOrder = {
        foodId: order.foodId,
        productName: foodItem?.name || 'Artisanal Delicacy',
        sellerId: order.sellerId,
        sellerName: foodItem?.seller?.name || 'Local Seller',
        quantity: order.quantity,
        totalPrice: order.totalPrice,
<<<<<<< HEAD
        vatRate: order.vatRate,
        vatAmount: order.vatAmount,
=======
>>>>>>> pull-1
        finderFee: order.finderFee,
        shippingAddress: order.shippingAddress,
        buyerEmail: profile?.email || 'guest@eushop.local',
        status: 'PROCESSING',
        stripePaymentIntentId: order.stripePaymentIntentId || `pi_mock_${Date.now()}`
      };
<<<<<<< HEAD

=======
      
>>>>>>> pull-1
      saveLocalOrder(newOrder);
      return newOrder;
    }
  },

  getById: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (e) {
<<<<<<< HEAD
      if (!shouldUseMock()) throw e;
=======
>>>>>>> pull-1
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
<<<<<<< HEAD
      if (!shouldUseMock()) throw e;
=======
>>>>>>> pull-1
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
<<<<<<< HEAD
      if (!shouldUseMock()) throw e;
=======
>>>>>>> pull-1
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
<<<<<<< HEAD
      if (!shouldUseMock()) throw e;
=======
>>>>>>> pull-1
      console.warn('orderAPI.updateStatus failed. Updating local browser record.');
      const orders = getLocalOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx > -1) {
        orders[idx].status = status;
<<<<<<< HEAD
=======
        localStorage.setItem('orders', JSON.stringify(orders));
>>>>>>> pull-1
        return orders[idx];
      }
      throw new Error('Order not found in simulation');
    }
  },
};
<<<<<<< HEAD
=======

>>>>>>> pull-1
