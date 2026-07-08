import { useState, useRef, useEffect } from 'react';
import { FoodItem, orderAPI } from '../lib/services';

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

  // Reset checkout state when product changes or opens
  useEffect(() => {
    if (isOpen) {
      setSliderVal(0);
      setCheckoutStep('idle');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Calculate pricing metrics
  const price = product.price;
  const shipping = 2.99;
  const finderFee = product.finderFee || 2.50;
  // 7% typical reduced VAT for groceries in Germany
  const vatRate = 0.07;
  const vat = price * vatRate;
  const total = price + shipping + finderFee + vat;

  // Confetti generator
  const triggerConfetti = () => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      top: Math.random() * 50 + 20, // percentage
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
    }));
    setConfetti(particles);
  };

  // Drag handlers for payment slider
  const handleStart = () => {
    if (checkoutStep !== 'idle') return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const width = rect.width - 56; // Width minus button width
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
    if (sliderVal < 98) {
      // Snap back to start
      setSliderVal(0);
    }
  };

  // Mobile Touch handlers
  const handleTouchStart = () => handleStart();
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };
  const handleTouchEnd = () => handleEnd();

  // Mouse drag handlers
  const handleMouseDown = () => handleStart();
  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };
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
    
    // Simulate biometric scan & order registration
    setTimeout(async () => {
      try {
        // Build compliance pre-certified order payload
        await orderAPI.create({
          foodId: product.id,
          sellerId: product.sellerId,
          quantity: 1,
          totalPrice: total,
          finderFee: finderFee,
          shippingAddress: 'Müllerstraße 42, 10115 Berlin, Germany',
          message: 'Zero-step biometric checkout order.',
          stripePaymentIntentId: `pi_wallet_${Date.now()}`
        });

        // Trigger local storage cart dispatch to refresh counts
        window.dispatchEvent(new Event('cart-updated'));

        setCheckoutStep('success');
        triggerConfetti();
      } catch (err) {
        console.error('Checkout creation failed:', err);
        setCheckoutStep('idle');
        setSliderVal(0);
      }
    }, 1600); // Pulse biometric feedback duration
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={checkoutStep === 'authorizing' ? undefined : onClose}
      />

      {/* Slide-out Sheet */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-950 border-l border-gray-150 dark:border-gray-900 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left z-10">
        
        {/* Floating Confetti Particles */}
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

        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/10">
          <div>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Checkout Portal</h3>
            <p className="text-xs font-black text-emerald-500 flex items-center gap-1 mt-0.5">
              <span>●</span>
              <span>Secure EU-Wallet Link</span>
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

        {/* Middle Details Scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Order Summary Item */}
          <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-850">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/5 border border-emerald-500/10 flex items-center justify-center text-2xl">
              {product.name.includes('Chocolate') ? '🍫' :
               product.name.includes('Balsamic') || product.name.includes('Oil') ? '🍇' :
               product.name.includes('Cheese') || product.name.includes('Camembert') || product.name.includes('Gouda') ? '🧀' :
               product.name.includes('Ham') || product.name.includes('Prosciutto') ? '🍖' : '🥖'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                {product.category || 'Direct EU Import'}
              </span>
              <h4 className="text-sm font-extrabold text-brand-dark dark:text-white uppercase truncate mt-0.5">{product.name}</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                <span>By {product.seller?.name || 'Local Producer'}</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold">★ {product.seller?.rating || '5.0'}</span>
              </p>
            </div>
          </div>

          {/* Delivery & Routing Pre-fills (Frictionless Pitch View) */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Shipping & Compliance Route</h4>
            
            <div className="space-y-2">
              {/* Shipping Address */}
              <div className="flex gap-3 text-xs leading-normal">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">German Delivery Address (OSS Prefilled)</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Müllerstraße 42, 10115 Berlin, Germany</p>
                </div>
              </div>

              {/* Regulatory Logistics status */}
              <div className="flex gap-3 text-xs leading-normal border-t border-gray-50 dark:border-gray-900 pt-2.5">
                <span className="text-lg">🛡️</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Compliance & Animal Welfare Checks</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Regulation EU 1169/2011 allergen compliance verified. Trader tax registered.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown (DAC7/OSS Compliant) */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-900">
            <h4 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Direct Transaction Summary</h4>
            
            <div className="space-y-2 bg-gray-50/50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 font-mono text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Artisanal Price</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Regulatory OSS VAT (7% grocery rate)</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pan-EU Carbon Neutral Shipping</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>EUshop Finder Fee (OSS Compliance)</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">€{finderFee.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2 flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                <span>TOTAL TRANSACTION</span>
                <span className="text-sm font-black">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Action Trigger */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-gray-50/70 dark:bg-gray-950">
          {checkoutStep === 'idle' && (
            <div className="space-y-3">
              {/* Payment slider track */}
              <div
                ref={sliderTrackRef}
                className="relative h-14 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center p-1 overflow-hidden border border-gray-300/20"
                onMouseMove={(e) => {
                  if (isDragging) handleMove(e.clientX);
                }}
              >
                {/* Swipe guidance text */}
                <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse pointer-events-none select-none">
                  Slide to Pay instantly
                </div>

                {/* Filled slider track highlight */}
                <div
                  className="absolute left-1 top-1 bottom-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-75"
                  style={{ width: `calc(${sliderVal}% + 48px)` }}
                />

                {/* Draggable slider handle */}
                <div
                  onMouseDown={(e) => {
                    handleMouseDown();
                    attachMouseListeners();
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="relative z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-150 select-none text-emerald-500 border border-gray-200 dark:border-gray-700"
                  style={{
                    transform: `translateX(calc(${sliderVal}*0.01 * (100% - 48px)))`,
                    left: `${sliderVal}%`,
                  }}
                >
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-semibold">
                Single-action authorization. Bypasses cart checkout structures.
              </p>
            </div>
          )}

          {checkoutStep === 'authorizing' && (
            <div className="py-4 text-center space-y-4">
              {/* Pulsing circular biometric indicator */}
              <div className="relative flex justify-center items-center h-16 w-16 mx-auto">
                <span className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-emerald-400 opacity-20"></span>
                <span className="absolute animate-pulse inline-flex h-12 w-12 rounded-full bg-emerald-500 opacity-30"></span>
                <div className="relative rounded-full h-10 w-10 bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a4 4 0 118 0v4c0 .878.346 1.71.963 2.327l.154.154a4.801 4.801 0 003.394 1.406" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">Biometric Check Active</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-mono">Connecting to EU-Wallet Gateway &amp; Authorizing OSS Tax Ledger...</p>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="py-2 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Transaction Authorized</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed px-4">
                  Order saved to your browser sandbox database. A real-time webhook was dispatched to the Spring Core monolith.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-emerald-500 active:scale-95 transition-all text-center"
              >
                Continue Discovering
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded CSS custom animations for Checkout */}
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
