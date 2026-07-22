import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  VERSION_SELECTOR_OPTIONS,
  VersionCatalogueEntry,
  CatalogueEntryKind
} from '@/data/version-catalog';

export default function VersionSelector() {
  const [activeVersion, setActiveVersion] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eushop-demo-version') || 'current';
    }
    return 'current';
  });
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Event listener for changes from other tabs or actions
    const handleVersionChange = () => {
      const current = localStorage.getItem('eushop-demo-version') || 'current';
      setActiveVersion(current);
    };

    window.addEventListener('demo-version-changed', handleVersionChange);

    // 2. Handle click outside to close dropdown
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

  const handleSelect = (option: VersionCatalogueEntry) => {
    localStorage.setItem('eushop-demo-version', option.key);
    setActiveVersion(option.key);
    setOpen(false);

    // Dispatch global event
    window.dispatchEvent(new Event('demo-version-changed'));

    // Handle navigation based on entry kind
    if (option.kind === 'historical-snapshot') {
      // For historical snapshots, navigate directly to the path
      window.location.assign((router.basePath || '') + option.path);
    } else {
      // For application views, use Next.js routing
      if (option.path === '/' && router.pathname !== '/') {
        router.push('/');
      } else if (option.path !== '/' && router.pathname !== option.path) {
        router.push(option.path);
      }
    }
  };

  const currentOpt = VERSION_SELECTOR_OPTIONS.find(v => v.key === activeVersion) || VERSION_SELECTOR_OPTIONS[0];

  const renderOption = (option: VersionCatalogueEntry) => {
    const isSelected = option.key === activeVersion;
    let badgeClass = 'bg-gray-100 text-gray-800';
    if (option.category === 'flagship-release') {
      badgeClass = 'bg-emerald-600 text-white font-bold';
    } else if (option.kind === 'current-application') {
      badgeClass = 'bg-emerald-100 text-emerald-800';
    } else if (option.kind === 'application-view') {
      badgeClass = 'bg-blue-100 text-blue-800';
    }

    return (
      <button
        key={option.key}
        onClick={() => handleSelect(option)}
        className={`w-full text-left p-2.5 rounded-xl transition duration-150 flex gap-3 items-start ${
          isSelected
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-sm'
            : 'hover:bg-gray-50/70 dark:hover:bg-gray-900/50 border border-transparent'
        }`}
        role="option"
        aria-selected={isSelected}
      >
        <div className={`mt-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider ${badgeClass} shadow-sm shrink-0`}>
          {option.badge}
        </div>
        <div>
          <h4 className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
            {option.name}
            {isSelected && (
              <span className="text-[10px] text-emerald-500 font-bold">● Active</span>
            )}
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{option.description}</p>
        </div>
      </button>
    );
  };

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
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">
            {currentOpt.name.split(' - ')[0]}
          </p>
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
        <div className="absolute right-0 mt-2.5 w-80 md:w-96 max-h-[80vh] overflow-y-auto rounded-2xl border border-gray-150 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-2xl p-2.5 space-y-1 animate-slide-up origin-top-right">
          <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-900 mb-1.5">
            <h3 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">Select Application Version</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Choose from flagship releases, application views, and historical snapshots.</p>
          </div>

          <div className="space-y-3" role="listbox">
            {/* 1. Flagship Major Releases */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>🚀</span> Flagship Major Releases (V66 / V55 / V44)
              </div>
              <div className="space-y-1 mt-1">
                {VERSION_SELECTOR_OPTIONS.filter(o => o.category === 'flagship-release').map(option => renderOption(option))}
              </div>
            </div>

            {/* 2. Role Application Views */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1 border-t border-gray-100 dark:border-gray-900 pt-2">
                <span>📱</span> Application Views
              </div>
              <div className="space-y-1 mt-1">
                {VERSION_SELECTOR_OPTIONS.filter(o => o.category === 'application-view' && o.key !== 'current').map(option => renderOption(option))}
              </div>
            </div>

            {/* 3. Historical Prototypes & Themes */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1 border-t border-gray-100 dark:border-gray-900 pt-2">
                <span>🏛️</span> Historical Snapshots & Themes
              </div>
              <div className="space-y-1 mt-1">
                {VERSION_SELECTOR_OPTIONS.filter(o => o.kind === 'historical-snapshot').map(option => renderOption(option))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}