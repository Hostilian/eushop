"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { User } from '../../lib/types';
import { userService } from '../../lib/services/userService';
import { UserAvatar } from './UserAvatar';

interface UserSearchProps {
  onSelect: (users: User[]) => void;
  selectedUsers: User[];
  excludeUserIds?: string[];
  placeholder?: string;
  className?: string;
  maxResults?: number;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  onSelect,
  selectedUsers,
  excludeUserIds = [],
  placeholder = 'Search users...',
  className = '',
  maxResults = 5,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await userService.searchUsers(query, excludeUserIds);
      setResults(searchResults.slice(0, maxResults));
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const isAlreadySelected = selectedUsers.some(u => u.id === user.id);
    if (isAlreadySelected) {
      onSelect(selectedUsers.filter(u => u.id !== user.id));
    } else {
      onSelect([...selectedUsers, user]);
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {loading && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-2">
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((user) => {
            const isSelected = selectedUsers.some(u => u.id === user.id);
            return (
              <div
                key={user.id}
                className={`p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <UserAvatar name={user.name} src={user.avatar} size="sm" />
                <span className="text-sm">{user.name}</span>
                {isSelected && <span className="text-xs text-green-600 ml-auto">✓ Selected</span>}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};