import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-800 hover:text-green-700">
            EUshop
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 bg-white my-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: July 2026</p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Data Controller</h2>
            <p className="text-gray-700 leading-relaxed">
              For the purposes of the General Data Protection Regulation (GDPR), the data controller is{' '}
              <strong className="text-gray-900">EUshop s.r.o.</strong> (registration details pending incorporation), with its principal place of business in Prague, Czech Republic. You can contact us at{' '}
              <a href="mailto:privacy@eushop.com" className="text-green-700 hover:underline">
                privacy@eushop.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Personal Data We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We collect information that you provide to us directly or that is generated automatically when you use our marketplace:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Account Information:</strong> Name, email address, password hashes, and registration preferences (buyer vs. seller).
              </li>
              <li>
                <strong>Seller Verification & Compliance Data:</strong> Personal or business tax IDs, VAT numbers, trade register numbers, address details, and identity documents as required by EU law (including DSA Article 30 and DAC7).
              </li>
              <li>
                <strong>Transaction & Payment Information:</strong> Order details, shipping address, and payment metadata (processed securely via Stripe; we do not store raw credit card numbers).
              </li>
              <li>
                <strong>Communications:</strong> The contents of chat messages and feedback submitted via the platform's conversation systems.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Purpose and Legal Basis for Processing</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We process your personal data under the following legal bases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Contract Performance:</strong> To process orders, manage accounts, and facilitate communications between buyers and sellers.
              </li>
              <li>
                <strong>Legal Obligation:</strong> To comply with regulatory requirements under the Digital Services Act (DSA) (Article 30 KYBC verification) and DAC7 tax reporting directives.
              </li>
              <li>
                <strong>Consent:</strong> For marketing emails or cookie trackers, where you have explicitly opted in.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Sharing and Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We share data with verified payment processors (Stripe), verification services (Auth0), and tax authorities (under DAC7 reporting requirements). We retain personal data only as long as necessary to fulfill transaction requirements, resolve disputes, and satisfy legal audit obligations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Your GDPR Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              As an EU resident, you have the following rights under the GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>The right to access, update, or delete the personal data we hold about you.</li>
              <li>The right to request data portability.</li>
              <li>The right to object to or restrict processing of your data.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, please email{' '}
              <a href="mailto:privacy@eushop.com" className="text-green-700 hover:underline">
                privacy@eushop.com
              </a>.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} EUshop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
