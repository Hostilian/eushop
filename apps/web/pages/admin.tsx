import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/services';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Security: Check if user has admin role before allowing access
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser && currentUser.role === 'admin') {
          setIsAuthorized(true);
          router.replace('/admin/dashboard');
        } else {
          // Security: Redirect to home if not authorized
          router.replace('/');
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);
        router.replace('/login?redirect=/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400 text-sm mb-2">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  return null;
}

