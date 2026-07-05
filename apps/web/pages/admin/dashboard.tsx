import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SellerApplication {
  id: string;
  name: string;
  email: string;
  country: string;
  taxId: string;
  vatNumber: string;
  tradeRegisterNumber: string;
  address: string;
  selfCertified: boolean;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface FoodListing {
  id: string;
  name: string;
  sellerName: string;
  country: string;
  price: number;
  category: string;
  allergens: string[];
  status: 'ACTIVE' | 'FLAGGED' | 'REMOVED';
}

interface OrderRecord {
  id: string;
  buyerEmail: string;
  sellerName: string;
  productName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sellers' | 'listings' | 'orders'>('sellers');

  // Local state representing database records for moderation
  const [sellers, setSellers] = useState<SellerApplication[]>([]);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    // 1. Verify user authentication and check role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.role === 'admin' || parsed.email.includes('admin') || parsed.email === 'demo@eushop.local') {
          setAdminUser(parsed);
        } else {
          // Redirect if not admin
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Failed to parse user session:', error);
        router.push('/login');
        return;
      }
    } else {
      router.push('/login');
      return;
    }

    // 2. Load mock data for moderation management
    setSellers([
      {
        id: 'user_1',
        name: 'Gourmet Iberico S.L.',
        email: 'info@gourmetiberico.es',
        country: 'ES',
        taxId: 'ES-B12345678',
        vatNumber: 'ESB12345678',
        tradeRegisterNumber: 'REG-MADRID-9923',
        address: 'Calle Mayor 12, Madrid, 28001',
        selfCertified: true,
        status: 'PENDING',
      },
      {
        id: 'user_2',
        name: 'Bavarian Cheese Co.',
        email: 'sales@bavariancheese.de',
        country: 'DE',
        taxId: 'DE-123456789',
        vatNumber: 'DE123456789',
        tradeRegisterNumber: 'HRB-MUNICH-4412',
        address: 'Marienplatz 4, Munich, 80331',
        selfCertified: true,
        status: 'VERIFIED',
      },
      {
        id: 'user_3',
        name: 'Athena Olives Ltd.',
        email: 'contact@athenaolives.gr',
        country: 'GR',
        taxId: 'GR-998877665',
        vatNumber: 'GR998877665',
        tradeRegisterNumber: 'ATH-REG-201',
        address: 'Ermou St 45, Athens, 10563',
        selfCertified: false,
        status: 'PENDING',
      }
    ]);

    setListings([
      {
        id: 'food_1',
        name: 'Spanish Jamón Ibérico de Bellota',
        sellerName: 'Gourmet Iberico S.L.',
        country: 'ES',
        price: 89.99,
        category: 'Meats',
        allergens: [],
        status: 'ACTIVE',
      },
      {
        id: 'food_2',
        name: 'Allgäuer Mountain Cheese Wheel',
        sellerName: 'Bavarian Cheese Co.',
        country: 'DE',
        price: 34.99,
        category: 'Cheese',
        allergens: ['Dairy/Milk'],
        status: 'ACTIVE',
      },
      {
        id: 'food_3',
        name: 'Lübeck Dark Chocolate Marzipan Bar',
        sellerName: 'Bavarian Cheese Co.',
        country: 'DE',
        price: 8.50,
        category: 'Chocolates',
        allergens: ['Nuts', 'Soy'],
        status: 'FLAGGED',
      }
    ]);

    setOrders([
      {
        id: 'ord_201',
        buyerEmail: 'jean.dupont@eushop.fr',
        sellerName: 'Bavarian Cheese Co.',
        productName: 'Allgäuer Mountain Cheese Wheel',
        totalPrice: 44.98,
        status: 'DELIVERED',
        createdAt: '2026-06-28 14:32',
      },
      {
        id: 'ord_202',
        buyerEmail: 'maria.garcia@eushop.es',
        sellerName: 'Gourmet Iberico S.L.',
        productName: 'Spanish Jamón Ibérico de Bellota',
        totalPrice: 104.98,
        status: 'PENDING',
        createdAt: '2026-07-01 10:15',
      }
    ]);

    setLoading(false);
  }, [router]);

  const handleVerifySeller = (id: string, approve: boolean) => {
    setSellers(prev =>
      prev.map(seller =>
        seller.id === id
          ? { ...seller, status: approve ? 'VERIFIED' : 'REJECTED' }
          : seller
      )
    );
  };

  const handleModerateListing = (id: string, action: 'ACTIVE' | 'FLAGGED' | 'REMOVED') => {
    setListings(prev =>
      prev.map(listing =>
        listing.id === id
          ? { ...listing, status: action }
          : listing
      )
    );
  };

  const handleRefundOrder = (id: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, status: 'REFUNDED' }
          : order
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              EUshop Admin Control Center
            </span>
            <span className="bg-indigo-900/60 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-700/50">
              DSA Compliance Engine v1.1
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Logged in as: <b className="text-gray-200">{adminUser?.name}</b></span>
            <Link
              href="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition font-medium border border-gray-700"
            >
              Exit to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('sellers')}
            className={`pb-4 px-2 text-sm font-semibold transition ${
              activeTab === 'sellers'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📋 Merchant Verification (DSA Art. 30)
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-2 text-sm font-semibold transition ${
              activeTab === 'listings'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🍔 Listings Moderation (Allergens)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 text-sm font-semibold transition ${
              activeTab === 'orders'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            💳 Transaction & Refund Manager
          </button>
        </div>

        {/* TAB 1: Sellers */}
        {activeTab === 'sellers' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Pending merchant KYBC verification applications</h2>
              <p className="text-sm text-gray-400 mb-6">
                Under the EU Digital Services Act (DSA) Article 30, you must verify the seller’s identity information (trade register ID, VAT, and self-certification compliance declaration) before allowing them to offer foodstuffs on the platform.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-3 px-4">Merchant Name & Email</th>
                      <th className="py-3 px-4">Origin</th>
                      <th className="py-3 px-4">TIN & VAT IDs</th>
                      <th className="py-3 px-4">Trade Register Ref</th>
                      <th className="py-3 px-4">DSA Declaration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((seller) => (
                      <tr key={seller.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{seller.name}</div>
                          <div className="text-xs text-gray-500">{seller.email}</div>
                          <div className="text-xs text-gray-400 mt-1">{seller.address}</div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-indigo-400">{seller.country}</td>
                        <td className="py-4 px-4 font-mono text-xs">
                          <div>Tax ID: {seller.taxId}</div>
                          <div>VAT: {seller.vatNumber}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-gray-300">{seller.tradeRegisterNumber}</td>
                        <td className="py-4 px-4">
                          {seller.selfCertified ? (
                            <span className="bg-green-950/60 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-800/40">
                              ✓ Self-Certified
                            </span>
                          ) : (
                            <span className="bg-red-950/60 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-800/40">
                              ✗ Missing Certificate
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {seller.status === 'PENDING' && (
                            <span className="bg-yellow-950 text-yellow-400 text-xs px-2.5 py-1 rounded font-semibold border border-yellow-800/50">
                              Pending Review
                            </span>
                          )}
                          {seller.status === 'VERIFIED' && (
                            <span className="bg-green-950 text-green-400 text-xs px-2.5 py-1 rounded font-semibold border border-green-800/50">
                              Verified Merchant
                            </span>
                          )}
                          {seller.status === 'REJECTED' && (
                            <span className="bg-red-950 text-red-400 text-xs px-2.5 py-1 rounded font-semibold border border-red-800/50">
                              Application Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {seller.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleVerifySeller(seller.id, true)}
                                className="bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifySeller(seller.id, false)}
                                className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Food listings moderation & labeling audit</h2>
              <p className="text-sm text-gray-400 mb-6">
                All food listings targeting EU buyers must mandate precise allergen disclosures. Use this panel to review description completeness and flag or hide products violating Regulation (EU) No 1169/2011.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-3 px-4">Product Name & Category</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Allergen Declarations</th>
                      <th className="py-3 px-4">Moderation Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{listing.name}</div>
                          <div className="text-xs text-indigo-400 font-semibold">{listing.category}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{listing.sellerName}</td>
                        <td className="py-4 px-4 font-semibold text-gray-400">{listing.country}</td>
                        <td className="py-4 px-4 text-white font-mono">€{listing.price.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          {listing.allergens.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {listing.allergens.map(a => (
                                <span key={a} className="bg-amber-950/60 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-800/40">
                                  ⚠️ {a}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">None Declared</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {listing.status === 'ACTIVE' && (
                            <span className="bg-green-950/50 text-green-400 text-xs px-2 py-1 rounded border border-green-800/40">
                              Active / Public
                            </span>
                          )}
                          {listing.status === 'FLAGGED' && (
                            <span className="bg-amber-950/50 text-amber-400 text-xs px-2 py-1 rounded border border-amber-800/40 animate-pulse">
                              Flagged / Review Required
                            </span>
                          )}
                          {listing.status === 'REMOVED' && (
                            <span className="bg-red-950/50 text-red-400 text-xs px-2 py-1 rounded border border-red-800/40">
                              Hidden from Storefront
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {listing.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleModerateListing(listing.id, 'ACTIVE')}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition"
                              >
                                Restore
                              </button>
                            )}
                            {listing.status !== 'FLAGGED' && (
                              <button
                                onClick={() => handleModerateListing(listing.id, 'FLAGGED')}
                                className="bg-amber-700/80 hover:bg-amber-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition"
                              >
                                Flag
                              </button>
                            )}
                            {listing.status !== 'REMOVED' && (
                              <button
                                onClick={() => handleModerateListing(listing.id, 'REMOVED')}
                                className="bg-red-900 hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs font-semibold transition"
                              >
                                Hide
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Escrow transactions & refund operations</h2>
              <p className="text-sm text-gray-400 mb-6">
                View platform invoices and process customer requests or refunds from the secure payment system. Right of withdrawal exemptions on perishable food items must be observed.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Buyer Email</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white font-mono">{order.id}</div>
                          <div className="text-xs text-gray-500">{order.createdAt}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-300 font-mono text-xs">{order.buyerEmail}</td>
                        <td className="py-4 px-4 text-gray-400">{order.sellerName}</td>
                        <td className="py-4 px-4 text-white font-semibold">{order.productName}</td>
                        <td className="py-4 px-4 text-indigo-400 font-mono font-bold">€{order.totalPrice.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          {order.status === 'DELIVERED' && (
                            <span className="bg-green-950 text-green-400 text-xs px-2.5 py-1 rounded font-semibold border border-green-800/40">
                              Delivered
                            </span>
                          )}
                          {order.status === 'PENDING' && (
                            <span className="bg-yellow-950 text-yellow-400 text-xs px-2.5 py-1 rounded font-semibold border border-yellow-800/40">
                              Escrow / Pending
                            </span>
                          )}
                          {order.status === 'REFUNDED' && (
                            <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded font-semibold border border-gray-700">
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {order.status !== 'REFUNDED' && (
                            <button
                              onClick={() => handleRefundOrder(order.id)}
                              className="bg-red-900/70 hover:bg-red-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

