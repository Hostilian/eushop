import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface AtlasTrail {
  id: string;
  title: string;
  region: string;
  countries: string[];
  description: string;
  featuredFoodsCount: number;
  qualitySchemes: string[];
  imageBg: string;
}

const REGIONAL_TRAILS: AtlasTrail[] = [
  {
    id: 'cheeses-of-the-alps',
    title: 'Cheeses of the European Alps',
    region: 'Alpine Arc (France, Italy, Switzerland, Austria)',
    countries: ['FR', 'IT', 'CH', 'AT'],
    description: 'High-altitude artisanal cheeses crafted in mountain chalets with alpine grass feeding.',
    featuredFoodsCount: 18,
    qualitySchemes: ['PDO', 'PGI'],
    imageBg: 'from-amber-700/40 to-yellow-900/60',
  },
  {
    id: 'conservas-of-portugal',
    title: 'Artisanal Conservas of Portugal & Galicia',
    region: 'Atlantic Coastline',
    countries: ['PT', 'ES'],
    description: 'Centuries-old canning traditions preserving Atlantic sardine, mackerel, and octopus in cold-pressed olive oils.',
    featuredFoodsCount: 14,
    qualitySchemes: ['PGI', 'TRADITIONAL_SPECIALTY'],
    imageBg: 'from-blue-700/40 to-cyan-900/60',
  },
  {
    id: 'olive-oils-of-andalucia',
    title: 'Protected Extra Virgin Olive Oils of Andalucía',
    region: 'Southern Spain',
    countries: ['ES'],
    description: 'Millenary olive groves producing low-acidity, polyphenol-rich extra virgin olive oils under strict D.O.P. protection.',
    featuredFoodsCount: 12,
    qualitySchemes: ['PDO'],
    imageBg: 'from-emerald-700/40 to-green-900/60',
  },
  {
    id: 'balsamic-and-parmigiano-emilia',
    title: 'Culinary Heritage of Emilia-Romagna',
    region: 'Northern Italy',
    countries: ['IT'],
    description: 'Tradizione di Modena & Reggio Emilia — 24-month Parmigiano Reggiano and 12-year aged Aceto Balsamico Tradizionale.',
    featuredFoodsCount: 22,
    qualitySchemes: ['PDO', 'PGI'],
    imageBg: 'from-red-800/40 to-amber-900/60',
  },
];

export default function AtlasIndexPage() {
  const [selectedScheme, setSelectedScheme] = useState<string>('ALL');

  const filteredTrails = selectedScheme === 'ALL'
    ? REGIONAL_TRAILS
    : REGIONAL_TRAILS.filter((t) => t.qualitySchemes.includes(selectedScheme));

  return (
    <>
      <Head>
        <title>European Cultural Food Atlas — EUshop</title>
        <meta
          name="description"
          content="Explore the living atlas of European protected regional foods, PDO/PGI quality schemes, and centuries-old producer traditions."
        />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        {/* Header Hero */}
        <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
              <span>EU Food Knowledge Graph</span>
              <span>•</span>
              <span>Regulation (EU) No 1151/2012</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white mb-4">
              European Cultural Food Atlas
            </h1>
            <p className="text-lg text-neutral-300 max-w-3xl">
              Mapping Europe's protected geographical indications, authentic regional food traditions,
              and verified artisanal producers across all 27 Member States.
            </p>

            {/* Quality Scheme Filters */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium mr-2">Filter by Scheme:</span>
              {['ALL', 'PDO', 'PGI', 'TRADITIONAL_SPECIALTY'].map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setSelectedScheme(scheme)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedScheme === scheme
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {scheme === 'ALL' ? 'All Schemes' : scheme}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTrails.map((trail) => (
              <div
                key={trail.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/20"
              >
                <div className={`h-40 bg-gradient-to-br ${trail.imageBg} p-6 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-black/60 backdrop-blur text-neutral-200 border border-white/10">
                      {trail.region}
                    </span>
                    <div className="flex gap-1">
                      {trail.qualitySchemes.map((qs) => (
                        <span key={qs} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-neutral-950">
                          {qs}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                    <span>{trail.featuredFoodsCount} Verified Regional Foods</span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {trail.title}
                  </h2>
                  <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
                    {trail.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
                    <span className="text-xs text-neutral-400">
                      Countries: <strong className="text-neutral-200">{trail.countries.join(', ')}</strong>
                    </span>
                    <Link
                      href={`/atlas/${trail.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      Explore Trail
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
