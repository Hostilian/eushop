import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-gray-900 border-t border-gray-800 text-white shadow-2xl animate-fade-in-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold mb-1">🍪 We care about your privacy</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            EUshop uses cookies to process secure transactions, manage auth sessions, and measure traffic under GDPR rules. 
            By clicking "Accept All", you consent to our use of all cookies. Choose "Reject Non-Essential" to block advertising and analytics. 
            Read our{' '}
            <a href="/privacy" className="underline hover:text-indigo-400">
              Privacy Policy
            </a>{' '}
            for details.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleRejectAll}
            className="w-1/2 md:w-auto px-5 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 hover:text-white transition text-sm"
          >
            Reject Non-Essential
          </button>
          <button
            onClick={handleAcceptAll}
            className="w-1/2 md:w-auto px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
