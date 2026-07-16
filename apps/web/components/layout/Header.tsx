"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { Button } from '../ui/Button';
import { ChatHeader } from '../chat/ChatHeader';

export const Header: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-brand-dark">
              EUshop
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/search" className="text-gray-700 hover:text-brand-dark">
              Browse
            </Link>
            <Link href="/become-seller" className="text-gray-700 hover:text-brand-dark">
              Sell on EUshop
            </Link>
            <Link href="/docs" className="text-gray-700 hover:text-brand-dark">
              Docs
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Chat icon */}
            <ChatHeader />

            {/* Auth buttons */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <Link href="/account">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.name?.charAt(0) || 'A'}
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};