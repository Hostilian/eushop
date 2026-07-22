import React from 'react';
import Link from 'next/link';

export const TrustArchitectureSection: React.FC = () => {
  const trustPillars = [
    {
      icon: '📜',
      title: 'DSA Art. 30 Named Traders',
      description: 'Every product is sold by a verified European business with commercial registry, VAT number, and contact identity explicitly disclosed.',
      tag: 'EU Regulation',
    },
    {
      icon: '🌾',
      title: '14 EU Regulated Allergens',
      description: 'Full FIC 1169/2011 Annex II disclosure matrix on all food items so buyers know exactly what ingredients and allergens are present.',
      tag: 'Food Safety',
    },
    {
      icon: '💶',
      title: 'Transparent Destination VAT',
      description: 'Calculated instantly based on buyer delivery country across all 27 EU member state tax rates with zero hidden import tariffs.',
      tag: 'Single Market',
    },
    {
      icon: '🛡️',
      title: 'DAC7 & Dispute Pathways',
      description: 'Automated EU tax compliance reporting and structured buyer-seller dispute resolution pathways for total transaction peace of mind.',
      tag: 'Buyer Protection',
    },
  ];

  return (
    <section className="py-12 bg-[#efece4]/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl border border-[#dcd7cb] my-8" aria-labelledby="trust-architecture-title">
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-black uppercase tracking-widest text-[#1845d4] flex items-center gap-1.5">
          <span>🛡️</span> Built for Single Market Trust
        </span>
        <h2 id="trust-architecture-title" className="text-2xl sm:text-3xl font-extrabold text-[#141613] tracking-tight font-display mt-1">
          European Marketplace Trust & Compliance Shield
        </h2>
        <p className="text-sm text-[#65675f] mt-2 leading-relaxed">
          EUshop enforces strict European regulatory compliance to protect both buyers and specialist sellers across cross-border food trade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustPillars.map((pillar) => (
          <div key={pillar.title} className="bg-[#fffdf8] rounded-2xl p-6 border border-[#dcd7cb] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{pillar.icon}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1845d4]/10 text-[#1845d4] border border-[#1845d4]/20">
                  {pillar.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#141613] font-display mb-2">{pillar.title}</h3>
              <p className="text-xs text-[#65675f] leading-relaxed mb-4">{pillar.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[#dcd7cb] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#65675f]">
        <span className="font-semibold text-[#141613]">
          ✓ Compliance single source of truth: <code className="font-mono bg-[#fffdf8] px-2 py-0.5 rounded border border-[#dcd7cb]">packages/compliance</code>
        </span>
        <Link href="/gdpr" className="text-[#1845d4] font-bold hover:underline">
          Read GDPR Privacy & Art. 17/20 Erasure Policy →
        </Link>
      </div>
    </section>
  );
};
