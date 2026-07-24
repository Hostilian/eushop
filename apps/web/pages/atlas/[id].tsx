import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SellerTraceabilityCard } from '../../components/dsa/SellerTraceabilityCard';

export default function AtlasDetailPage() {
  const router = Router();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>{id ? `Atlas Trail: ${id}` : 'Food Atlas Trail'} — EUshop</title>
      </Head>

      <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/atlas" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-8 hover:underline">
            ← Back to Cultural Food Atlas
          </Link>

          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase mb-2">
              <span>Protected Designation of Origin (PDO)</span>
              <span>•</span>
              <span>Reg. (EU) 1151/2012</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4 capitalize">
              {typeof id === 'string' ? id.replace(/-/g, ' ') : 'Alpine Cheese Heritage'}
            </h1>
            <p className="text-neutral-300 leading-relaxed mb-6">
              Authentic high-altitude regional food product registered in the EU eAmbrosia database.
              Produced exclusively in defined geographical regions adhering to strict historical specifications.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-400 block">Country of Origin:</span>
                <span className="font-semibold text-white">France (FR) / Italy (IT)</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Quality Scheme:</span>
                <span className="font-semibold text-amber-400">PDO / D.O.P.</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Allergens (FIC 1169):</span>
                <span className="font-semibold text-white">Milk (Dairy)</span>
              </div>
              <div>
                <span className="text-neutral-400 block">eAmbrosia ID:</span>
                <span className="font-mono text-emerald-400">PGI-EU-00984</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Verified Producer & Seller Traceability (DSA Art. 30)</h2>
          <SellerTraceabilityCard
            sellerName="Caseificio Montagna Alpine Co-op"
            tradeRegisterNumber="IT-VR-849201"
            vatNumber="IT09823410091"
            address="Via delle Malghe 14, 38023 Cles (TN)"
            countryIso2="IT"
            kycVerified={true}
            selfCertifiedCompliant={true}
          />
        </div>
      </div>
    </>
  );
}

function Router() {
  return useRouter();
}
