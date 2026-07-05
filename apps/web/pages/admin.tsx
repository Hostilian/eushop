import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/services';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Security: Clear session timeout
  const clearSessionTimeout = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };

  // Security: Set session timeout (15 minutes)
  const setSessionTimeout = () => {
    clearSessionTimeout();
    sessionTimeoutRef.current = setTimeout(() => {
      // Clear local storage and redirect to login
      localStorage.removeItem('userSession');
      sessionStorage.clear();
      router.push('/login?session=expired&redirect=/admin');
    }, 15 * 60 * 1000); // 15 minutes
  };

  // Security: Reset timeout on user activity
  const resetSessionTimeout = () => {
    setSessionTimeout();
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Security: Check for session in localStorage first
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);
            if (parsed.expires && Date.now() > parsed.expires) {
              localStorage.removeItem('userSession');
              throw new Error('Session expired');
            }
          } catch {
            localStorage.removeItem('userSession');
          }
        }

        // Security: Add timeout for the API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Security: Check if user has admin role before allowing access
        const currentUser = await authAPI.getCurrentUser({
          signal: controller.signal,
          headers: {
            'X-Request-ID': Math.random().toString(36).substring(2, 15)
          }
        });
        
        clearTimeout(timeoutId);

        if (currentUser && currentUser.role === 'admin') {
          // Security: Validate user object structure
          if (!currentUser.id || !currentUser.email) {
            throw new Error('Invalid user data received');
          }
          
          setIsAuthorized(true);
          
          // Security: Store session with expiration
          localStorage.setItem('userSession', JSON.stringify({
            userId: currentUser.id,
            role: currentUser.role,
            expires: Date.now() + 15 * 60 * 1000 // 15 minutes
          }));
          
          // Set up session timeout
          setSessionTimeout();
          
          // Security: Add event listeners for user activity
          window.addEventListener('mousemove', resetSessionTimeout);
          window.addEventListener('keydown', resetSessionTimeout);
          window.addEventListener('click', resetSessionTimeout);
          
          router.replace('/admin/dashboard');
        } else {
          // Security: Log unauthorized access attempt
          console.warn(`Unauthorized admin access attempt by user: ${currentUser?.id || 'unknown'}`);
          setError('You do not have permission to access the admin panel. Please contact an administrator if you believe this is an error.');
          setTimeout(() => {
            router.replace('/');
          }, 3000);
        }
      } catch (error: any) {
        // Graceful degradation: Provide user-friendly error messages
        if (error.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else if (error.message?.includes('Network') || !navigator.onLine) {
          setError('Network error. Please check your internet connection and try again.');
        } else if (error.message?.includes('Session expired')) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Authentication failed. Please log in again or contact support if the problem persists.');
        }
        console.error('Admin access check failed:', error);
        setTimeout(() => {
          router.replace('/login?redirect=/admin');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();

    // Cleanup function
    return () => {
      clearSessionTimeout();
      window.removeEventListener('mousemove', resetSessionTimeout);
      window.removeEventListener('keydown', resetSessionTimeout);
      window.removeEventListener('click', resetSessionTimeout);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400 text-sm mb-2">Verifying admin privileges...</p>
          <p className="text-gray-500 text-xs mb-4">This may take a few seconds</p>
          {/* Graceful degradation: Provide alternative actions if loading is stuck */}
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="text-primary hover:underline text-sm block mx-auto"
            >
              Refresh page
            </button>
            <button 
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-gray-300 text-xs block mx-auto"
            >
              Return to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-sans">
        <div className="text-center max-w-md p-6">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-gray-500 text-sm">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return null;
}

