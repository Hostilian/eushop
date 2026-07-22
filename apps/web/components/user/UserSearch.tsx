import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types';
import { userService } from '@/lib/services/userService';

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

  const performSearch = useCallback(async () => {
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
  }, [query, excludeUserIds, maxResults]);

  useEffect(() => {
    let cleanup: () => void = () => {};
    if (!query.trim()) {
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => {
        setResults([]);
      }, 0);
    } else {
      const handler = setTimeout(() => {
        performSearch();
      }, 300);
      cleanup = () => clearTimeout(handler);
    }

    return cleanup;
  }, [query, performSearch]);

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
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                className={`p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
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