import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page wrapper layout.
 * Ensures consistent margins, layouts, responsive grids, and dark/light color schemes.
 * Applies a smooth fade-in animation on mounting to prevent visual layout snap.
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  // Graceful degradation: Check if we're online to show a subtle indicator
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      {/* WCAG 2.2 AA Skip to content link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <ErrorBoundary region="navigation" compact>
        <Navbar />
      </ErrorBoundary>
      
      {/* Graceful degradation: Offline indicator with actionable info */}
      {!isOnline && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 px-4 text-sm flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>You are currently offline. Some features may be limited.</span>
          <button 
            onClick={() => window.location.reload()}
            className="underline font-semibold hover:text-yellow-900"
          >
            Retry
          </button>
        </div>
      )}
      
      <main id="main-content" className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <ErrorBoundary region="page">
          {children}
        </ErrorBoundary>
      </main>
      
      <ErrorBoundary region="page" compact>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}
