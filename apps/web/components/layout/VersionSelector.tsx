import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

interface VersionOption {
  key: string;
  name: string;
  badge: string;
  desc: string;
  path: string;
  color: string;
}

const VERSIONS: VersionOption[] = [
  {
    key: 'v1',
    name: 'V1 - Pitch & Calculator',
    badge: 'INVESTOR',
    desc: 'Startup presentation, email waitlist, & real-time ARR financial model.',
    path: '/',
    color: 'from-pink-500 to-rose-600 border-rose-200 text-rose-700'
  },
  {
    key: 'v2',
    name: 'V2 - Buyer Marketplace',
    badge: 'BUYER',
    desc: 'Artisanal foods explorer, cart, and mock Stripe checkout loop.',
    path: '/',
    color: 'from-emerald-500 to-green-600 border-green-200 text-green-700'
  },
  {
    key: 'v3',
    name: 'V3 - Seller Compliance Hub',
    badge: 'SELLER',
    desc: 'KYBC registration, DAC7 tax certifications, and listing publisher.',
    path: '/become-seller',
    color: 'from-amber-500 to-orange-600 border-orange-200 text-orange-700'
  },
  {
    key: 'v4',
    name: 'V4 - Admin Console',
    badge: 'OPERATOR',
    desc: 'Moderation desk to approve tax details, check listings, & logs.',
    path: '/admin/dashboard',
    color: 'from-purple-500 to-indigo-600 border-indigo-200 text-indigo-700'
  },
  {
    key: 'v5',
    name: 'V5 - Developer Portal & Docs',
    badge: 'DEVELOPER',
    desc: 'Interactive documentation for audits, schemas, and REST APIs.',
    path: '/docs',
    color: 'from-blue-500 to-cyan-600 border-blue-200 text-blue-700'
  }
];

export default function VersionSelector() {
  const [activeVersion, setActiveVersion] = useState('v2');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Initial load
    const stored = localStorage.getItem('eushop-demo-version') || 'v2';
    setActiveVersion(stored);

    // 2. Event listener for changes from other tabs or actions
    const handleVersionChange = () => {
      const current = localStorage.getItem('eushop-demo-version') || 'v2';
      setActiveVersion(current);
    };

    window.addEventListener('demo-version-changed', handleVersionChange);

    // 3. Handle click outside to close dropdown
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);

    return () => {
      window.removeEventListener('demo-version-changed', handleVersionChange);
      document.removeEventListener('mousedown', clickOutside);
    };
  }, []);

  const handleSelect = (option: VersionOption) => {
    localStorage.setItem('eushop-demo-version', option.key);
    setActiveVersion(option.key);
    setOpen(false);

    // Dispatch global event
    window.dispatchEvent(new Event('demo-version-changed'));

    // If option maps to a specific route, push it
    const currentPath = router.pathname;
    if (option.path === '/' && currentPath !== '/') {
      router.push('/');
    } else if (option.path !== '/' && currentPath !== option.path) {
      router.push(option.path);
    }
  };

  const currentOpt = VERSIONS.find(v => v.key === activeVersion) || VERSIONS[1];

  return (
    <div className="relative z-50 font-sans" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition duration-200 group text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 leading-none mb-0.5">Active Face</p>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">{currentOpt.name.split(' - ')[0]}</p>
        </div>

        <svg
          className={`h-3 w-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-80 md:w-96 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-2xl p-2.5 space-y-1 animate-slide-up origin-top-right">
          <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-900 mb-1.5">
            <h3 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">Select System Face</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Tuck into 5 interactive versions designed for investors & developers.</p>
          </div>

          <div className="space-y-1" role="listbox">
            {VERSIONS.map((v) => {
              const isSelected = v.key === activeVersion;
              return (
                <button
                  key={v.key}
                  onClick={() => handleSelect(v)}
                  className={`w-full text-left p-2.5 rounded-xl transition duration-150 flex gap-3 items-start ${
                    isSelected
                      ? 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-inner'
                      : 'hover:bg-gray-50/70 dark:hover:bg-gray-900/50 border border-transparent'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={`mt-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider bg-gradient-to-br ${v.color} shadow-sm shrink-0`}>
                    {v.badge}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                      {v.name}
                      {isSelected && (
                        <span className="text-[10px] text-emerald-500">●</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{v.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
