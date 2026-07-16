"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { chatService } from '../../lib/services/chatService';
import { useAuth } from '../../lib/auth';

export const ChatHeader: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadUnreadCount = async () => {
      try {
        setLoading(true);
        // This is a simplified approach - in a real app, you'd get the count from a dedicated endpoint
        // For now, we'll just check if there are any active conversations
        const conversations = await chatService.getConversations(user.id);
        setUnreadCount(conversations.length);
      } catch (err) {
        console.error('Failed to load unread count:', err);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user || loading) {
    return null;
  }

  return (
    <Link href="/chat" className="relative">
      <div className="text-2xl">💬</div>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};