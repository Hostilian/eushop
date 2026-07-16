/*
 * EUshop Chat Service
 * Handles all chat-related API calls with graceful degradation
 * and secure cookie authentication
 */

import { apiClient } from '../api-client';
import { ApiResponse } from '../types';

export interface Conversation {
  id: string;
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  food?: {
    id: string;
    name: string;
  };
  subject: string;
  lastMessage?: string;
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
  };
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CreateConversationRequest {
  buyerId: string;
  sellerId: string;
  subject: string;
  foodId?: string;
}

export interface SendMessageRequest {
  content: string;
}

class ChatService {
  private readonly baseUrl = '/api/conversations';

  /**
   * Get all conversations for the current user
   * @param userId - Current user ID
   * @returns Promise with conversations or empty array on failure
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<ApiResponse<Conversation[]>>(
        `/user/${userId}/active`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      // Graceful degradation: return empty array on failure
      return [];
    }
  }

  /**
   * Get conversation by ID
   * @param conversationId - Conversation ID
   * @returns Promise with conversation or null on failure
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await apiClient.get<ApiResponse<Conversation>>(
        `/${conversationId}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      return null;
    }
  }

  /**
   * Create a new conversation
   * @param request - Conversation creation request
   * @returns Promise with created conversation or null on failure
   */
  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation | null> {
    try {
      const response = await apiClient.post<ApiResponse<Conversation>>(
        '',
        request
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }

  /**
   * Get message history for a conversation
   * @param conversationId - Conversation ID
   * @returns Promise with messages or empty array on failure
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get<ApiResponse<Message[]>>(
        `/${conversationId}/messages`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  /**
   * Send a message in a conversation
   * @param conversationId - Conversation ID
   * @param request - Message content
   * @returns Promise with updated conversation or null on failure
   */
  async sendMessage(
    conversationId: string,
    request: SendMessageRequest
  ): Promise<Conversation | null> {
    try {
      const response = await apiClient.post<ApiResponse<Conversation>>(
        `/${conversationId}/messages`,
        request
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }

  /**
   * Mark conversation as read
   * @param conversationId - Conversation ID
   * @returns Promise with success status
   */
  async markAsRead(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/messages/${conversationId}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
      return false;
    }
  }

  /**
   * Close a conversation
   * @param conversationId - Conversation ID
   * @returns Promise with success status
   */
  async closeConversation(conversationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/${conversationId}`);
      return true;
    } catch (error) {
      console.error('Failed to close conversation:', error);
      return false;
    }
  }

  /**
   * Get unread message count for a conversation
   * @param conversationId - Conversation ID
   * @param userId - Current user ID
   * @returns Promise with unread count or 0 on failure
   */
  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<number>>(
        `/api/messages/${conversationId}/unread?userId=${userId}`
      );
      return response.data.data || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

export const chatService = new ChatService();