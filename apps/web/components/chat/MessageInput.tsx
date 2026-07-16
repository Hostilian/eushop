"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { chatService } from '../../lib/services/chatService';
import { Alert } from '../ui/Alert';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onMessageSent,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const result = await chatService.sendMessage(conversationId, {
        content: content.trim(),
      });

      if (result) {
        setContent('');
        if (onMessageSent) {
          onMessageSent();
        }
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 min-h-[44px] resize-none"
          rows={1}
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!content.trim() || isSending}
          className="self-end"
        >
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </form>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};