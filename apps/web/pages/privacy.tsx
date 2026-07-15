import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 font-display">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">Last Updated: July 2026</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 font-display">
                1. Data Controller
              </h2>
              <p>
                For the purposes of the General Data Protection Regulation (GDPR), the data controller is{' '}
                <strong className="text-gray-900 dark:text-white">EUshop s.r.o.</strong> (registration details pending incorporation), with its principal place of business in Prague, Czech Republic. You can contact us at{' '}
                <a href="mailto:privacy@eushop.com" className="text-primary hover:underline font-semibold dark:text-blue-400">
                  privacy@eushop.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 font-display">
                2. Personal Data We Collect
              </h2>
              <p className="mb-3">
                We collect information that you provide to us directly or that is generated automatically when you use our marketplace:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-gray-900 dark:text-white">Account Information:</strong> Name, email address, password hashes, and registration preferences (buyer vs. seller).
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Seller Verification & Compliance Data:</strong> Personal or business tax IDs, VAT numbers, trade register numbers, address details, and identity documents as required by EU law (including DSA Article 30). DAC7 tax reporting is in progress.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Transaction & Payment Information:</strong> Order details, shipping address, and payment metadata (processed securely via Stripe; we do not store raw credit card numbers).
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Communications:</strong> The contents of chat messages and feedback submitted via the platform's conversation systems.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 font-display">
                3. Purpose and Legal Basis for Processing
              </h2>
              <p className="mb-3">
                We process your personal data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-gray-900 dark:text-white">Contract Performance:</strong> To process orders, manage accounts, and facilitate communications between buyers and sellers.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Legal Obligation:</strong> To comply with regulatory requirements under the Digital Services Act (DSA) (Article 30 KYBC verification). DAC7 tax reporting is in progress.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Consent:</strong> For marketing emails or cookie trackers, where you have explicitly opted in.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 font-display">
                4. Data Sharing and Retention
              </h2>
              <p>
                We share data with verified payment processors (Stripe), verification services (Auth0), and tax authorities (under DAC7 reporting requirements). We retain personal data only as long as necessary to fulfill transaction requirements, resolve disputes, and satisfy legal audit obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 font-display">
                5. Your GDPR Rights
              </h2>
              <p className="mb-3">
                As an EU resident, you have the following rights under the GDPR:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to access, update, or delete the personal data we hold about you.</li>
                <li>The right to request data portability.</li>
                <li>The right to object to or restrict processing of your data.</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please visit our dedicated{' '}
                <Link href="/gdpr" className="text-primary hover:underline font-semibold dark:text-blue-400">
                  GDPR Center
                </Link>{' '}
                or email{' '}
                <a href="mailto:privacy@eushop.com" className="text-primary hover:underline font-semibold dark:text-blue-400">
                  privacy@eushop.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
