import React, { useState, useEffect, useRef, useId } from 'react';
import { readSafeStorage, writeSafeStorage, StorageSchema } from '../lib/storageSafety';
import { trackEvent } from '../lib/analytics/events';

interface PredictiveSearchProps {
  onSearch: (query: string, parsedFilters: ParsedFilters) => void;
  onClear: () => void;
}

export interface ParsedFilters {
  country?: string;
  category?: string;
  allergensAvoid?: string[];
  maxPrice?: number;
}

const RECENT_SEARCHES_SCHEMA: StorageSchema<string[]> = {
  key: 'eushop_recent_searches',
  version: 1,
  area: 'local',
  fallback: () => [],
  validate: (val): val is string[] => Array.isArray(val) && val.every(s => typeof s === 'string'),
};

const PRESET_QUERIES = [
  { text: 'Lactose-free cheese from Spain', icon: '🧀', category: 'Cheese', country: 'Spain' },
  { text: 'Gluten-free Belgian chocolates', icon: '🍫', category: 'Chocolate', country: 'Belgium' },
  { text: 'Aged balsamic vinegar from Italy', icon: '🍷', category: 'Condiment', country: 'Italy' },
  { text: 'Smoked ham from Black Forest Germany', icon: '🥓', category: 'Charcuterie', country: 'Germany' },
];

const QUICK_COUNTRIES = [
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Portugal', flag: '🇵🇹' },
];

const QUICK_CATEGORIES = [
  { name: 'Cheese', icon: '🧀' },
  { name: 'Chocolate', icon: '🍫' },
  { name: 'Wine', icon: '🍷' },
  { name: 'Charcuterie', icon: '🥓' },
  { name: 'Condiment', icon: '🫒' },
];

export default function PredictiveSearch({ onSearch, onClear }: PredictiveSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchInputId = useId();
  const listboxId = useId();

  useEffect(() => {
    setRecentSearches(readSafeStorage(RECENT_SEARCHES_SCHEMA));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const existing = readSafeStorage(RECENT_SEARCHES_SCHEMA);
    const updated = [searchTerm, ...existing.filter(s => s !== searchTerm)].slice(0, 5);
    writeSafeStorage(RECENT_SEARCHES_SCHEMA, updated);
    setRecentSearches(updated);
  };

  const clearRecentSearches = () => {
    writeSafeStorage(RECENT_SEARCHES_SCHEMA, []);
    setRecentSearches([]);
  };

  const parseNaturalLanguage = (text: string): ParsedFilters => {
    const lower = text.toLowerCase();
    const filters: ParsedFilters = {};

    if (lower.includes('spain') || lower.includes('spanish')) filters.country = 'Spain';
    if (lower.includes('belgium') || lower.includes('belgian')) filters.country = 'Belgium';
    if (lower.includes('italy') || lower.includes('italian')) filters.country = 'Italy';
    if (lower.includes('germany') || lower.includes('german')) filters.country = 'Germany';
    if (lower.includes('france') || lower.includes('french')) filters.country = 'France';
    if (lower.includes('greece') || lower.includes('greek')) filters.country = 'Greece';
    if (lower.includes('portugal') || lower.includes('portuguese')) filters.country = 'Portugal';

    if (lower.includes('cheese') || lower.includes('dairy')) filters.category = 'Cheese';
    if (lower.includes('chocolate') || lower.includes('praline')) filters.category = 'Chocolate';
    if (lower.includes('wine') || lower.includes('balsamic') || lower.includes('condiment') || lower.includes('oil')) {
      filters.category = 'Condiment';
    }
    if (lower.includes('ham') || lower.includes('charcuterie') || lower.includes('sausage')) {
      filters.category = 'Charcuterie';
    }

    const avoid: string[] = [];
    if (lower.includes('lactose-free') || lower.includes('dairy-free') || lower.includes('no milk')) {
      avoid.push('Milk');
    }
    if (lower.includes('gluten-free') || lower.includes('no gluten')) {
      avoid.push('Gluten');
    }
    if (avoid.length > 0) {
      filters.allergensAvoid = avoid;
    }

    const priceMatch = lower.match(/(?:under|below|max|maximum)\s*(?:€|\$)?\s*(\d+)/);
    if (priceMatch && priceMatch[1]) {
      filters.maxPrice = parseInt(priceMatch[1], 10);
    }

    return filters;
  };

  const executeSearch = (searchTerm: string, filterOverride?: ParsedFilters) => {
    const term = searchTerm.trim();
    if (!term) return;

    saveRecentSearch(term);
    const filters = filterOverride || parseNaturalLanguage(term);
    trackEvent('search_query_submitted', { filterValue: term, country: filters.country, category: filters.category });
    onSearch(term, filters);
    setIsFocused(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClearAll = () => {
    setQuery('');
    setSelectedIndex(-1);
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto relative space-y-3">
      {/* Search Input Bar */}
      <div
        className={`relative p-0.5 rounded-3xl transition-all duration-300 bg-gradient-to-r ${
          isFocused
            ? 'from-blue-600 via-indigo-500 to-purple-600 shadow-xl shadow-blue-500/10'
            : 'from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700'
        }`}
      >
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center bg-white dark:bg-gray-950 rounded-[22px] px-4 py-3"
          role="search"
        >
          <div className="flex items-center justify-center mr-3 text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <label htmlFor={searchInputId} className="sr-only">
            Search European Specialty Foods
          </label>
          <input
            ref={inputRef}
            id={searchInputId}
            type="text"
            role="combobox"
            aria-expanded={isFocused}
            aria-autocomplete="list"
            aria-controls={listboxId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              trackEvent('search_started');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search specialty foods (e.g., 'Gluten-free Manchego from Spain')..."
            className="w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-0"
          />

          {query && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mr-2"
              aria-label="Clear search query"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {/* Zero-Query Suggestions Dropdown */}
      {isFocused && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Quick Suggestions */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Suggested Searches
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset.text);
                    executeSearch(preset.text, { country: preset.country, category: preset.category });
                  }}
                  className="flex items-center space-x-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all group"
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Country Filters */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Browse Origin Country
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_COUNTRIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setQuery(c.name);
                    executeSearch(c.name, { country: c.name });
                  }}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-500 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all"
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Browse Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setQuery(cat.name);
                    executeSearch(cat.name, { category: cat.name });
                  }}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-500 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-gray-400">
                Recent searches: {' '}
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(s);
                      executeSearch(s);
                    }}
                    className="inline-block underline text-gray-600 dark:text-gray-300 hover:text-blue-600 mr-2"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Clear history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
