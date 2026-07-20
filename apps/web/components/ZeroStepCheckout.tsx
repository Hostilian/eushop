import { useState, useRef, useEffect } from 'react';
import { FoodItem, orderAPI } from '../lib/services';
// COMPLIANCE-REVIEW: VAT rate here uses DE as a placeholder until real address
// collection is wired in. Do NOT treat this as production VAT logic.
// getFoodVatRate must receive the buyer's actual destination country at checkout.
import { getFoodVatRate } from '@eushop/compliance';

interface ZeroStepCheckoutProps {
  product: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ZeroStepCheckout({ product, isOpen, onClose }: ZeroStepCheckoutProps) {
  const [sliderVal, setSliderVal] = useState(0);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [confetti, setConfetti] = useState<{ id: number; left: number; top: number; color: string; size: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setSliderVal(0);
        setCheckoutStep('idle');
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const price = product.price;
  const shipping = 2.99;
  const finderFee = product.finderFee || 2.50;
  // COMPLIANCE-REVIEW: Using DE (7%) as placeholder. Must be replaced with the
  // buyer's actual destination country before production use.
  const vatRate = getFoodVatRate('DE');
  const vat = price * vatRate;
  const total = price + shipping + finderFee + vat;

  const triggerConfetti = () => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 50 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
    }));
    setConfetti(particles);
  };

  const handleStart = () => {
    if (checkoutStep !== 'idle') return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const width = rect.width - 56;
    const currentX = clientX - rect.left - 28;
    const pct = Math.min(Math.max(0, (currentX / width) * 100), 100);
    setSliderVal(pct);
    if (pct >= 98) {
      setIsDragging(false);
      setSliderVal(100);
      handleAuthorizationStart();
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (sliderVal < 98) setSliderVal(0);
  };

  const handleTouchStart = () => handleStart();
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => handleEnd();

  const handleMouseDown = () => handleStart();
  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleMouseUp = () => {
    handleEnd();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  const attachMouseListeners = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleAuthorizationStart = async () => {
    setCheckoutStep('authorizing');
    setTimeout(async () => {
      try {
        await orderAPI.create({
          foodId: product.id,
          sellerId: product.sellerId,
          quantity: 1,
          totalPrice: total,
          finderFee: finderFee,
          shippingAddress: '',
          message: 'Quick-add from discovery canvas. Address required at checkout.',
          stripePaymentIntentId: `pi_pending_${Date.now()}`,
        });
        window.dispatchEvent(new Event('cart-updated'));
        setCheckoutStep('success');
        triggerConfetti();
      } catch (err) {
        console.error('Quick-add failed:', err);
        setCheckoutStep('idle');
        setSliderVal(0);
      }
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={checkoutStep === 'authorizing' ? undefined : onClose}
      />

      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-950 border-l border-gray-150 dark:border-gray-900 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left z-10">

        {checkoutStep === 'success' && confetti.map((c) => (
          <div
            key={c.id}
            className="absolute rounded-full pointer-events-none animate-confetti-fall z-50"
            style={{
              left: `${c.left}%`,
              top: `${c.top}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              backgroundColor: c.color,
              animationDelay: `${c.id * 0.05}s`,
            }}
          />
        ))}

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/10">
          <div>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick Add</h3>
            <p className="text-xs font-black text-emerald-500 flex items-center gap-1 mt-0.5">
              <span aria-hidden="true">●</span>
              <span>Secure Checkout</span>
            </p>
          </div>
          {checkoutStep !== 'authorizing' && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              aria-label="Close panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-850">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/5 border border-emerald-500/10 flex items-center justify-center text-2xl" aria-hidden="true">
              {product.name.includes('Chocolate') ? '🍫' :
               product.name.includes('Balsamic') || product.name.includes('Oil') ? '🍇' :
               product.name.includes('Cheese') || product.name.includes('Camembert') || product.name.includes('Gouda') ? '🧀' :
               product.name.includes('Ham') || product.name.includes('Prosciutto') ? '🍖' : '🥖'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                {product.category || 'Artisanal Food'}
              </span>
              <h4 className="text-sm font-extrabold text-brand-dark dark:text-white uppercase truncate mt-0.5">{product.name}</h4>
              {/* COMPLIANCE-REVIEW: DSA Art. 30 requires persistent seller identity display. */}
              <p
                className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5"
                aria-label={`Sold by ${product.seller?.name?.trim() || 'Seller identity unavailable'}`}
                data-testid="seller-identity"
              >
                <span>Sold by {product.seller?.name?.trim() || 'Seller identity unavailable'}</span>
                {product.seller?.verified && (
                  <span className="text-emerald-500 font-bold" aria-label="Verified EU Trader">✓</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Shipping</h4>
            <div className="space-y-2">
              <div className="flex gap-3 text-xs leading-normal">
                <span className="text-lg" aria-hidden="true">📍</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Delivery Address</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Enter your address at checkout to confirm delivery and VAT rate.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-xs leading-normal border-t border-gray-50 dark:border-gray-900 pt-2.5">
                <span className="text-lg" aria-hidden="true">🛡️</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Allergen Information</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Full allergen disclosure is shown on the product listing per EU Reg. 1169/2011.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-900">
            <h4 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price Estimate</h4>
            <div className="space-y-2 bg-gray-50/50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 font-mono text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Item price</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{price.toFixed(2)}</span>
              </div>
              {/* COMPLIANCE-REVIEW: VAT shown is an estimate using DE rate as placeholder */}
              <div className="flex justify-between">
                <span>VAT est. ({(vatRate * 100).toFixed(1)}% — confirmed at checkout)</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>EUshop fee</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{finderFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2 flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                <span>ESTIMATED TOTAL</span>
                <span className="text-sm font-black">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-gray-50/70 dark:bg-gray-950">
          {checkoutStep === 'idle' && (
            <div className="space-y-3">
              <div
                ref={sliderTrackRef}
                className="relative h-14 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center p-1 overflow-hidden border border-gray-300/20"
                onMouseMove={(e) => { if (isDragging) handleMove(e.clientX); }}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderVal)}
                aria-label="Slide to add to cart"
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse pointer-events-none select-none">
                  Slide to add to cart
                </div>
                <div
                  className="absolute left-1 top-1 bottom-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-75"
                  style={{ width: `calc(${sliderVal}% + 48px)` }}
                />
                <div
                  onMouseDown={() => { handleMouseDown(); attachMouseListeners(); }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="relative z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-150 select-none text-emerald-500 border border-gray-200 dark:border-gray-700"
                  style={{ transform: `translateX(calc(${sliderVal}*0.01 * (100% - 48px)))` }}
                  aria-hidden="true"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-semibold">
                Adds to cart. Complete address and payment at checkout.
              </p>
            </div>
          )}

          {checkoutStep === 'authorizing' && (
            <div className="py-4 text-center space-y-4">
              <div className="relative flex justify-center items-center h-16 w-16 mx-auto">
                <span className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-emerald-400 opacity-20"></span>
                <span className="absolute animate-pulse inline-flex h-12 w-12 rounded-full bg-emerald-500 opacity-30"></span>
                <div className="relative rounded-full h-10 w-10 bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">Adding to cart…</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Please wait.</p>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="py-2 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Added to cart</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed px-4">
                  Go to cart to enter your delivery address and complete payment.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-emerald-500 active:scale-95 transition-all text-center"
              >
                Go to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideLeft {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-confetti-fall {
          animation: confettiFall 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
      `}</style>
    </div>
  );
}
