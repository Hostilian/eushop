import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AppDownloadPortal() {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    // Check hash on mount and whenever hash changes
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#ios') {
        setActiveTab('ios');
      } else if (typeof window !== 'undefined') {
        setActiveTab('android');
      }
    };

    // Check on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <PageWrapper>
      <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6 sm:px-12 rounded-3xl bg-gradient-to-br from-brand-green via-slate-900 to-emerald-950 text-white border border-brand-green/20 shadow-2xl mb-12 animate-fade-in">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                Companion Apps
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
                EUshop for <span className="text-brand-gold">Mobile</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Connect with local food producers across Europe. Snap photo listings, search with local geofencing, receive push notifications, and authorize payments with a single swipe.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={() => setActiveTab('android')}
                  className={`inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'android' ? 'text-brand-green bg-brand-gold' : 'text-white border border-gray-700 hover:bg-gray-800'}`}
                >
                  🤖 Android Version
                </button>
                <button 
                  onClick={() => setActiveTab('ios')}
                  className={`inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'ios' ? 'text-brand-green bg-brand-gold' : 'text-white border border-gray-700 hover:bg-gray-800'}`}
                >
                  🍎 iOS TestFlight
                </button>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-2 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Android v2.0.0 available · iOS build in progress</span>
              </div>
            </div>

            {/* Right Device Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-[480px] bg-brand-dark rounded-[40px] border-4 border-gray-800 p-2.5 shadow-2xl ring-1 ring-gray-700/50">
                {/* Dynamic Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-brand-dark rounded-full flex items-center justify-center z-20">
                  <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                </div>

                {/* Inner Screen */}
                <div className="w-full h-full bg-gray-900 rounded-[30px] overflow-hidden flex flex-col justify-between p-4 border border-gray-800 relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-semibold px-1 mt-1">
                    <span>19:42</span>
                    <div className="flex items-center gap-1.5">
                      <span>📶</span>
                      <span>🔋 92%</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 mt-2">
                    <span className="font-extrabold text-xs text-white">🌿 EUshop V20</span>
                    <span className="text-[9px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded-md border border-brand-gold/30">Verified</span>
                  </div>

                  {/* Dynamic Tab Body Mockup */}
                  <div className="flex-grow py-3 flex flex-col gap-2 overflow-hidden justify-center">
                    {activeTab === 'android' ? (
                      <>
                        <div className="bg-gray-800/50 border border-gray-700/50 p-2.5 rounded-xl space-y-1">
                          <div className="flex justify-between text-[9px] text-brand-gold font-bold">
                            <span>🤖 Android Direct Install</span>
                            <span>Active</span>
                          </div>
                          <p className="text-[9px] text-gray-300">
                            Build signed using secure developer certificate. Bypass Play Store directly.
                          </p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700/50 p-2.5 rounded-xl space-y-1">
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Security Check</span>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-400 text-[10px]">🛡️</span>
                            <span className="text-[9px] text-gray-200">Play Protect Certified</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-800/50 border border-gray-700/50 p-2.5 rounded-xl space-y-1">
                          <div className="flex justify-between text-[9px] text-brand-gold font-bold">
                            <span>🍎 Apple TestFlight</span>
                            <span>Active</span>
                          </div>
                          <p className="text-[9px] text-gray-300">
                            Access our iOS package sandbox environment inside the official TestFlight app.
                          </p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700/50 p-2.5 rounded-xl space-y-1">
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">iOS Sandbox</span>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-400 text-[10px]">✓</span>
                            <span className="text-[9px] text-gray-200">Apple Sandboxed Session</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bottom Navigation Mockup */}
                  <div className="border-t border-gray-800 pt-2 flex justify-around text-xs text-gray-500">
                    <span className="text-brand-gold">🏠</span>
                    <span>🔍</span>
                    <span>🛒</span>
                    <span>💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Controls & Detailed Panels */}
        <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('android')}
              className={`pb-4 px-1 text-sm font-bold border-b-2 transition ${activeTab === 'android' ? 'border-brand-green text-brand-green dark:border-brand-gold dark:text-brand-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-350'}`}
            >
              Android Package (APK)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`pb-4 px-1 text-sm font-bold border-b-2 transition ${activeTab === 'ios' ? 'border-brand-green text-brand-green dark:border-brand-gold dark:text-brand-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-350'}`}
            >
              iOS TestFlight Beta
            </button>
          </nav>
        </div>

        {activeTab === 'android' ? (
          /* Android Panel */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16 animate-fade-in">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white font-display">
                Download for Android
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                We distribute the EUshop companion app directly as an Android Package (APK) for development and investor demonstration. 
                This allows you to bypass App Store setups and test the camera-based upload, location geofencing, and Stripe checkouts immediately.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/Hostilian/eushop/releases/latest/download/eushop.apk"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-green dark:bg-brand-gold dark:text-brand-green hover:opacity-90 transition shadow-lg shadow-brand-green/10"
                >
                  Download Android APK (Direct Link)
                </a>
              </div>

              <div className="pt-6 border-t border-gray-150 dark:border-gray-800">
                <h3 className="text-lg font-bold text-brand-dark dark:text-white font-display mb-4">
                  Step-by-step Installation
                </h3>
                <ol className="relative border-l border-gray-200 dark:border-gray-800 pl-4 space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  <li className="relative">
                    <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-brand-gold/20 text-brand-gold rounded-full font-bold text-xs">1</span>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Retrieve File</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click the Download button on your Android device. The browser will begin downloading the `.apk` file.</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-brand-gold/20 text-brand-gold rounded-full font-bold text-xs">2</span>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Allow Unknown Applications</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If prompted, tap Settings and check the box to "Allow from this source" to permit your browser to perform direct installations.</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-brand-gold/20 text-brand-gold rounded-full font-bold text-xs">3</span>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Complete Setup</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tap the completed download alert in your notification drawer, or find it in your Files app, and click Install.</p>
                  </li>
                </ol>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-sm text-center space-y-4 w-full max-w-sm">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Scan to Download</span>
                
                {/* QR Code representation */}
                <div className="w-48 h-48 border border-gray-200 dark:border-gray-700 bg-white p-3 rounded-2xl mx-auto flex flex-col justify-between items-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
                    <path fill="currentColor" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M50,40 h10 v10 h-10 z M40,70 h10 v10 h-10 z M80,40 h10 v20 h-10 z M60,60 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v20 h-10 z M40,40 h10 v10 h-10 z" />
                    <rect x="42" y="42" width="16" height="16" fill="#1E3F20" rx="2" />
                    <text x="50" y="52" fill="white" fontSize="5" fontWeight="bold" textAnchor="middle">EU</text>
                  </svg>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Scan this QR code with your Android phone's camera to quickly open this download portal on your device.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* iOS Panel */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16 animate-fade-in">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white font-display">
                Download for iOS (TestFlight Beta)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                The iOS companion application is compiled using Expo and distributed via Apple TestFlight. This allows beta testing within Apple's secure sandboxed app environment before official App Store publication.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-green dark:bg-brand-gold dark:text-brand-green hover:opacity-90 transition shadow-lg shadow-brand-green/10"
                >
                  Register Interest for iOS Beta
                </a>
              </div>

              <div className="pt-6 border-t border-gray-150 dark:border-gray-800">
                <h3 className="text-lg font-bold text-brand-dark dark:text-white font-display mb-4">
                  Step-by-step Installation
                </h3>
                <ol className="relative border-l border-gray-200 dark:border-gray-800 pl-4 space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  <li className="relative">
                    <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-brand-gold/20 text-brand-gold rounded-full font-bold text-xs">1</span>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Download Apple TestFlight</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Open the App Store on your iPhone or iPad, search for "TestFlight", and install the official Apple utility app.</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-brand-gold/20 text-brand-gold rounded-full font-bold text-xs">2</span>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Accept Invitation Link</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tap the "Join Apple TestFlight" button above from your iOS device to accept our invite and link the EUshop sandbox package.</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-brand-gold/20 text-brand-gold rounded-full font-bold text-xs">3</span>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Install Companion App</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inside TestFlight, click "Install" next to the EUshop project. Launch it directly to start testing.</p>
                  </li>
                </ol>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-sm text-center space-y-4 w-full max-w-sm">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Scan to Join Beta</span>
                
                {/* QR Code representation */}
                <div className="w-48 h-48 border border-gray-200 dark:border-gray-700 bg-white p-3 rounded-2xl mx-auto flex flex-col justify-between items-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
                    <path fill="currentColor" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M50,40 h10 v10 h-10 z M40,70 h10 v10 h-10 z M80,40 h10 v20 h-10 z M60,60 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v20 h-10 z M40,40 h10 v10 h-10 z" />
                    <rect x="42" y="42" width="16" height="16" fill="#1E3F20" rx="2" />
                    <text x="50" y="52" fill="white" fontSize="5" fontWeight="bold" textAnchor="middle">iOS</text>
                  </svg>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Scan this QR code with your iPhone or iPad camera to quickly open the TestFlight invitation portal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Requirements */}
        <section className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 mb-12">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Portal Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-bold text-brand-dark dark:text-white block">Operating Systems</span>
              <span className="text-xs text-gray-500 mt-1 block">Android 8.0+ / iOS 16.0+</span>
            </div>
            <div>
              <span className="font-bold text-brand-dark dark:text-white block">Hardware Integrations</span>
              <span className="text-xs text-gray-500 mt-1 block">Camera (photos), Location (local geofencing)</span>
            </div>
            <div>
              <span className="font-bold text-brand-dark dark:text-white block">Storage Requirement</span>
              <span className="text-xs text-gray-500 mt-1 block">45 MB for installation & database package</span>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}