import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface FoodRegionPin {
  id: string;
  name: string;
  country: string;
  specialties: string[];
  lat: number;
  lng: number;
  producersCount: number;
  qualityScheme: string;
}

const REGIONAL_PINS: FoodRegionPin[] = [
  {
    id: 'parma',
    name: 'Parma & Reggio Emilia',
    country: 'Italy (IT)',
    specialties: ['Parmigiano Reggiano DOP', 'Prosciutto di Parma DOP'],
    lat: 44.8015,
    lng: 10.3279,
    producersCount: 320,
    qualityScheme: 'PDO',
  },
  {
    id: 'normandy',
    name: 'Pays d’Auge, Normandy',
    country: 'France (FR)',
    specialties: ['Camembert de Normandie AOP', 'Cidre de Normandie IG'],
    lat: 49.1829,
    lng: -0.3707,
    producersCount: 85,
    qualityScheme: 'PDO',
  },
  {
    id: 'matosinhos',
    name: 'Matosinhos & Porto Coastline',
    country: 'Portugal (PT)',
    specialties: ['Conservas de Sardinha de Matosinhos', 'Azeite de Trás-os-Montes DOP'],
    lat: 41.1824,
    lng: -8.6963,
    producersCount: 42,
    qualityScheme: 'PGI',
  },
  {
    id: 'jaen',
    name: 'Sierra de Cazorla, Jaén',
    country: 'Spain (ES)',
    specialties: ['Aceite de Oliva Extra Virgen Sierra de Cazorla DOP'],
    lat: 37.9135,
    lng: -3.0034,
    producersCount: 140,
    qualityScheme: 'PDO',
  },
];

export default function LivingMapPage() {
  const [selectedPin, setSelectedPin] = useState<FoodRegionPin | null>(REGIONAL_PINS[0]);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');

  return (
    <>
      <Head>
        <title>Living Map of European Food — EUshop</title>
        <meta
          name="description"
          content="Interactive spatial atlas of European protected food zones, PDO/PGI artisanal producer coordinates, and regional food traditions."
        />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        {/* Top Bar Navigation */}
        <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-extrabold text-white tracking-tight">
              EUshop <span className="text-emerald-400 font-medium text-xs">Living Map</span>
            </Link>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400 font-mono">PostGIS EPSG:4326</span>
          </div>

          {/* Toggle Map / Accessible List */}
          <div className="flex items-center gap-2 bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'MAP' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'LIST' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Accessible List View
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Map View Canvas */}
          {viewMode === 'MAP' ? (
            <main className="flex-1 relative bg-neutral-900 min-h-[500px] flex items-center justify-center p-6 border-r border-neutral-800">
              <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Map Coordinates Pin Grid Simulation */}
              <div className="relative z-10 w-full max-w-2xl bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-emerald-400">European Food Spatial Corridor Map</span>
                  <span className="text-xs text-neutral-500">4 Active Regional Clusters</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {REGIONAL_PINS.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedPin(pin)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        selectedPin?.id === pin.id
                          ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-lg'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-400">{pin.qualityScheme}</span>
                        <span className="text-[10px] font-mono text-neutral-400">{pin.lat.toFixed(2)}, {pin.lng.toFixed(2)}</span>
                      </div>
                      <div className="font-bold text-sm text-white">{pin.name}</div>
                      <div className="text-xs text-neutral-400 mt-1">{pin.producersCount} Verified Producers</div>
                    </button>
                  ))}
                </div>
              </div>
            </main>
          ) : (
            /* Accessible List View */
            <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
              <h1 className="text-2xl font-bold text-white mb-6">European Regional Food Zones</h1>
              <div className="space-y-4">
                {REGIONAL_PINS.map((pin) => (
                  <div key={pin.id} className="p-6 border border-neutral-800 bg-neutral-900 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-white">{pin.name}</h2>
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-black rounded">{pin.qualityScheme}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3">{pin.country} • Coordinates: {pin.lat}, {pin.lng}</p>
                    <div className="text-sm text-neutral-300 font-medium">
                      Specialties: {pin.specialties.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </main>
          )}

          {/* Sidebar Inspector Panel */}
          {selectedPin && viewMode === 'MAP' && (
            <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <span>{selectedPin.qualityScheme} Protected Zone</span>
                  <span>•</span>
                  <span>{selectedPin.country}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-white mb-2">{selectedPin.name}</h2>
                <p className="text-xs font-mono text-neutral-400 mb-6">
                  PostGIS Lat/Lng: {selectedPin.lat}, {selectedPin.lng}
                </p>

                <div className="border-t border-neutral-800 pt-4 mb-6">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    Registered Food Specialties
                  </h3>
                  <ul className="space-y-2">
                    {selectedPin.specialties.map((spec) => (
                      <li key={spec} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-sm font-semibold text-emerald-300">
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
                  <div className="font-bold text-white mb-1">DSA Article 30 Producer Coverage</div>
                  {selectedPin.producersCount} registered artisanal producers audited & verified under EU KYBC rules.
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/atlas`}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  Explore Food Atlas Trail
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
