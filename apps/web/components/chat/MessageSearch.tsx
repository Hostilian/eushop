"use client";

import React, { useState, useEffect } from 'react';
import { chatService } from '../../lib/services/chatService';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Message } from '../../lib/services/chatService';
import { Alert } from '../ui/Alert';

interface MessageSearchProps {
  conversationId: string;
  onSelectMessage?: (messageId: string) => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  conversationId,
  onSelectMessage,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [query, conversationId]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await chatService.searchMessages(conversationId, query);
      setResults(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search messages. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        label="Search messages"
        type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!query.trim() || loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200 text-xs font-medium text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((message) => (
            <div
              key={message.id}
              className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectMessage?.(message.id)}
            >
              <div className="text-sm text-gray-600 mb-1">
                {new Date(message.createdAt).toLocaleString()}
              </div>
              <div className="text-sm">
                {message.content.length > 100
                  ? `${message.content.substring(0, 100)}...`
                  : message.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query.trim() && !loading && !error && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No messages found matching your search
        </div>
      )}
    </div>
  );
};
