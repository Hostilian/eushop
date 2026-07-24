import React from 'react';

export type AtlasViewMode = 'map' | 'shop' | 'stories';

interface AtlasViewToggleProps {
  activeView: AtlasViewMode;
  onViewChange: (view: AtlasViewMode) => void;
  resultCount: number;
}

export const AtlasViewToggle: React.FC<AtlasViewToggleProps> = ({
  activeView,
  onViewChange,
  resultCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-[#201B17]/10">
      {/* Segmented Control */}
      <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#201B17]/5 border border-[#201B17]/10 shadow-inner">
        <button
          onClick={() => onViewChange('map')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeView === 'map'
              ? 'bg-[#201B17] text-[#F6F0E5] shadow-md'
              : 'text-[#201B17]/70 hover:text-[#201B17]'
          }`}
        >
          <span>🗺️</span> Map Explorer
        </button>

        <button
          onClick={() => onViewChange('shop')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeView === 'shop'
              ? 'bg-[#201B17] text-[#F6F0E5] shadow-md'
              : 'text-[#201B17]/70 hover:text-[#201B17]'
          }`}
        >
          <span>🛒</span> Shop Catalog ({resultCount})
        </button>

        <button
          onClick={() => onViewChange('stories')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeView === 'stories'
              ? 'bg-[#201B17] text-[#F6F0E5] shadow-md'
              : 'text-[#201B17]/70 hover:text-[#201B17]'
          }`}
        >
          <span>📖</span> Editorial Terroir
        </button>
      </div>

      {/* Result Indicator */}
      <div className="text-xs font-mono font-bold text-[#201B17]/60 flex items-center gap-2">
        <span>SHOWING:</span>
        <span className="px-2.5 py-1 rounded-lg bg-[#385543]/10 text-[#385543] border border-[#385543]/20">
          {resultCount} Authentic European Foods
        </span>
      </div>
    </div>
  );
};
