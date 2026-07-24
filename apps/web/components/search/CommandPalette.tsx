import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface SearchResultItem {
  id: string;
  type: 'FOOD' | 'PRODUCER' | 'ATLAS' | 'ORDER';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

const SAMPLE_ENTRIES: SearchResultItem[] = [
  {
    id: '1',
    type: 'FOOD',
    title: 'Parmigiano Reggiano DOP 24-Month',
    subtitle: 'Consorzio del Formaggio Parmigiano-Reggiano • Italy',
    url: '/products/parmigiano-reggiano',
    badge: 'PDO',
  },
  {
    id: '2',
    type: 'FOOD',
    title: 'Huile d’Olive de Haute-Provence AOC',
    subtitle: 'Domaine de la Sainte-Victoire • France',
    url: '/products/olive-oil-provence',
    badge: 'PDO',
  },
  {
    id: '3',
    type: 'ATLAS',
    title: 'Cheeses of the European Alps',
    subtitle: 'Cultural Food Trail • 18 Protected Foods',
    url: '/atlas/cheeses-of-the-alps',
    badge: 'ATLAS',
  },
  {
    id: '4',
    type: 'PRODUCER',
    title: 'Consorzio Conservas de Portugal',
    subtitle: 'Verified Producer • Matosinhos, Portugal',
    url: '/atlas/conservas-of-portugal',
    badge: 'DSA VERIFIED',
  },
];

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filtered = SAMPLE_ENTRIES.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden text-neutral-100">
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods, PDO/PGI quality schemes, producers, atlas trails... (Cmd+K)"
            className="w-full bg-transparent text-base focus:outline-none text-white placeholder-neutral-500"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded hover:text-white"
          >
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No results matching "{query}". Request a new regional specialty food.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.url)}
                className="p-3 rounded-lg hover:bg-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-white">{item.title}</div>
                  <div className="text-xs text-neutral-400">{item.subtitle}</div>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {item.badge}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
