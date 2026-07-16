"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Conversation } from '../../lib/services/chatService';
import { useAuth } from '../../lib/auth';
import { chatService } from '../../lib/services/chatService';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Alert } from '../ui/Alert';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load conversations with retry logic
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await chatService.getConversations(user.id);
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Set up polling for new conversations
    const interval = setInterval(() => {
      loadConversations();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, retryCount]);

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
  };

  if (loading && conversations.length === 0) {
    return <ConversationListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
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

  if (conversations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2 p-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
};

const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ conversation, isSelected, onClick }) => {
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">
              {conversation.seller.name}
            </h3>
            {conversation.food && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full truncate">
                {conversation.food.name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate mt-1">
            {conversation.lastMessage || conversation.subject}
          </p>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
          {formatTime(conversation.lastMessageAt)}
        </div>
      </div>
    </div>
  );
};

const ConversationListSkeleton = () => {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-3 rounded-lg">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full">
      <div className="text-4xl mb-4">💬</div>
      <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Start a conversation with sellers or buyers to get started
      </p>
      <Link href="/search" className="mt-4">
        <Button variant="outline">Browse Foods</Button>
      </Link>
    </div>
  );
};