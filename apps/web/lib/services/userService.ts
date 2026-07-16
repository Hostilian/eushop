"use client";

import { apiClient } from '../api-client';
import { User } from '../types';

class UserService {
  /**
   * Search users
   * @param query - Search query
   * @param excludeIds - User IDs to exclude from results
   * @returns Promise with matching users
   */
  async searchUsers(query: string, excludeIds: string[] = []): Promise<User[]> {
    try {
      const response = await apiClient.get('/api/users/search', {
        params: {
          q: query,
          exclude: excludeIds.join(','),
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns Promise with user or null
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }
}

export const userService = new UserService();