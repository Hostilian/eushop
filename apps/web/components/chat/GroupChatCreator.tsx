"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Dialog } from '../ui/Dialog';
import { Alert } from '../ui/Alert';
import { chatService } from '../../lib/services/chatService';
import { useAuth } from '../../lib/auth';
import { UserSearch } from '../../components/user/UserSearch';
import { User } from '../../lib/types';

interface GroupChatCreatorProps {
  onGroupCreated?: (groupId: string) => void;
  onClose?: () => void;
}

export const GroupChatCreator: React.FC<GroupChatCreatorProps> = ({
  onGroupCreated,
  onClose,
}) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedUsers.length < 1) {
      setError('Please select at least one participant');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create group conversation
      const groupConversation = await chatService.createGroupConversation({
        name: groupName.trim(),
        description: groupDescription.trim(),
        participantIds: [user?.id, ...selectedUsers.map(u => u.id)],
        createdBy: user?.id,
      });

      if (groupConversation) {
        if (onGroupCreated) {
          onGroupCreated(groupConversation.id);
        }
      } else {
        setError('Failed to create group. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (users: User[]) => {
    setSelectedUsers(users);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <Dialog.Content className="max-w-md w-full">
        <Dialog.Header>
          <Dialog.Title>Create Group Chat</Dialog.Title>
          <Dialog.Description>
            Create a new group conversation with multiple participants
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
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Group Description
            </label>
            <Textarea
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Participants *
            </label>
            <UserSearch
              onSelect={handleUserSelect}
              selectedUsers={selectedUsers}
              excludeUserIds={[user?.id]}
              placeholder="Search users to add to group"
            />

            {selectedUsers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Remove user"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog.Footer>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim() || selectedUsers.length < 1}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};