import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import Link from 'next/link';

export default function AndroidPage() {
  return (
    <PageWrapper>
      <div className="py-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 px-6 sm:px-12 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 text-white border border-gray-800 shadow-2xl mb-12 animate-fade-in">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Companion App
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
                EUshop for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Android</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Connect with local sellers, upload listings instantly using your phone's camera, and receive real-time push notifications for chat messages and order updates. 
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a 
                  href="https://github.com/Hostilian/eushop/releases/latest/download/eushop.apk"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-gray-950 bg-gradient-to-r from-blue-400 to-green-400 hover:opacity-95 transition shadow-lg shadow-blue-500/10"
                >
                  Download Android APK
                </a>
                <Link href="#install" className="inline-flex items-center justify-center px-6 py-3 border border-gray-700 text-base font-semibold rounded-xl text-white hover:bg-gray-800 transition">
                  Installation Guide
                </Link>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-2 pt-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                <span>Current Release: v1.0.0-beta (Android 8.0+)</span>
              </div>
            </div>

            {/* Right CSS Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-[480px] bg-gray-950 rounded-[40px] border-4 border-gray-800 p-2.5 shadow-2xl ring-1 ring-gray-700/50">
                {/* Speaker/Camera notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                </div>

                {/* Inner Screen */}
                <div className="w-full h-full bg-gray-900 rounded-[30px] overflow-hidden flex flex-col justify-between p-4 border border-gray-800">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-semibold px-1">
                    <span>19:42</span>
                    <div className="flex items-center gap-1.5">
                      <span>📶</span>
                      <span>🔋 85%</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 mt-2">
                    <span className="font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">🌿 EUshop</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-500/30">Verified</span>
                  </div>

                  {/* App Content Body Mockup */}
                  <div className="flex-grow py-3 flex flex-col gap-2 overflow-hidden justify-center">
                    <div className="bg-gray-800/50 border border-gray-700/50 p-2.5 rounded-xl space-y-1.5">
                      <div className="flex justify-between text-[10px] text-blue-300 font-bold">
                        <span>💬 Message from Seller</span>
                        <span>Just Now</span>
                      </div>
                      <p className="text-[10px] text-gray-200 line-clamp-2">
                        "Hello! I have fresh Stroopwafels from Gouda ready for shipping. Let me know if you have any questions!"
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700/50 p-2.5 rounded-xl space-y-2">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Active Order Status</span>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-200 font-semibold">Order #EU-4029</span>
                        <span className="text-[8px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full border border-green-500/30">Shipped</span>
                      </div>
                    </div>
                  </div>

                  {/* App Navigation Mockup */}
                  <div className="border-t border-gray-800 pt-2 flex justify-around text-xs text-gray-500">
                    <span className="text-blue-400">🏠</span>
                    <span>🔍</span>
                    <span>🛒</span>
                    <span>💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white font-display">
              Native Android Features
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              The companion mobile app utilizes native hardware integrations to make cross-border food discovery seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <span className="text-3xl block mb-4">🔔</span>
              <h3 className="text-sm font-bold text-brand-dark dark:text-white mb-2">Push Notifications</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Receive real-time push notification alerts when buyers message you, submit offers, or when order tracking changes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <span className="text-3xl block mb-4">📸</span>
              <h3 className="text-sm font-bold text-brand-dark dark:text-white mb-2">Camera Integration</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                List new specialty foods in seconds. Snap a picture of the food and ingredients/allergens packaging to auto-populate descriptions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <span className="text-3xl block mb-4">📍</span>
              <h3 className="text-sm font-bold text-brand-dark dark:text-white mb-2">Location Support</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Browse listings using localized geofencing to find specialty food imports already stored in your immediate metropolitan area.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <span className="text-3xl block mb-4">💳</span>
              <h3 className="text-sm font-bold text-brand-dark dark:text-white mb-2">Seamless Checkout</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Purchase goods securely with integrated Google Pay and Stripe mobile SDKs supporting European SCA authentication.
              </p>
            </div>
          </div>
        </section>

        {/* Installation Instructions */}
        <section id="install" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white font-display">
              Installation Instructions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Because the EUshop app is in a beta testing cycle prior to official Google Play Store listing, you must install it directly as an Android Package (APK). 
            </p>

            <ol className="relative border-l border-gray-200 dark:border-gray-800 pl-4 space-y-6 text-sm text-gray-700 dark:text-gray-300">
              <li className="relative">
                <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 dark:bg-blue-900/35 dark:text-blue-400 rounded-full font-bold text-xs">1</span>
                <h4 className="font-bold text-brand-dark dark:text-white text-sm">Download the APK</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click the "Download Android APK" button on your Android device to retrieve the installation package.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 dark:bg-blue-900/35 dark:text-blue-400 rounded-full font-bold text-xs">2</span>
                <h4 className="font-bold text-brand-dark dark:text-white text-sm">Enable Unknown Sources</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If prompted, enable settings to install apps from unknown sources or authorize your browser (e.g. Chrome) to proceed with installations.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-7 flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 dark:bg-blue-900/35 dark:text-blue-400 rounded-full font-bold text-xs">3</span>
                <h4 className="font-bold text-brand-dark dark:text-white text-sm">Open &amp; Install</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tap the completed download alert in your notification panel or locate it in your file explorer under downloads, then click Install.</p>
              </li>
            </ol>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-sm text-center space-y-4 max-w-sm">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Scan to Download</span>
              
              {/* CSS QR Code Mockup */}
              <div className="w-48 h-48 border border-gray-200 dark:border-gray-700 bg-white p-3 rounded-2xl mx-auto flex flex-col justify-between items-center">
                {/* SVG mock QR representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-950">
                  <path fill="currentColor" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M50,40 h10 v10 h-10 z M40,70 h10 v10 h-10 z M80,40 h10 v20 h-10 z M60,60 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v20 h-10 z M40,40 h10 v10 h-10 z" />
                  <rect x="42" y="42" width="16" height="16" fill="#2563eb" rx="2" />
                  <text x="50" y="52" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">EU</text>
                </svg>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Scan this QR code with your mobile camera to quickly load this page and download the companion app.
              </p>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 mb-12">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">System Requirements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-bold text-brand-dark dark:text-white block">Operating System</span>
              <span className="text-xs text-gray-500 mt-1 block">Android 8.0 (Oreo) or higher</span>
            </div>
            <div>
              <span className="font-bold text-brand-dark dark:text-white block">Hardware Permissions</span>
              <span className="text-xs text-gray-500 mt-1 block">Camera access (listing photos), Location (geofencing)</span>
            </div>
            <div>
              <span className="font-bold text-brand-dark dark:text-white block">Disk Storage</span>
              <span className="text-xs text-gray-500 mt-1 block">Approx. 45 MB available space</span>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
