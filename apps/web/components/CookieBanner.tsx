import React, { useEffect, useState } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

declare global {
  interface Window {
    hasCookieConsent: (category: keyof CookiePreferences) => boolean;
  }
}

export default function CookieBanner(): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      if (typeof window !== 'undefined') {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
          setShowBanner(true);
        }
      }
    });

    if (typeof window !== 'undefined') {
      window.hasCookieConsent = (category: keyof CookiePreferences) => {
        if (category === 'essential') return true;
        const currentConsent = localStorage.getItem('cookieConsent');
        if (!currentConsent) return false;
        try {
          const parsed = JSON.parse(currentConsent);
          return !!parsed[category];
        } catch {
          if (currentConsent === 'all') return true;
          return false;
        }
      };
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    const allPrefs = { essential: true, analytics: true, marketing: true };
    savePreferences(allPrefs);
  };

  const handleRejectAll = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    savePreferences(essentialOnly);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-6 bg-gray-900 border-t border-gray-800 text-white shadow-2xl animate-fade-in-up">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-1 font-display flex items-center gap-2">
              <span>🍪</span> Cookie Privacy Settings
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
              We use cookies to enable secure shopping, authenticate users, and gather analytics under GDPR rules. 
              By accepting all, you help us refine our service. You can customize your settings or read our{' '}
              <a href="/privacy" className="underline hover:text-indigo-400">Privacy Policy</a> for more details.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-4 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Customize
            </button>
            <button
              onClick={handleRejectAll}
              className="px-4 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 bg-brand-green text-white font-semibold rounded-lg hover:opacity-90 transition text-sm"
            >
              Accept All
            </button>
          </div>
        </div>

        {showPreferences && (
          <div className="border-t border-gray-800 pt-6 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-start justify-between">
              <div>
                <h5 className="font-bold text-sm text-white mb-1">Essential Cookies</h5>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Required for user authentication, session persistence, and secure checkout processing. Cannot be disabled.
                </p>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-gray-700 text-primary focus:ring-primary/20 bg-gray-800 h-4 w-4 shrink-0 mt-1"
              />
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-start justify-between">
              <div>
                <h5 className="font-bold text-sm text-white mb-1">Performance & Analytics</h5>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Allows us to monitor site performance, traffic trends, and optimize user experience.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="rounded border-gray-700 text-primary focus:ring-primary/20 bg-gray-800 h-4 w-4 cursor-pointer shrink-0 mt-1"
              />
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-start justify-between">
              <div>
                <h5 className="font-bold text-sm text-white mb-1">Marketing & Personalization</h5>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Used to deliver personalized offers and advertisements tailoredFast to your interests.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                className="rounded border-gray-700 text-primary focus:ring-primary/20 bg-gray-800 h-4 w-4 cursor-pointer shrink-0 mt-1"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleSaveCustom}
                className="px-5 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90 transition text-xs"
              >
                Save My Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
