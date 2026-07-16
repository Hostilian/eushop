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
  reactions?: Record<string, number>;
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

  /**
   * Search messages in a conversation
   * @param conversationId - Conversation ID
   * @param query - Search query
   * @returns Promise with matching messages
   */
  async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    try {
      const response = await apiClient.get<ApiResponse<Message[]>>(
        `/api/conversations/${conversationId}/messages/search?q=${encodeURIComponent(query)}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search messages:', error);
      return [];
    }
  }

  /**
   * Create a group conversation
   * @param request - Group creation request
   * @returns Promise with created group conversation
   */
  async createGroupConversation(request: {
    name: string;
    description?: string;
    participantIds: string[];
    createdBy: string;
  }): Promise<Conversation | null> {
    try {
      const response = await apiClient.post<ApiResponse<Conversation>>(
        '/api/conversations/group',
        request
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to create group conversation:', error);
      return null;
    }
  }

  /**
   * Get group information
   * @param conversationId - Conversation ID
   * @returns Promise with group information
   */
  async getGroupInfo(conversationId: string): Promise<{
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    participants: User[];
    isGroup: boolean;
    createdBy: string;
  } | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/conversations/${conversationId}/group-info`
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to get group info:', error);
      return null;
    }
  }

  /**
   * Update group information
   * @param conversationId - Conversation ID
   * @param request - Update request
   * @returns Promise with updated group information
   */
  async updateGroupInfo(
    conversationId: string,
    request: { name: string; description?: string }
  ): Promise<{
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  } | null> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/api/conversations/${conversationId}/group-info`,
        request
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to update group info:', error);
      return null;
    }
  }

  /**
   * Add participants to a group
   * @param conversationId - Conversation ID
   * @param participantIds - Array of user IDs to add
   * @returns Promise with success status
   */
  async addGroupParticipants(conversationId: string, participantIds: string[]): Promise<boolean> {
    try {
      await apiClient.post(`/api/conversations/${conversationId}/participants`, {
        participantIds
      });
      return true;
    } catch (error) {
      console.error('Failed to add group participants:', error);
      return false;
    }
  }

  /**
   * Remove participant from a group
   * @param conversationId - Conversation ID
   * @param userId - User ID to remove
   * @returns Promise with success status
   */
  async removeGroupParticipant(conversationId: string, userId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/conversations/${conversationId}/participants/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove group participant:', error);
      return false;
    }
  }

  /**
   * Leave a group conversation
   * @param conversationId - Conversation ID
   * @returns Promise with success status
   */
  async leaveGroupConversation(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/conversations/${conversationId}/leave`);
      return true;
    } catch (error) {
      console.error('Failed to leave group conversation:', error);
      return false;
    }
  }

  /**
   * Edit a message
   * @param messageId - Message ID
   * @param newContent - New message content
   * @returns Promise with success status
   */
  async editMessage(messageId: string, newContent: string): Promise<boolean> {
    try {
      await apiClient.put(`/api/messages/${messageId}`, { content: newContent });
      return true;
    } catch (error) {
      console.error('Failed to edit message:', error);
      return false;
    }
  }

  /**
   * Delete a message
   * @param messageId - Message ID
   * @returns Promise with success status
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/messages/${messageId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }
}

export const chatService = new ChatService();