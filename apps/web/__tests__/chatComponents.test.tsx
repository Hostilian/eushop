"use client";

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConversationList } from '../components/chat/ConversationList';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { ChatContainer } from '../components/chat/ChatContainer';
import { StartConversationButton } from '../components/chat/StartConversationButton';
import { useAuth } from '../lib/auth';
import { chatService } from '../lib/services/chatService';

// Mock the dependencies
jest.mock('../lib/auth');
jest.mock('../lib/services/chatService');

const mockUseAuth = useAuth as jest.Mock;
const mockChatService = chatService as jest.Mocked<typeof chatService>;

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
};

const mockConversations = [
  {
    id: 'conv-1',
    buyer: { id: 'user-1', name: 'Test User' },
    seller: { id: 'seller-1', name: 'Test Seller' },
    subject: 'Test conversation 1',
    lastMessage: 'Hello there',
    lastMessageAt: '2023-01-01T12:00:00Z',
    isActive: true,
    createdAt: '2023-01-01T10:00:00Z',
  },
  {
    id: 'conv-2',
    buyer: { id: 'user-1', name: 'Test User' },
    seller: { id: 'seller-2', name: 'Another Seller' },
    subject: 'Test conversation 2',
    lastMessage: 'How are you?',
    lastMessageAt: '2023-01-02T12:00:00Z',
    isActive: true,
    createdAt: '2023-01-02T10:00:00Z',
  },
];

const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    sender: { id: 'seller-1', name: 'Test Seller' },
    content: 'Hello there',
    isRead: false,
    createdAt: '2023-01-01T12:00:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    sender: { id: 'user-1', name: 'Test User' },
    content: 'Hi! How are you?',
    isRead: true,
    createdAt: '2023-01-01T12:05:00Z',
  },
];

describe('Chat Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  describe('ConversationList', () => {
    it('should render loading state', () => {
      mockChatService.getConversations.mockImplementation(() => new Promise(() => {}));
      render(<ConversationList onSelectConversation={jest.fn()} />);
      expect(screen.getByText(/loading conversations/i)).toBeInTheDocument();
    });

    it('should render conversations', async () => {
      mockChatService.getConversations.mockResolvedValue(mockConversations);
      render(<ConversationList onSelectConversation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Test Seller')).toBeInTheDocument();
        expect(screen.getByText('Hello there')).toBeInTheDocument();
        expect(screen.getByText('Another Seller')).toBeInTheDocument();
      });
    });

    it('should render empty state', async () => {
      mockChatService.getConversations.mockResolvedValue([]);
      render(<ConversationList onSelectConversation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
      });
    });

    it('should render error state', async () => {
      mockChatService.getConversations.mockRejectedValue(new Error('Failed'));
      render(<ConversationList onSelectConversation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load conversations/i)).toBeInTheDocument();
      });
    });
  });

  describe('MessageList', () => {
    it('should render loading state', () => {
      mockChatService.getMessages.mockImplementation(() => new Promise(() => {}));
      render(<MessageList conversationId="conv-1" />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render messages', async () => {
      mockChatService.getMessages.mockResolvedValue(mockMessages);
      render(<MessageList conversationId="conv-1" />);

      await waitFor(() => {
        expect(screen.getByText('Hello there')).toBeInTheDocument();
        expect(screen.getByText('Hi! How are you?')).toBeInTheDocument();
      });
    });

    it('should render empty state', async () => {
      mockChatService.getMessages.mockResolvedValue([]);
      render(<MessageList conversationId="conv-1" />);

      await waitFor(() => {
        expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
      });
    });

    it('should render error state', async () => {
      mockChatService.getMessages.mockRejectedValue(new Error('Failed'));
      render(<MessageList conversationId="conv-1" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
      });
    });
  });

  describe('MessageInput', () => {
    it('should disable send button when input is empty', () => {
      render(<MessageInput conversationId="conv-1" />);
      const sendButton = screen.getByText('Send');
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when input has content', () => {
      render(<MessageInput conversationId="conv-1" />);
      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      const sendButton = screen.getByText('Send');
      expect(sendButton).not.toBeDisabled();
    });

    it('should show error when sending fails', async () => {
      mockChatService.sendMessage.mockRejectedValue(new Error('Failed'));
      render(<MessageInput conversationId="conv-1" />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello' } });

      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
      });
    });
  });

  describe('ChatContainer', () => {
    it('should render conversation list and empty message area', async () => {
      mockChatService.getConversations.mockResolvedValue(mockConversations);
      mockChatService.getConversation.mockResolvedValue(mockConversations[0]);
      mockChatService.getMessages.mockResolvedValue(mockMessages);

      render(<ChatContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Seller')).toBeInTheDocument();
        expect(screen.getByText('Select a conversation')).toBeInTheDocument();
      });
    });

    it('should show conversation when selected', async () => {
      mockChatService.getConversations.mockResolvedValue(mockConversations);
      mockChatService.getConversation.mockResolvedValue(mockConversations[0]);
      mockChatService.getMessages.mockResolvedValue(mockMessages);

      render(<ChatContainer />);

      await waitFor(() => {
        const conversationItem = screen.getByText('Test Seller');
        fireEvent.click(conversationItem);
      });

      await waitFor(() => {
        expect(screen.getByText('Hello there')).toBeInTheDocument();
      });
    });
  });

  describe('StartConversationButton', () => {
    it('should redirect to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });
      const mockRouter = { push: jest.fn() };
      jest.mock('next/router', () => ({ useRouter: () => mockRouter }));

      render(
        <StartConversationButton
          sellerId="seller-1"
          sellerName="Test Seller"
        />
      );

      const button = screen.getByText('Message Seller');
      fireEvent.click(button);

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should open dialog when user is authenticated', () => {
      render(
        <StartConversationButton
          sellerId="seller-1"
          sellerName="Test Seller"
        />
      );

      const button = screen.getByText('Message Seller');
      fireEvent.click(button);

      expect(screen.getByText(/start conversation/i)).toBeInTheDocument();
    });
  });
});