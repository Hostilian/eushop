"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Textarea } from '../ui/Textarea';
import { Alert } from '../ui/Alert';
import { chatService } from '../../lib/services/chatService';
import { websocketService } from '../../lib/services/websocketService';
import { MoreVertical, Edit, Trash2, Copy, Reply } from 'lucide-react';

interface MessageActionsProps {
  message: {
    id: string;
    content: string;
    sender: { id: string };
    createdAt: string;
  };
  isCurrentUser: boolean;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  isCurrentUser,
  onEdit,
  onDelete,
  onReply,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await chatService.editMessage(message.id, editedContent);
      if (success) {
        if (onEdit) {
          onEdit(editedContent);
        }
        setShowEditDialog(false);
      } else {
        setError('Failed to edit message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
      setError('Failed to edit message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await chatService.deleteMessage(message.id);
      if (success) {
        if (onDelete) {
          onDelete();
        }
        setShowDeleteDialog(false);
      } else {
        setError('Failed to delete message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowActions(false);
  };

  const handleReply = () => {
    if (onReply) {
      onReply();
    }
    setShowActions(false);
  };

  if (!isCurrentUser) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        aria-label="Message actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showActions && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                setShowEditDialog(true);
                setShowActions(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            <button
              onClick={() => {
                setShowDeleteDialog(true);
                setShowActions(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              <Copy className="h-4 w-4" /> Copy
            </button>
            <button
              onClick={handleReply}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              <Reply className="h-4 w-4" /> Reply
            </button>
          </div>
        </div>
      )}

      {/* Edit Message Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <Dialog.Content className="max-w-md w-full">
          <Dialog.Header>
            <Dialog.Title>Edit Message</Dialog.Title>
          </Dialog.Header>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          <div className="py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full"
              rows={5}
            />
          </div>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isLoading || !editedContent.trim()}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      {/* Delete Message Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Content className="max-w-md w-full">
          <Dialog.Header>
            <Dialog.Title>Delete Message</Dialog.Title>
          </Dialog.Header>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this message? This cannot be undone.
            </p>
          </div>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Message'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};