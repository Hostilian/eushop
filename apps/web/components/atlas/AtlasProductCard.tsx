import React from 'react';
import type { DemoProduct } from '../../data/demo-products';
import { getAssetPath } from '../../lib/asset-path';

interface AtlasProductCardProps {
  product: DemoProduct;
  onQuickView: (product: DemoProduct) => void;
  onAddToCart: (product: DemoProduct) => void;
}

export const AtlasProductCard: React.FC<AtlasProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
}) => {
  const defaultImage = getAssetPath(product.imageUrl || product.images?.[0] || '/images/iconic_european_dishes.png');

  return (
    <div className="group bg-[#F6F0E5] border border-[#201B17]/15 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#201B17]/40 transition-all duration-300 flex flex-col justify-between font-sans">
      <div>
        {/* Visual Header / Photography Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#201B17] cursor-pointer" onClick={() => onQuickView(product)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={defaultImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Overlays */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#201B17]/90 text-[#F6F0E5] border border-white/20 backdrop-blur">
              {product.countryIso2} · {product.country}
            </span>
            {product.qualityScheme && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#D29A38] text-[#201B17] shadow-md">
                {product.qualityScheme} Protected
              </span>
            )}
          </div>

          {/* Quick View Button Overlay */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#201B17]/90 hover:bg-[#201B17] text-[#F6F0E5] text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur shadow-lg flex items-center gap-1"
          >
            <span>👁️</span> Quick View
          </button>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#385543] block">
              {product.category || 'Specialty Food'}
            </span>
            <h3
              onClick={() => onQuickView(product)}
              className="text-lg font-black text-[#201B17] group-hover:text-[#B54232] transition-colors leading-tight font-display cursor-pointer mt-0.5"
            >
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-[#201B17]/70 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Secondary Metadata Badge */}
          <div className="bg-[#201B17]/5 p-2.5 rounded-xl text-[11px] text-[#201B17]/80 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-bold text-[#201B17]">{product.netQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Allergens:</span>
              <span className="font-bold text-[#B54232] truncate max-w-[140px]">
                {product.allergens && product.allergens.length > 0 ? product.allergens.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Pricing & Add to Cart */}
      <div className="p-5 pt-0 border-t border-[#201B17]/10 mt-3 flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase font-mono font-bold text-[#201B17]/50 block">Producer Price</span>
          <span className="text-2xl font-black text-[#201B17] font-mono">€{product.price.toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="px-5 py-2.5 bg-[#385543] hover:bg-[#2c4435] text-white font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
        >
          <span>🛒</span> Add to Cart
        </button>
      </div>
    </div>
  );
};
