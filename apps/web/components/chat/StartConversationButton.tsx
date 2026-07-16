"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { chatService } from '../../lib/services/chatService';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/router';
import { Alert } from '../ui/Alert';
import { Dialog } from '../ui/Dialog';

interface StartConversationButtonProps {
  sellerId: string;
  sellerName: string;
  foodId?: string;
  foodName?: string;
  className?: string;
}

export const StartConversationButton: React.FC<StartConversationButtonProps> = ({
  sellerId,
  sellerName,
  foodId,
  foodName,
  className,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState(
    foodName ? `Inquiry about ${foodName}` : `Conversation with ${sellerName}`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartConversation = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request = {
        buyerId: user.id,
        sellerId,
        subject,
        ...(foodId && { foodId }),
      };

      const conversation = await chatService.createConversation(request);

      if (conversation) {
        router.push(`/chat?conversationId=${conversation.id}`);
      } else {
        setError('Failed to start conversation. Please try again.');
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Button className={className} onClick={() => router.push('/login')}>
        Message Seller
      </Button>
    );
  }

  return (
    <>
      <Button
        className={className}
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
      >
        Message Seller
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Start Conversation</Dialog.Title>
            <Dialog.Description>
              Start a conversation with {sellerName}
              {foodName && ` about ${foodName}`}
            </Dialog.Description>
          </Dialog.Header>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleStartConversation} disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Start Conversation'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};