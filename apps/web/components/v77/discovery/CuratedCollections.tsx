import React from 'react';
import Link from 'next/link';

export const CuratedCollections: React.FC = () => {
  const collections = [
    {
      title: 'European Pantry Essentials',
      tagline: 'Aged cheeses, cold-pressed extra virgin oils & traditional preserves.',
      count: '42 Listings',
      icon: '🫒',
      query: 'Pantry',
      badge: 'Bestsellers',
    },
    {
      title: 'Sweet Traditions',
      tagline: 'Artisanal chocolates, Lübeck marzipan & Greek thyme honeys.',
      count: '28 Listings',
      icon: '🍯',
      query: 'Sweets',
      badge: 'Regional Craft',
    },
    {
      title: 'Protected Origin Discoveries',
      tagline: 'Verified DOP, IGP & g.g.A. foods directly from certified producers.',
      count: '35 Listings',
      icon: '🛡️',
      query: 'DOP',
      badge: 'Certified',
    },
    {
      title: 'Allergen-Aware Selection',
      tagline: 'Clear EU Reg. 1169/2011 declarations for gluten-free & nut-safe buyers.',
      count: '19 Listings',
      icon: '🌾',
      query: 'Gluten-Free',
      badge: 'Transparent',
    },
  ];

  return (
    <section className="py-12" aria-labelledby="collections-title">
      <div className="mb-8 border-b border-[#dcd7cb] pb-4">
        <span className="text-xs font-black uppercase tracking-widest text-[#365e38] flex items-center gap-1.5">
          <span>🌿</span> Editorial Selection
        </span>
        <h2 id="collections-title" className="text-2xl sm:text-3xl font-extrabold text-[#141613] tracking-tight font-display mt-1">
          Explore Curated European Collections
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((col) => (
          <Link
            key={col.title}
            href={`/search?q=${encodeURIComponent(col.query)}`}
            className="bg-[#fffdf8] rounded-2xl border border-[#dcd7cb] p-6 shadow-sm hover:shadow-md hover:border-[#1845d4] transition duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{col.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1845d4]/10 text-[#1845d4] border border-[#1845d4]/20">
                  {col.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#141613] group-hover:text-[#1845d4] transition font-display mb-2">
                {col.title}
              </h3>
              <p className="text-xs text-[#65675f] leading-relaxed mb-4">
                {col.tagline}
              </p>
            </div>

            <div className="pt-3 border-t border-[#dcd7cb] flex items-center justify-between text-xs font-bold text-[#141613] group-hover:text-[#1845d4]">
              <span>{col.count}</span>
              <span>Browse →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
