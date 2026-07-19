import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PageWrapper } from '../components/layout/PageWrapper';
import { paymentAPI, orderAPI, foodAPI, authAPI, User } from '../lib/services';
import {
  calculateFoodVat,
  EU_FOOD_VAT_RATES,
  OSS_THRESHOLD_EUR,
} from '@eushop/compliance';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_51MockPublicKeyForCheckoutCompilationOnly');

const EU_COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
  CZ: 'Czech Republic', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
  DE: 'Germany', GR: 'Greece', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
  LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia',
  ES: 'Spain', SE: 'Sweden',
};

const VAT_COUNTRY_OPTIONS = Object.keys(EU_FOOD_VAT_RATES).sort((left, right) =>
  EU_COUNTRY_NAMES[left].localeCompare(EU_COUNTRY_NAMES[right])
);

interface CartItem {
  id: string;
  name: string;
  country: string;
  price: number;
  quantity: number;
  sellerId?: string;
  finderFee?: number;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    acceptTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    // Fetch user details
    const fetchUser = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setFormData(prev => ({
            ...prev,
            email: currentUser.email,
            country: EU_FOOD_VAT_RATES[currentUser.country.toUpperCase()] !== undefined
              ? currentUser.country.toUpperCase()
              : '',
            // Potentially pre-fill name/address if available on user object
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user for checkout:', error);
      }
    };
    fetchUser();

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items: CartItem[] = JSON.parse(savedCart);
        
        // Fetch detailed information to populate sellerId and finderFee
        const fetchDetails = async () => {
          const detailed = await Promise.all(items.map(async (item) => {
            try {
              const detail = await foodAPI.getById(item.id);
              const data = (detail as any)?.data || detail;
              return {
                ...item,
                sellerId: data?.sellerId || data?.seller?.id || 'seller_belgium@eushop.local',
                finderFee: data?.finderFee || data?.finder_fee || 5.00
              };
            } catch {
              // Mock fallback IDs
              return {
                ...item,
                sellerId: item.id === '1' ? 'seller_belgium@eushop.local' : 'seller_italy@eushop.local',
                finderFee: 5.00
              };
            }
          }));
          setCartItems(detailed);
        };

        fetchDetails();
      } catch (error) {
        console.error('Failed to parse cart:', error);
      }
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // COMPLIANCE-REVIEW: VAT rate source = packages/compliance/src/vat.ts
  // Catalog prices are treated as VAT-exclusive here. A tax advisor must confirm
  // product classification, shipping treatment, and invoice rounding before launch.
  const vatCalculation = formData.country
    ? calculateFoodVat(subtotal, formData.country)
    : { rate: 0, vatAmountEur: 0, grossAmountEur: subtotal };
  const vatRate = vatCalculation.rate;
  const vat = vatCalculation.vatAmountEur;
  const shipping = subtotal > 0 ? 9.99 : 0;
  const grandTotal = vatCalculation.grossAmountEur + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card input is not loaded');
      }

      // 1. Create Payment Intent via backend
      // We pass the sellerAccountId of the first item for simplicity or empty for multi-seller platform collections
      const sellerId = cartItems.length > 0 ? cartItems[0].sellerId : undefined;
      const res = await paymentAPI.createPaymentIntent(grandTotal, 'eur', sellerId);
      const clientSecret = res.clientSecret; // Access directly from response.data

      if (!clientSecret) {
        throw new Error('Failed to retrieve client secret from payment provider');
      }

      // 2. Confirm card payment with Stripe
      if (clientSecret.startsWith('pi_mock_secret')) {
        // Mock success for development fallback
        console.log('Simulating mock checkout success');
      } else {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Payment failed');
        }
      }

      // 3. Register orders in backend
      const shippingAddressStr = `${formData.address}, ${formData.postalCode} ${formData.city}, ${formData.country}`;
      
      await Promise.all(cartItems.map(async (item) => {
        const orderPayload = {
          foodId: item.id,
          sellerId: item.sellerId || 'seller_belgium@eushop.local',
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          finderFee: (item.finderFee || 5.00) * item.quantity,
          shippingAddress: shippingAddressStr,
          message: 'Order placed securely via web portal',
          stripePaymentIntentId: res.id
        };
        await orderAPI.create(orderPayload);
      }));

      // 4. Clear cart & show confirmation
      localStorage.setItem('cart', '[]');
      setOrderPlaced(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center font-sans text-gray-800 dark:text-gray-200 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/20">
            <span className="text-3xl text-success font-bold">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Thank you for shopping at EUshop. Your payment has been processed and the orders have been registered with the sellers.
          </p>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-left mb-8 text-sm text-gray-700">
            <p className="font-bold text-brand-dark mb-2">Shipping Details:</p>
            <p className="font-medium text-gray-800">{formData.firstName} {formData.lastName}</p>
            <p>{formData.address}</p>
            <p>{formData.postalCode} {formData.city}</p>
            <p className="text-primary font-semibold mt-1">🌍 EU Country: {formData.country}</p>
          </div>
          <Link href="/dashboard" className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto py-6">
        <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-8 font-display">Secure Checkout</h1>

        {errorMessage && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark mb-6 font-display">1. Delivery Address</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    value={formData.firstName}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    value={formData.lastName}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  value={formData.email}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  value={formData.address}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    value={formData.city}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    value={formData.postalCode}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">EU Country (Logistics Restricted to EU Single Market)</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  value={formData.country}
                >
                  <option value="" disabled>Select destination country</option>
                  {VAT_COUNTRY_OPTIONS.map(countryCode => (
                    <option key={countryCode} value={countryCode}>
                      {EU_COUNTRY_NAMES[countryCode]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark mb-6 font-display">2. Payment Method</h2>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Secure Card Details</label>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#1c1d1a',
                          '::placeholder': {
                            color: '#a0aec0',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark mb-6 font-display">Review Order</h2>
              
              <div className="space-y-4 border-b border-gray-100 pb-6 text-sm text-gray-700">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-2">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-semibold text-brand-dark">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-gray-400 text-xs italic">No items in cart</p>
                )}
              </div>

              <div className="space-y-4 border-b border-gray-100 py-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    VAT {formData.country
                      ? `(${(vatRate * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}% · ${formData.country})`
                      : '(select destination)'}
                  </span>
                  <span data-testid="checkout-vat-amount">{vat.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-extrabold text-brand-dark my-6">
                <span>Grand Total</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>

              <p className="-mt-2 mb-6 text-[10px] leading-relaxed text-gray-400" data-testid="oss-threshold-note">
                OSS threshold reference: {OSS_THRESHOLD_EUR.toLocaleString('en-IE', {
                  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
                })} in annual cross-border sales. Final VAT treatment depends on seller and product facts and requires tax review.
              </p>

              <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary/20 h-4 w-4"
                    onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  />
                  <span className="ml-2 text-xs text-gray-500 leading-relaxed">
                    I agree to the <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link> (including right-of-withdrawal exemptions on perishables) and <Link href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !stripe || cartItems.length === 0}
                className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold hover:opacity-95 shadow-md shadow-brand-green/10 transition disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Pay & Place Order (${grandTotal.toFixed(2)} €)`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

