import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { authAPI, User } from '../lib/services';

export default function GDPRPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cookieConsent, setCookieConsent] = useState({ analytics: false, marketing: false });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/login?redirect=/gdpr');
        }
      } catch (error) {
        router.push('/login?redirect=/gdpr');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    // Read cookie preferences
    if (typeof window !== 'undefined') {
      const consentStr = localStorage.getItem('cookieConsent');
      if (consentStr) {
        try {
          const parsed = JSON.parse(consentStr);
          setCookieConsent({
            analytics: !!parsed.analytics,
            marketing: !!parsed.marketing,
          });
        } catch {
          // ignore
        }
      }
    }
  }, [router]);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await authAPI.exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eushop-data-portability-${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg('Your personal data archive was successfully compiled and downloaded.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setError('');
    try {
      // Graceful degradation: Check if we can make API calls
      if (!navigator.onLine) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      await authAPI.deleteAccount(user.id);
      
      // Graceful degradation: Try to clean up local storage, but don't fail if it's not available
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('userSession');
      } catch (storageErr) {
        console.warn('Failed to clean up local storage:', storageErr);
      }
      
      try {
        sessionStorage.clear();
      } catch (sessionErr) {
        console.warn('Failed to clear session storage:', sessionErr);
      }
      
      // Redirect to home page with a success message
      router.push('/?message=account_deleted');
    } catch (err: any) {
      // Graceful degradation: Provide user-friendly error messages
      if (err.message?.includes('Network') || !navigator.onLine) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (err.response?.status === 423) {
        setError('Account deletion is temporarily locked. Please contact support.');
      } else {
        setError(err.response?.data?.message || 'We couldn\'t process your erasure request at this time. Please try again later or contact support.');
      }
      
      setDeleting(false);
      setShowDeleteConfirm(false);
      console.error('Account deletion error:', err);
    }
  };

  const handleCookieChange = async (type: 'analytics' | 'marketing') => {
    // Security: Validate input
    if (type !== 'analytics' && type !== 'marketing') {
      console.error('Invalid cookie consent type');
      return;
    }

    const updated = {
      ...cookieConsent,
      [type]: !cookieConsent[type],
    };
    setCookieConsent(updated);

    // Security: Use try-catch for localStorage operations
    try {
      const fullPrefs = {
        essential: true,
        analytics: updated.analytics,
        marketing: updated.marketing,
        timestamp: Date.now(), // Add timestamp for versioning
      };
      localStorage.setItem('cookieConsent', JSON.stringify(fullPrefs));
    } catch (error) {
      console.error('Failed to save cookie consent to localStorage:', error);
      setError('Failed to save your preferences. Please try again.');
      return;
    }

    if (user) {
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        // Security: Validate user.id before sending to API
        if (!/^[a-zA-Z0-9-]+$/.test(user.id)) {
          throw new Error('Invalid user ID format');
        }
        await authAPI.recordConsent(user.id, `cookie_${type}`, currentDate, updated[type]);
      } catch (err) {
        console.error('Failed to log consent change on server:', err);
        // Don't show error to user for background logging failures
      }
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 font-display">
          GDPR Privacy & Compliance Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          At EUshop, we fully support your rights under the EU General Data Protection Regulation (GDPR). 
          Manage your personal data, export your portability archives, or request erasure below.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl text-green-700 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
            <span>✓</span> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Rights summary card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-4 font-display flex items-center gap-2">
              <span>🛡</span> Your GDPR Rights
            </h2>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-2">
                <span className="text-primary font-bold">15</span>
                <div>
                  <strong className="text-gray-800 dark:text-gray-200 block">Right of Access</strong>
                  Review the exact information we maintain about you.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">17</span>
                <div>
                  <strong className="text-gray-800 dark:text-gray-200 block">Right to Erasure ("Forgotten")</strong>
                  Anonymise personal details from active systems.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">20</span>
                <div>
                  <strong className="text-gray-800 dark:text-gray-200 block">Right to Data Portability</strong>
                  Download a complete, machine-readable JSON copy of your profile.
                </div>
              </li>
            </ul>
          </div>

          {/* Manage Portability & Erasure */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2 font-display">
                  Portability & Export (Art. 20)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Download a structured, JSON formatted export containing your account registration, contact information, role status, and compliance metadata.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleExport}
                loading={exporting}
                fullWidth
              >
                Download My Data Portability Archive
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 font-display">
                  Erasure & Account Deletion (Art. 17)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Permanently wipe your email, name, address, and login credentials. Order record statistics are preserved anonymously to meet mandatory EU fiscal audit requirements.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                fullWidth
              >
                Request Account Erasure
              </Button>
            </div>
          </div>
        </div>

        {/* Consent preferences */}
        <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-4 font-display">
            Consent & Cookies
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
              <div>
                <span className="font-semibold block text-sm">Essential Cookies</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Required for session authentication and secure basket checking. Cannot be disabled.</span>
              </div>
              <span className="text-xs font-bold text-green-600 uppercase">Always Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
              <div>
                <span className="font-semibold block text-sm">Analytics & Improvements</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Helps us measure site traffic and optimize user interfaces.</span>
              </div>
              <input
                type="checkbox"
                checked={cookieConsent.analytics}
                onChange={() => handleCookieChange('analytics')}
                className="h-4.5 w-4.5 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
              <div>
                <span className="font-semibold block text-sm">Marketing & Recommendations</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Used to tailor product recommendations and promotional alerts.</span>
              </div>
              <input
                type="checkbox"
                checked={cookieConsent.marketing}
                onChange={() => handleCookieChange('marketing')}
                className="h-4.5 w-4.5 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 font-display">
                Confirm Erasure Request
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Are you absolutely sure? This action is irreversible. Your profile will be deleted and your login deactivated. 
                Historical order details will be kept in an anonymous format to satisfy EU tax regulations (DAC7/VAT audits).
              </p>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  loading={deleting}
                  fullWidth
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
