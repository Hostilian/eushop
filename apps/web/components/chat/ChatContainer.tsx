"use client";

import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { WebSocketStatus } from './WebSocketStatus';
import { Conversation } from '../../lib/services/chatService';
import { chatService } from '../../lib/services/chatService';
import { websocketService } from '../../lib/services/websocketService';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Alert } from '../ui/Alert';
import { GroupChatCreator } from './GroupChatCreator';
import { GroupChatInfo } from './GroupChatInfo';
import { Plus } from 'lucide-react';

interface ChatContainerProps {
  initialConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  initialConversationId,
  onConversationSelect,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const handleSelectConversation = async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const conversation = await chatService.getConversation(conversationId);
      setSelectedConversation(conversation);
      setSelectedConversationId(conversationId);
      if (onConversationSelect) {
        onConversationSelect(conversationId);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = () => {
    // Refresh the conversation to get the latest messages
    if (selectedConversationId) {
      handleSelectConversation(selectedConversationId);
    }
  };

  return (
    <div className="flex h-[600px] max-h-[80vh] w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGroupCreator(true)}
            aria-label="Create group chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId}
        />
      </div>

      {/* Group Chat Creator */}
      {showGroupCreator && (
        <GroupChatCreator
          onGroupCreated={(groupId) => {
            setShowGroupCreator(false);
            handleSelectConversation(groupId);
          }}
          onClose={() => setShowGroupCreator(false)}
        />
      )}

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {loading && !selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-16 w-3/4" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </div>
        ) : selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.isGroup
                    ? selectedConversation.groupName
                    : selectedConversation.seller.name}
                </h3>
                {selectedConversation.isGroup ? (
                  <p className="text-sm text-gray-500">
                    Group conversation with {selectedConversation.participants?.length || 0} members
                  </p>
                ) : selectedConversation.food && (
                  <p className="text-sm text-gray-500">
                    {selectedConversation.food.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {selectedConversation.isGroup && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGroupInfo(true)}
                  >
                    Group Info
                  </Button>
                )}
                <WebSocketStatus />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversationId(undefined)}
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Group Chat Info */}
            {showGroupInfo && selectedConversation && (
              <GroupChatInfo
                conversationId={selectedConversation.id}
                onClose={() => setShowGroupInfo(false)}
              />
            )}

            <MessageList
              conversationId={selectedConversationId}
              onNewMessage={handleNewMessage}
            />

            <MessageInput
              conversationId={selectedConversationId}
              onMessageSent={handleNewMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-sm text-gray-500">
                Choose an existing conversation or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};