import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-100 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-primary dark:text-blue-400">
              <span>🌿</span>
              <span className="tracking-tight text-brand-dark dark:text-white">EUshop</span>
            </Link>
            <p className="text-xs leading-relaxed max-w-xs text-gray-500 dark:text-gray-400">
              The premier European marketplace for regional specialty foods, regional pantry staples, and regional candies.
            </p>
            <p className="text-xs font-semibold text-primary dark:text-blue-400 flex items-center gap-1">
              <span>🇪🇺</span> EU Single Market Trade Only
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Shop
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link href="/search" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Browse Listings
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?category=chocolates" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Chocolates & Sweets
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?category=pantry" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Pantry Staples
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-8 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Sellers
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link href="/become-seller" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Become a Seller
                    </Link>
                  </li>
                  <li>
                    <Link href="/seller/dashboard" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Seller Center
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Regulatory & GDPR
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link href="/gdpr" className="hover:text-primary dark:hover:text-blue-400 transition">
                      GDPR Center
                    </Link>
                  </li>
                  <li>
                    <span className="text-xs text-gray-400 dark:text-gray-600 block">
                      Article 17 Erasure & Art. 20 Export available in dashboard.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link href="/privacy" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-primary dark:hover:text-blue-400 transition">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-150 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <p>
            &copy; {currentYear} EUshop Marketplace. All rights reserved. Registered and compliant within the EU.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>🔒</span> SSL Encrypted
            </span>
            <span className="flex items-center gap-1">
              <span>💳</span> Stripe Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
