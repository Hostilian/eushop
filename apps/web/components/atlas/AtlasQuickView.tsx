import React, { useState } from 'react';
import type { DemoProduct } from '../../data/demo-products';

interface AtlasQuickViewProps {
  product: DemoProduct | null;
  onClose: () => void;
  onAddToCart: (product: DemoProduct, quantity: number) => void;
}

export const AtlasQuickView: React.FC<AtlasQuickViewProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) return null;

  const defaultImage = product.imageUrl || product.images?.[0] || '/images/iconic_european_dishes.png';

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 flex items-center justify-center animate-fade-in font-sans">
      <div className="relative max-w-4xl w-full bg-[#F6F0E5] text-[#201B17] border border-[#201B17]/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Product Photography */}
        <div className="md:w-1/2 relative bg-[#201B17] min-h-[280px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={defaultImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#201B17]/90 text-white border border-white/20">
              {product.countryIso2} · {product.country}
            </span>
            {product.qualityScheme && (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#D29A38] text-[#201B17]">
                {product.qualityScheme} Protected
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Statutory FIC Information & Cart Actions */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#201B17]/15 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#385543] uppercase">
                  {product.category || 'Specialty Food'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#201B17] font-display">
                  {product.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#201B17]/10 hover:bg-[#201B17]/20 text-[#201B17] font-bold text-base flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#201B17]/80 leading-relaxed">
              {product.description}
            </p>

            {/* FIC 1169/2011 Statutory Information Box */}
            <div className="bg-[#201B17]/5 p-4 rounded-2xl border border-[#201B17]/15 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#201B17]/60">Net Quantity:</span>
                <strong className="text-[#201B17]">{product.netQuantity}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#201B17]/60">Ingredients:</span>
                <strong className="text-[#201B17] truncate max-w-[200px]">{product.ingredients}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#201B17]/60">EU Allergens:</span>
                <strong className="text-[#B54232]">
                  {product.allergens && product.allergens.length > 0 ? product.allergens.join(', ') : 'None Declared'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#201B17]/60">Storage Instructions:</span>
                <strong className="text-[#201B17] truncate max-w-[200px]">{product.storageInstructions}</strong>
              </div>
            </div>

            {/* Food Business Operator / Producer Badge */}
            <div className="p-3.5 bg-[#385543]/10 border border-[#385543]/20 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#385543] uppercase block">
                Food Business Operator (FBO)
              </span>
              <p className="font-bold text-[#201B17]">{product.foodBusinessOperator.name}</p>
              <p className="text-[11px] text-[#201B17]/70">{product.foodBusinessOperator.address}</p>
            </div>
          </div>

          {/* Pricing & Add Controls */}
          <div className="pt-4 border-t border-[#201B17]/15 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#201B17]/50 uppercase block">Unit Price</span>
                <span className="text-3xl font-black text-[#201B17] font-mono">€{product.price.toFixed(2)}</span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#201B17]/20 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-[#201B17] font-bold hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 font-mono font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-[#201B17] font-bold hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 bg-[#385543] hover:bg-[#2c4435] text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>🛒</span> Add {quantity} to Basket — €{(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
