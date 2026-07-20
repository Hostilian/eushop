import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 font-display">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">Last Updated: July 2026</p>

          <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">1. Data Controller</h2>
              <p>
                For the purposes of the General Data Protection Regulation (GDPR), the data controller is{' '}
                <strong className="text-gray-900 dark:text-white">EUshop s.r.o.</strong> (registration details pending incorporation),
                with its principal place of business in Prague, Czech Republic. Contact us at{' '}
                <a href="mailto:privacy@eushop.com" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
                  privacy@eushop.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">2. Personal Data We Collect</h2>
              <p className="mb-3">We collect information you provide directly or that is generated when you use our marketplace:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-gray-900 dark:text-white">Account Information:</strong> Name, email address, password hashes, and registration preferences.</li>
                <li><strong className="text-gray-900 dark:text-white">Seller Verification & Compliance Data:</strong> Tax IDs, VAT numbers, trade register numbers, and address details as required by DSA Article 30. Identity verification is currently reviewed manually.</li>
                <li><strong className="text-gray-900 dark:text-white">Transaction & Payment Information:</strong> Order details, shipping address, and payment metadata processed via Stripe. We do not store raw card numbers.</li>
                <li><strong className="text-gray-900 dark:text-white">Communications:</strong> Contents of buyer–seller chat messages submitted via the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">3. Purpose and Legal Basis</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-gray-900 dark:text-white">Contract Performance:</strong> To process orders, manage accounts, and facilitate buyer–seller communications.</li>
                <li><strong className="text-gray-900 dark:text-white">Legal Obligation:</strong> To comply with DSA Article 30 KYBC verification and DAC7 tax reporting requirements.</li>
                <li><strong className="text-gray-900 dark:text-white">Consent:</strong> For marketing emails or optional analytics cookies, where you have explicitly opted in.</li>
              </ul>
            </section>

            {/* COMPLIANCE-REVIEW: Data retention period for transactional data (10 years) is mandated by EU VAT Directive (2006/112/EC Art. 242a) and Czech Tax Code */}
            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">4. Data Sharing and Retention</h2>
              <p>
                We share data with payment processors (Stripe), identity verification services (Auth0), and tax reporting systems as required by law.
                Financial and transactional records are retained for exactly 10 years strictly to fulfill mandatory EU VAT Directive and national tax audit obligations (GDPR Art. 6(1)(c)). Personal profile data outside legal retention windows is deleted or anonymised upon a valid erasure request.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">5. Your GDPR Rights</h2>
              <p className="mb-3">As an EU resident, you have the right to access, correct, delete, and port your personal data, and to object to or restrict processing.</p>
              <p>
                To exercise these rights, visit our{' '}
                <Link href="/gdpr" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
                  GDPR Center
                </Link>{' '}
                or email{' '}
                <a href="mailto:privacy@eushop.com" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
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
