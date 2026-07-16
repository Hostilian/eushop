import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function TermsOfService() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 font-display">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">Last Updated: July 2026</p>

          <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">1. Scope and Acceptance</h2>
              <p>
                Welcome to EUshop (the "Platform"). These Terms of Service govern your access to and use of our online marketplace.
                By creating an account or purchasing products on EUshop, you agree to comply with these Terms.
                The Platform facilitates transactions between independent sellers of specialty foods and consumer buyers located strictly within the European Union Single Market.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">2. Geographic Constraints</h2>
              <p>
                EUshop operates exclusively within the EU Single Market. Shipments originating from or destined for non-EU territories
                (including Switzerland, the United Kingdom, and Norway) are not permitted due to customs and veterinary inspection requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">3. Seller Verification (DSA & DAC7)</h2>
              <p className="mb-3">
                To sell on EUshop, commercial merchants must complete KYBC onboarding demonstrating compliance with Article 30 of the EU Digital Services Act.
                Verification is currently reviewed manually; automated identity checks are in development.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sellers must provide trade register ID, VAT/tax IDs, and self-certify compliance with EU food safety standards.</li>
                <li>DAC7 tax data is collected at onboarding. Automated annual reporting to EU tax authorities is in development.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">4. Food Safety and Allergen Labelling</h2>
              <p className="mb-3">
                Sellers are solely responsible for compliance with Regulation (EU) No 1169/2011 (Food Information to Consumers).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All listings must declare the presence of any of the 14 major EU-regulated allergens before checkout.</li>
                <li>Perishable goods must be packaged using appropriate thermal or cold-chain packaging where required.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">5. Payments and Commission</h2>
              <p>
                Payment processing is handled by Stripe Connect. By listing goods on the Platform, sellers agree to a marketplace commission
                (standard take-rate: 15%) deducted automatically from checkout totals before payout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">6. Right of Withdrawal</h2>
              <p>
                Under the EU Consumer Rights Directive, buyers generally have a 14-day right of withdrawal from distance purchases.
                However, <strong className="text-gray-900 dark:text-white">this right does not apply to perishable goods</strong> once shipped,
                nor to sealed goods opened after delivery for health protection and hygiene reasons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">7. Disputes and Jurisdiction</h2>
              <p>
                Transactions occur directly between buyer and seller. EUshop is a facilitating platform and is not liable for product defects or shipping delays.
                These Terms are governed by the laws of the Czech Republic. Disputes are subject to the courts of Prague.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-3 font-display">8. Contact</h2>
              <p>
                For questions about these Terms, email{' '}
                <a href="mailto:legal@eushop.com" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
                  legal@eushop.com
                </a>{' '}
                or visit our{' '}
                <Link href="/privacy" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
                  Privacy Policy
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
