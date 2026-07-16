"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../lib/services/chatService';
import { chatService } from '../../lib/services/chatService';
import { useAuth } from '../../lib/auth';
import { Skeleton } from '../ui/Skeleton';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

interface MessageListProps {
  conversationId: string;
  onNewMessage?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversationId,
  onNewMessage,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages with retry logic
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await chatService.getMessages(conversationId);
        setMessages(data);

        // Mark as read when messages are loaded
        if (data.length > 0) {
          await chatService.markAsRead(conversationId);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      loadMessages();
    }

    // Set up polling for new messages
    const interval = setInterval(() => {
      if (conversationId) {
        loadMessages();
      }
    }, 5000); // Poll every 5 seconds for new messages

    return () => clearInterval(interval);
  }, [conversationId, retryCount]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0 && onNewMessage) {
      onNewMessage();
    }
  }, [messages, onNewMessage]);

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
  };

  if (loading && messages.length === 0) {
    return <MessageListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 h-full flex flex-col justify-center">
        <Alert variant="destructive" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <Button onClick={handleRetry} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={message.sender.id === user?.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const MessageItem: React.FC<{
  message: Message;
  isCurrentUser: boolean;
}> = ({ message, isCurrentUser }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
          isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-xs opacity-70">
            {formatTime(message.createdAt)}
          </span>
          {isCurrentUser && message.isRead && (
            <span className="ml-1 text-xs opacity-70">✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-start">
          <Skeleton className="h-16 w-3/4" />
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full">
      <div className="text-4xl mb-4">💬</div>
      <h3 className="font-medium text-gray-900 mb-2">No messages yet</h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Start the conversation by sending a message
      </p>
    </div>
  );
};