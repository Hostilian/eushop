import { useState, useRef, useEffect } from 'react';
import { FoodItem } from '../lib/services';
import { VerifiedSellerBadge } from './ui/Badge';

interface DiscoveryCanvasProps {
  products: FoodItem[];
  onQuickCheckout: (product: FoodItem) => void;
  isLoading: boolean;
}

const getFoodImage = (foodName: string) => {
  const name = foodName.toLowerCase();
  if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) {
    return '/images/belgian_chocolates.png';
  }
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) {
    return '/images/italian_olive_oil.png';
  }
  if (name.includes('cheese') || name.includes('manchego') || name.includes('tilsiter') || name.includes('bergkäse') || name.includes('camembert') || name.includes('gouda')) {
    return '/images/spanish_manchego.png';
  }
  if (name.includes('sausage') || name.includes('speck') || name.includes('deli') || name.includes('marzipan') || name.includes('ham') || name.includes('prosciutto')) {
    return '/images/german_delicatessen.png';
  }
  return undefined;
};

// Gradients to assign to food cards for a premium feel
const GRADIENTS = [
  'from-rose-500/20 via-pink-500/10 to-orange-500/5',
  'from-emerald-500/20 via-teal-500/10 to-blue-500/5',
  'from-amber-500/20 via-orange-500/10 to-yellow-500/5',
  'from-violet-500/20 via-indigo-500/10 to-purple-500/5',
  'from-cyan-500/20 via-sky-500/10 to-blue-500/5',
];

export default function DiscoveryCanvas({ products, onQuickCheckout, isLoading }: DiscoveryCanvasProps) {
  const [viewMode, setViewMode] = useState<'cosmos' | 'editorial'>('cosmos');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Parallax tracker for Cosmos View
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || viewMode !== 'cosmos') return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalize coordinates from -1 to 1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredProduct(null);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Render Skeleton UI
  if (isLoading) {
    return (
      <div className="w-full h-128 flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/20 rounded-3xl border border-gray-250/30 dark:border-gray-800">
        <div className="space-y-4 text-center">
          <div className="relative flex justify-center items-center">
            <span className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-20"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-500"></span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase">Loading Product Canvas...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-20 px-8 text-center bg-gray-50/50 dark:bg-gray-950/20 rounded-3xl border border-gray-200/50 dark:border-gray-800">
        <span className="text-4xl">🔍</span>
        <h3 className="text-base font-bold text-gray-800 dark:text-white mt-4">No foods found</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Try searching for a broader term, or reset the search to view all listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Switcher & View controls */}
      <div className="flex justify-between items-center px-4">
        <div className="text-left">
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Canvas Discovery Flow</h2>
          <p className="text-lg font-black text-brand-dark dark:text-white mt-0.5">Explore Europe&apos;s Artisanal Pantry</p>
        </div>

        {/* Dynamic View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-900/60 p-1 rounded-full border border-gray-200/50 dark:border-gray-800">
          <button
            onClick={() => setViewMode('cosmos')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'cosmos'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <span>Interactive Cosmos</span>
          </button>
          <button
            onClick={() => setViewMode('editorial')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'editorial'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span>Editorial Scroll</span>
          </button>
        </div>
      </div>

      {/* View Container */}
      {viewMode === 'cosmos' ? (
        /* COSMOS VIEW */
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-128 md:h-[500px] overflow-hidden rounded-3xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 border border-gray-200/50 dark:border-gray-850 shadow-inner flex items-center justify-center cursor-default select-none"
        >
          {/* Subtle Ambient Background Orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/5 filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/5 filter blur-3xl" />

          {/* Central Anchor Node */}
          <div className="absolute text-center z-0 pointer-events-none scale-90 md:scale-100 opacity-20 dark:opacity-10">
            <span className="text-7xl font-light tracking-widest text-brand-dark dark:text-white uppercase font-display select-none">
              EU-CURATED
            </span>
          </div>

          {/* Dynamic Nodes Container */}
          <div className="absolute inset-0 z-10 p-8">
            {products.slice(0, 8).map((product, idx) => {
              const sellerName = product.seller?.name?.trim() || 'Seller identity unavailable';
              // Pre-calculate custom float offsets and coordinates so they stay consistent
              const angle = (idx * 2 * Math.PI) / Math.min(products.length, 8);
              const radiusX = 28 + (idx % 2 ? 6 : 0); // % radius width
              const radiusY = 24 + (idx % 3 ? 4 : 0); // % radius height
              
              // Base coordinates in percent relative to center
              const baseX = Math.cos(angle) * radiusX;
              const baseY = Math.sin(angle) * radiusY;

              // Apply mouse positions to get magnet-shifting effect
              // Higher index nodes have faster magnet response
              const magnetStrength = 15 + (idx % 3) * 5; 
              const offsetX = mousePos.x * magnetStrength;
              const offsetY = mousePos.y * magnetStrength;

              // Float animation delay offset
              const floatDelay = idx * 0.4;

              const isHovered = hoveredProduct === product.id;

              return (
                <div
                  key={product.id}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  className="absolute transition-all duration-300 ease-out"
                  style={{
                    left: `calc(50% + ${baseX}% + ${offsetX}px)`,
                    top: `calc(50% + ${baseY}% + ${offsetY}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Glowing Hover Halo */}
                  {isHovered && (
                    <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-md animate-pulse pointer-events-none" />
                  )}

                  {/* Dynamic Product Bubble */}
                  <div
                    className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/60 dark:border-gray-800 shadow-md bg-white dark:bg-gray-900 overflow-hidden flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-transform duration-300 hover:scale-110 hover:-translate-y-1 ${
                      idx % 2 === 0 ? 'animate-float-a' : 'animate-float-b'
                    }`}
                    style={{
                      animationDelay: `${floatDelay}s`,
                    }}
                  >
                    {/* Background image preview */}
                    {getFoodImage(product.name) ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center filter saturate-75 brightness-[0.8] dark:brightness-[0.6] group-hover:saturate-100 group-hover:brightness-95 transition-all duration-300"
                        style={{ backgroundImage: `url(${getFoodImage(product.name)})` }}
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-tr ${GRADIENTS[idx % GRADIENTS.length]} opacity-60`} />
                    )}

                    {/* Dark gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-0" />

                    {/* Node Text Content */}
                    <div className="relative z-10 flex flex-col justify-end h-full text-white pointer-events-none">
                      <span className="text-[10px] font-bold tracking-tight uppercase line-clamp-2 leading-none mb-1">
                        {product.name.split(' ').slice(-2).join(' ')}
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Country Badge */}
                    <div className="absolute top-1 right-1 bg-white/90 dark:bg-gray-950/90 rounded-full px-1 py-0.5 text-[10px] shadow-sm z-20 border border-gray-150/40">
                      {product.country === 'Spain' ? '🇪🇸' :
                       product.country === 'Belgium' ? '🇧🇪' :
                       product.country === 'Italy' ? '🇮🇹' :
                       product.country === 'Germany' ? '🇩🇪' :
                       product.country === 'France' ? '🇫🇷' :
                       product.country === 'Greece' ? '🇬🇷' :
                       product.country === 'Austria' ? '🇦🇹' :
                       product.country === 'Portugal' ? '🇵🇹' : '🇪🇺'}
                    </div>
                  </div>

                  {/* COMPLIANCE-REVIEW: DSA Art. 30 requires persistent seller identity display. */}
                  <p
                    className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 w-24 -translate-x-1/2 break-words rounded-md bg-white/95 px-1 py-0.5 text-center text-[8px] font-medium leading-tight text-gray-800 shadow-sm dark:bg-gray-950/95 dark:text-gray-100"
                    aria-label={`Sold by ${sellerName}`}
                    data-testid="seller-identity"
                  >
                    Sold by {sellerName}
                  </p>

                  {/* Glassmorphic Hover Details Panel */}
                  {isHovered && (
                    <div
                      className="absolute z-50 mt-4 w-72 p-4 rounded-2xl bg-white/95 dark:bg-gray-950/95 border border-gray-150 dark:border-gray-800 shadow-2xl backdrop-blur-md animate-fade-in text-left pointer-events-auto"
                      style={{
                        left: baseX < 0 ? '110%' : 'auto',
                        right: baseX >= 0 ? '110%' : 'auto',
                        top: '-30px',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-extrabold text-brand-dark dark:text-white uppercase tracking-wider">{product.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{product.country}</span>
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Seller identity and verification supplied by the API */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-900">
                        <p className="text-[10px] text-gray-600 dark:text-gray-300" aria-label={`Sold by ${sellerName}`}>
                          Sold by <strong>{sellerName}</strong>
                        </p>
                        {product.seller?.verified && <VerifiedSellerBadge />}

                        {product.allergens && product.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.allergens.map((allergen) => (
                              <span
                                key={allergen}
                                className="px-1.5 py-0.5 text-[9px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded border border-rose-100 dark:border-rose-900/40"
                              >
                                ⚠ {allergen}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Click checkout action */}
                      <button
                        onClick={() => onQuickCheckout(product)}
                        className="w-full mt-3 bg-brand-dark dark:bg-emerald-600 text-white dark:text-white text-xs font-bold py-2 px-3 rounded-xl transition duration-150 hover:bg-brand-dark/95 dark:hover:bg-emerald-500 text-center flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      >
                        <span>Frictionless Buy Now</span>
                        <span className="text-[10px] opacity-75">➔</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* EDITORIAL CAROUSEL VIEW */
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8 px-4 rounded-3xl border border-gray-250/20 dark:border-gray-800">
          {/* Scroll Navigation Buttons */}
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-emerald-500 hover:border-emerald-500 dark:hover:border-emerald-500 transition duration-200"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-emerald-500 hover:border-emerald-500 dark:hover:border-emerald-500 transition duration-200"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Horizontal Scrolling Ribbon */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none px-12 py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product, idx) => {
              const bgImg = getFoodImage(product.name);
              const sellerName = product.seller?.name?.trim() || 'Seller identity unavailable';
              return (
                <div
                  key={product.id}
                  className="w-72 md:w-80 shrink-0 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {/* Photo area */}
                  <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {bgImg ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center filter saturate-[0.8] group-hover:scale-105 group-hover:saturate-100 transition-all duration-500"
                        style={{ backgroundImage: `url(${bgImg})` }}
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} opacity-60`} />
                    )}

                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Regional origin flag */}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-950/90 rounded-full px-2.5 py-1 text-xs font-extrabold shadow-sm border border-gray-150/40 flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <span>
                        {product.country === 'Spain' ? '🇪🇸' :
                         product.country === 'Belgium' ? '🇧🇪' :
                         product.country === 'Italy' ? '🇮🇹' :
                         product.country === 'Germany' ? '🇩🇪' :
                         product.country === 'France' ? '🇫🇷' :
                         product.country === 'Greece' ? '🇬🇷' :
                         product.country === 'Austria' ? '🇦🇹' :
                         product.country === 'Portugal' ? '🇵🇹' : '🇪🇺'}
                      </span>
                      <span>{product.country}</span>
                    </div>

                    {/* Pricing Badge */}
                    <div className="absolute bottom-4 right-4 bg-emerald-600 text-white font-extrabold px-3 py-1 rounded-xl text-sm shadow-md">
                      €{product.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Category */}
                      <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                        {product.category || 'Artisanal Selection'}
                      </span>
                      
                      {/* Name */}
                      <h3 className="text-sm font-extrabold text-brand-dark dark:text-white mt-1 leading-snug tracking-tight uppercase line-clamp-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>

                      {/* COMPLIANCE-REVIEW: DSA Art. 30 requires persistent seller identity display. */}
                      <p
                        className="mt-1 text-[11px] text-gray-600 dark:text-gray-300"
                        aria-label={`Sold by ${sellerName}`}
                        data-testid="seller-identity"
                      >
                        Sold by <strong>{sellerName}</strong>
                      </p>

                      {/* Description */}
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    {/* Verification state and allergens */}
                    <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-gray-900">
                      {product.seller?.verified && <VerifiedSellerBadge />}

                      {product.allergens && product.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="px-1.5 py-0.5 text-[9px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded border border-rose-100 dark:border-rose-900/40"
                            >
                              ⚠ {allergen}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Instant Purchase Button */}
                    <button
                      onClick={() => onQuickCheckout(product)}
                      className="w-full mt-2 bg-brand-dark dark:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-emerald-700 dark:hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Frictionless Buy</span>
                      <span className="text-[10px] opacity-75">➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded CSS custom float animations to avoid styling breaks */}
      <style jsx global>{`
        @keyframes floatA {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateY(-6px) rotate(1deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateY(-8px) rotate(-1deg); }
        }
        .animate-float-a {
          animation: floatA 5s ease-in-out infinite;
        }
        .animate-float-b {
          animation: floatB 6s ease-in-out infinite;
        }
        /* Custom scrollbar elimination */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
