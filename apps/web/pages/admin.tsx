import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to the admin dashboard
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-sans">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2 animate-pulse">Redirecting to Compliance Dashboard...</p>
      </div>
    </div>
  );
}

