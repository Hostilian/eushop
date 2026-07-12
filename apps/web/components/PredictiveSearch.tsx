import { useState, useEffect } from 'react';

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

const PRESET_QUERIES = [
  { text: 'Lactose-free cheese from Spain', icon: '🧀' },
  { text: 'Gluten-free Belgian chocolates', icon: '🍫' },
  { text: 'Aged balsamic vinegar from Italy', icon: '🍇' },
  { text: 'Smoked ham from Black Forest Germany', icon: '🌲' },
];

const STEPS = [
  'Parsing linguistic intent & semantic matching...',
  'Checking DAC7 compliance & merchant trade-registers...',
  'Filtering regulatory allergen profiles (EU 1169/2011)...',
  'Securing DSA Article 30 KYBC merchant status...',
  'Mapping OSS VAT rates and shipping lanes...',
];

export default function PredictiveSearch({ onSearch, onClear }: PredictiveSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'parsing' | 'complete'>('idle');
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (aiState === 'parsing') {
      setReasoningLogs([]);
      setActiveStep(0);
      
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < STEPS.length) {
            setReasoningLogs((logs) => [...logs, STEPS[prev]]);
            return prev + 1;
          } else {
            clearInterval(interval);
            setAiState('complete');
            // Execute search after logs finish
            const filters = parseNaturalLanguage(query);
            onSearch(query, filters);
            return prev;
          }
        });
      }, 350); // Fast, satisfying typing interval

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState, query]);

  const parseNaturalLanguage = (text: string): ParsedFilters => {
    const lower = text.toLowerCase();
    const filters: ParsedFilters = {};

    // Parse Country
    if (lower.includes('spain') || lower.includes('spanish')) filters.country = 'Spain';
    if (lower.includes('belgium') || lower.includes('belgian')) filters.country = 'Belgium';
    if (lower.includes('italy') || lower.includes('italian')) filters.country = 'Italy';
    if (lower.includes('germany') || lower.includes('german')) filters.country = 'Germany';
    if (lower.includes('france') || lower.includes('french')) filters.country = 'France';
    if (lower.includes('greece') || lower.includes('greek')) filters.country = 'Greece';
    if (lower.includes('austria') || lower.includes('austrian')) filters.country = 'Austria';
    if (lower.includes('portugal') || lower.includes('portuguese')) filters.country = 'Portugal';
    if (lower.includes('netherlands') || lower.includes('dutch')) filters.country = 'Netherlands';

    // Parse Category
    if (lower.includes('cheese') || lower.includes('dairy')) filters.category = 'Dairy & Cheese';
    if (lower.includes('chocolate') || lower.includes('sweet') || lower.includes('confectionery')) {
      filters.category = 'Sweets & Confectionery';
    }
    if (lower.includes('oil') || lower.includes('vinegar') || lower.includes('condiment') || lower.includes('balsamic')) {
      filters.category = 'Condiments';
    }
    if (lower.includes('ham') || lower.includes('meat') || lower.includes('deli')) {
      filters.category = 'Meat & Deli';
    }

    // Parse Allergens to avoid (e.g. "lactose-free" or "gluten-free" means we want to exclude items containing Milk or Gluten)
    const avoid: string[] = [];
    if (lower.includes('lactose-free') || lower.includes('dairy-free') || lower.includes('no milk')) {
      avoid.push('Milk');
    }
    if (lower.includes('gluten-free') || lower.includes('no gluten')) {
      avoid.push('Gluten');
    }
    if (lower.includes('nut-free') || lower.includes('no nuts')) {
      avoid.push('Nuts');
    }
    if (avoid.length > 0) {
      filters.allergensAvoid = avoid;
    }

    // Parse Price Limit
    const priceMatch = lower.match(/(?:under|below|max|maximum)\s*(?:€|\$)?\s*(\d+)/);
    if (priceMatch && priceMatch[1]) {
      filters.maxPrice = parseInt(priceMatch[1], 10);
    }

    return filters;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAiState('parsing');
  };

  const triggerPreset = (presetText: string) => {
    setQuery(presetText);
    setAiState('parsing');
  };

  const handleClearAll = () => {
    setQuery('');
    setAiState('idle');
    setReasoningLogs([]);
    onClear();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Outer Glow container */}
      <div
        className={`relative p-0.5 rounded-3xl transition-all duration-500 bg-gradient-to-r ${
          isFocused || aiState === 'parsing'
            ? 'from-emerald-500 via-teal-400 to-blue-500 shadow-lg shadow-teal-500/10'
            : 'from-gray-200/50 to-gray-300/30 dark:from-gray-800/50 dark:to-gray-700/30'
        }`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-white dark:bg-gray-950 rounded-[22px] px-4 py-3"
        >
          {/* AI Icon */}
          <div className="flex items-center justify-center mr-3 text-emerald-500 dark:text-emerald-400">
            <svg
              className={`w-6 h-6 ${aiState === 'parsing' ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {aiState === 'parsing' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              )}
            </svg>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search with predictive AI (e.g. 'Gluten-free Belgian chocolates under 30 euros')..."
            className="flex-1 bg-transparent border-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 text-sm md:text-base font-sans"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full text-gray-400 hover:text-gray-600 transition mr-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Action Trigger Button */}
          <button
            type="submit"
            className="bg-brand-dark dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs md:text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>Ask AI</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      {/* Preset Suggestions */}
      {aiState === 'idle' && (
        <div className="flex flex-wrap gap-2 items-center justify-center animate-fade-in">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-1">Try Prompts:</span>
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset.text}
              onClick={() => triggerPreset(preset.text)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-xs text-gray-600 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition duration-200"
            >
              <span>{preset.icon}</span>
              <span>{preset.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* AI Reasoning Log (Pitch Feature) */}
      {aiState !== 'idle' && (
        <div className="bg-gray-900/95 dark:bg-black/80 rounded-2xl border border-gray-800/80 p-5 font-mono text-xs text-emerald-400 space-y-2.5 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Header Panel */}
          <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-emerald-500 tracking-wider">PREDICTIVE SEARCH ENGINE v15.0</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold select-none">COSMIC_ROUTER_ONLINE</span>
          </div>

          {/* Query Log */}
          <div className="text-gray-400">
            <span className="text-emerald-600 font-bold">$</span> query --intent &quot;{query}&quot;
          </div>

          {/* Typing log lists */}
          <div className="space-y-2">
            {reasoningLogs.map((log, index) => (
              <div key={index} className="flex gap-2 items-start animate-fade-in">
                <span className="text-emerald-500 shrink-0">✔</span>
                <span className="text-gray-300 leading-normal">{log}</span>
              </div>
            ))}

            {aiState === 'parsing' && (
              <div className="flex gap-2 items-center text-emerald-400 animate-pulse mt-1 select-none">
                <span className="animate-spin text-sm">✦</span>
                <span>Synthesizing product graph matrices...</span>
              </div>
            )}
          </div>

          {/* Final State */}
          {aiState === 'complete' && (
            <div className="border-t border-gray-800 pt-3 mt-4 flex items-center justify-between text-[11px] text-emerald-500">
              <span>➔ Intent mapped. Regulatory controls checked. Displaying results.</span>
              <button
                onClick={handleClearAll}
                className="hover:underline font-bold tracking-wide uppercase text-rose-400 flex items-center gap-1"
              >
                Reset Canvas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
