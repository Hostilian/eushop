import AsyncStorage from '@react-native-async-storage/async-storage';
import { foodAPI } from './foodService';

const PRODUCT_LIST_KEY = 'offline_product_list';

class OfflineStorageService {
  async getProducts(): Promise<any[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(PRODUCT_LIST_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to fetch products from storage', e);
      return [];
    }
  }

  async syncProducts() {
    try {
      const products = await foodAPI.searchWithOrigin(undefined, undefined, 1, 100);
      const jsonValue = JSON.stringify(products.data);
      await AsyncStorage.setItem(PRODUCT_LIST_KEY, jsonValue);
      console.log('Products synced to offline storage');
    } catch (e) {
      console.error('Failed to sync products', e);
    }
  }
}

export const offlineStorageService = new OfflineStorageService();
