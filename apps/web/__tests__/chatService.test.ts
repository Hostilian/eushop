"use client";

import { chatService } from '../lib/services/chatService';
import { apiClient } from '../lib/api-client';

// Mock the API client
jest.mock('../lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return conversations on success', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          buyer: { id: 'buyer-1', name: 'Buyer' },
          seller: { id: 'seller-1', name: 'Seller' },
          subject: 'Test conversation',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { data: mockConversations },
      });

      const result = await chatService.getConversations('buyer-1');
      expect(result).toEqual(mockConversations);
      expect(mockApiClient.get).toHaveBeenCalledWith('/user/buyer-1/active');
    });

    it('should return empty array on failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));
      const result = await chatService.getConversations('buyer-1');
      expect(result).toEqual([]);
    });
  });

  describe('getConversation', () => {
    it('should return conversation on success', async () => {
      const mockConversation = {
        id: 'conv-1',
        buyer: { id: 'buyer-1', name: 'Buyer' },
        seller: { id: 'seller-1', name: 'Seller' },
        subject: 'Test conversation',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue({
        data: { data: mockConversation },
      });

      const result = await chatService.getConversation('conv-1');
      expect(result).toEqual(mockConversation);
      expect(mockApiClient.get).toHaveBeenCalledWith('/conv-1');
    });

    it('should return null on failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));
      const result = await chatService.getConversation('conv-1');
      expect(result).toBeNull();
    });
  });

  describe('createConversation', () => {
    it('should create conversation on success', async () => {
      const mockConversation = {
        id: 'conv-1',
        buyer: { id: 'buyer-1', name: 'Buyer' },
        seller: { id: 'seller-1', name: 'Seller' },
        subject: 'Test conversation',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: { data: mockConversation },
      });

      const result = await chatService.createConversation({
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        subject: 'Test conversation',
      });

      expect(result).toEqual(mockConversation);
      expect(mockApiClient.post).toHaveBeenCalledWith('', {
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        subject: 'Test conversation',
      });
    });

    it('should return null on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));
      const result = await chatService.createConversation({
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        subject: 'Test conversation',
      });
      expect(result).toBeNull();
    });
  });

  describe('getMessages', () => {
    it('should return messages on success', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          sender: { id: 'buyer-1', name: 'Buyer' },
          content: 'Hello',
          isRead: false,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { data: mockMessages },
      });

      const result = await chatService.getMessages('conv-1');
      expect(result).toEqual(mockMessages);
      expect(mockApiClient.get).toHaveBeenCalledWith('/conv-1/messages');
    });

    it('should return empty array on failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));
      const result = await chatService.getMessages('conv-1');
      expect(result).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('should send message on success', async () => {
      const mockConversation = {
        id: 'conv-1',
        buyer: { id: 'buyer-1', name: 'Buyer' },
        seller: { id: 'seller-1', name: 'Seller' },
        subject: 'Test conversation',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: { data: mockConversation },
      });

      const result = await chatService.sendMessage('conv-1', {
        content: 'Hello',
      });

      expect(result).toEqual(mockConversation);
      expect(mockApiClient.post).toHaveBeenCalledWith('/conv-1/messages', {
        content: 'Hello',
      });
    });

    it('should return null on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));
      const result = await chatService.sendMessage('conv-1', {
        content: 'Hello',
      });
      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should return true on success', async () => {
      mockApiClient.post.mockResolvedValue({});
      const result = await chatService.markAsRead('conv-1');
      expect(result).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/messages/conv-1/read');
    });

    it('should return false on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));
      const result = await chatService.markAsRead('conv-1');
      expect(result).toBe(false);
    });
  });

  describe('closeConversation', () => {
    it('should return true on success', async () => {
      mockApiClient.delete.mockResolvedValue({});
      const result = await chatService.closeConversation('conv-1');
      expect(result).toBe(true);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/conv-1');
    });

    it('should return false on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Network error'));
      const result = await chatService.closeConversation('conv-1');
      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count on success', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { data: 5 },
      });
      const result = await chatService.getUnreadCount('conv-1', 'user-1');
      expect(result).toBe(5);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/messages/conv-1/unread?userId=user-1');
    });

    it('should return 0 on failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));
      const result = await chatService.getUnreadCount('conv-1', 'user-1');
      expect(result).toBe(0);
    });
  });
});