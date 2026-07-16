"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Alert } from '../ui/Alert';
import { chatService } from '../../lib/services/chatService';
import { useAuth } from '../../lib/auth';
import { UserAvatar } from '../../components/user/UserAvatar';
import { UserSearch } from '../../components/user/UserSearch';
import { User } from '../../lib/types';

interface GroupChatInfoProps {
  conversationId: string;
  onClose?: () => void;
}

export const GroupChatInfo: React.FC<GroupChatInfoProps> = ({
  conversationId,
  onClose,
}) => {
  const { user } = useAuth();
  const [groupInfo, setGroupInfo] = useState<{
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    participants: User[];
    isGroup: boolean;
    createdBy: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newParticipants, setNewParticipants] = useState<User[]>([]);

  useEffect(() => {
    const loadGroupInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const info = await chatService.getGroupInfo(conversationId);
        setGroupInfo(info);
        setEditedName(info?.name || '');
        setEditedDescription(info?.description || '');
      } catch (err) {
        console.error('Failed to load group info:', err);
        setError('Failed to load group information');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupInfo();
  }, [conversationId]);

  const handleSaveChanges = async () => {
    if (!groupInfo) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedInfo = await chatService.updateGroupInfo(conversationId, {
        name: editedName,
        description: editedDescription,
      });

      if (updatedInfo) {
        setGroupInfo({ ...groupInfo, ...updatedInfo });
        setIsEditing(false);
      } else {
        setError('Failed to update group information');
      }
    } catch (err) {
      console.error('Failed to update group:', err);
      setError('Failed to update group information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipants = async () => {
    if (!groupInfo || newParticipants.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const participantIds = newParticipants.map(p => p.id);
      const result = await chatService.addGroupParticipants(conversationId, participantIds);

      if (result) {
        setGroupInfo({
          ...groupInfo,
          participants: [...groupInfo.participants, ...newParticipants],
        });
        setNewParticipants([]);
      } else {
        setError('Failed to add participants');
      }
    } catch (err) {
      console.error('Failed to add participants:', err);
      setError('Failed to add participants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!groupInfo) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await chatService.removeGroupParticipant(conversationId, userId);

      if (result) {
        setGroupInfo({
          ...groupInfo,
          participants: groupInfo.participants.filter(p => p.id !== userId),
        });
      } else {
        setError('Failed to remove participant');
      }
    } catch (err) {
      console.error('Failed to remove participant:', err);
      setError('Failed to remove participant');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !groupInfo) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <Dialog.Content className="max-w-md w-full">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </Dialog.Content>
      </Dialog>
    );
  }

  if (!groupInfo) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <Dialog.Content className="max-w-md w-full">
          <Dialog.Header>
            <Dialog.Title>Group Information</Dialog.Title>
          </Dialog.Header>
          <div className="py-8 text-center">
            <p className="text-gray-500">Group not found</p>
          </div>
          <Dialog.Footer>
            <Button onClick={onClose}>Close</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );
  }

  const isAdmin = groupInfo.createdBy === user?.id;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <Dialog.Content className="max-w-md w-full">
        <Dialog.Header>
          <Dialog.Title>
            {isEditing ? 'Edit Group' : 'Group Information'}
          </Dialog.Title>
        </Dialog.Header>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {/* Group Image */}
          <div className="flex justify-center">
            <UserAvatar
              name={groupInfo.name}
              src={groupInfo.imageUrl}
              size="xl"
              className="w-24 h-24 text-2xl"
            />
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            {isEditing ? (
              <Input
                label="Group name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                {groupInfo.name}
              </div>
            )}
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Description
            </label>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full"
                rows={3}
              />
            ) : (
              <div className="p-2 border border-gray-200 rounded-md bg-gray-50 min-h-[72px]">
                {groupInfo.description || 'No description'}
              </div>
            )}
          </div>

          {/* Participants */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Participants ({groupInfo.participants.length})
              </label>
              {isAdmin && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groupInfo.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={participant.name} src={participant.avatar} size="sm" />
                    <span className="text-sm">{participant.name}</span>
                    {participant.id === groupInfo.createdBy && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Admin</span>
                    )}
                  </div>
                  {isAdmin && participant.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Participants (Admin only) */}
          {isEditing && isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Participants
              </label>
              <div className="flex gap-2">
                <UserSearch
                  onSelect={setNewParticipants}
                  selectedUsers={newParticipants}
                  excludeUserIds={[
                    ...(user ? [user.id] : []),
                    ...groupInfo.participants.map(p => p.id),
                  ]}
                  placeholder="Search users to add"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddParticipants}
                  disabled={newParticipants.length === 0 || isLoading}
                >
                  Add
                </Button>
              </div>
              {newParticipants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newParticipants.map((user) => (
                    <div key={user.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm">
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => setNewParticipants(newParticipants.filter(u => u.id !== user.id))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Dialog.Footer>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(groupInfo.name);
                  setEditedDescription(groupInfo.description);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading || !editedName.trim()}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
