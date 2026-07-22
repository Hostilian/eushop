"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { chatService } from '../../lib/services/chatService';
import { websocketService } from '../../lib/services/websocketService';
import { Alert } from '../ui/Alert';
import { FileAttachment } from './FileAttachment';
import { File, X } from 'lucide-react';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
}

interface Attachment {
  url: string;
  name: string;
  preview?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onMessageSent,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Handle typing indicators
  useEffect(() => {
    if (!content.trim()) return undefined;

    const typingTimeout = setTimeout(() => {
      websocketService.sendTyping(conversationId, false);
    }, 3000);

    return () => clearTimeout(typingTimeout);
  }, [content, conversationId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    websocketService.sendTyping(conversationId, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      // Send message with attachments
      const messageContent = attachments.length > 0
        ? `${content.trim()}\n\n${attachments.map(a => `[Attachment: ${a.name}](${a.url})`).join('\n')}`
        : content.trim();

      await websocketService.sendMessage(conversationId, messageContent);
      setContent('');
      setAttachments([]);
      websocketService.sendTyping(conversationId, false);
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');

      // Fallback to REST API
      try {
        const result = await chatService.sendMessage(conversationId, {
          content: content.trim(),
        });
        if (result) {
          setContent('');
          if (onMessageSent) {
            onMessageSent();
          }
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
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
        <div className="flex-1 flex flex-col">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 text-xs">
                    {attachment.preview ? (
                      <img src={attachment.preview} alt={attachment.name} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <File className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="truncate max-w-[100px]">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Remove attachment"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <FileAttachment
              conversationId={conversationId}
              onFileUpload={(url, name) => {
                const fileAttachment: Attachment = { url, name };
                // Create preview for images
                if (name.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
                  fileAttachment.preview = url;
                }
                setAttachments([...attachments, fileAttachment]);
              }}
            />
            <Textarea
              value={content}
              onChange={handleContentChange}
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
          </div>
        </div>
        <Button
          type="submit"
          disabled={(!content.trim() && attachments.length === 0) || isSending}
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
