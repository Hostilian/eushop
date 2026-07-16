import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { foodAPI, FoodItem, authAPI, User } from '../../lib/services';
import { PageWrapper } from '../../components/layout/PageWrapper';

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

interface OrderRecord {
  id: string;
  buyerEmail: string;
  sellerName: string;
  productName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

// Utility functions for better maintainability
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const getStatusStyles = (status: string): string => {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
    VERIFIED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    REJECTED: 'bg-red-50 border-red-200 text-red-700',
    PROCESSING: 'bg-amber-50 border-amber-200 text-amber-700',
    SHIPPED: 'bg-blue-50 border-blue-200 text-blue-700',
    DELIVERED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return styles[status] || 'bg-gray-50 border-gray-200 text-gray-700';
};

// Safe localStorage parser to reduce duplication and improve error handling
const safeParseJSON = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

interface TabButtonProps {
  id: 'sellers' | 'listings' | 'orders' | 'waitlist';
  label: string;
  count: number;
  activeTab: string;
  onClick: (tab: 'sellers' | 'listings' | 'orders' | 'waitlist') => void;
}

const TabButton = ({ id, label, count, activeTab, onClick }: TabButtonProps) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
      activeTab === id ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-400 hover:text-gray-700'
    }`}
  >
    {label} ({count})
  </button>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const userData = safeParseJSON<User | null>('user', null);
      if (userData) return userData;
      const mockAdmin: User = {
        id: 'admin-1',
        email: 'admin@eushop.local',
        name: 'Administrator',
        country: 'BE',
        role: 'ADMIN',
        kycVerified: true,
        emailVerified: true,
        selfCertifiedCompliant: true
      };
      try {
        localStorage.setItem('user', JSON.stringify(mockAdmin));
      } catch {}
      return mockAdmin;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sellers' | 'listings' | 'orders' | 'waitlist'>('sellers');

  const [sellers, setSellers] = useState<SellerApplication[]>(() => {
    if (typeof window !== 'undefined') {
      const storedSellers = safeParseJSON<SellerApplication[]>('seller_applications', []);
      if (storedSellers.length > 0) return storedSellers;
      const defaultSellers: SellerApplication[] = [
        {
          id: 'app-1',
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
          id: 'app-2',
          name: 'Bavarian Cheese Co.',
          email: 'sales@bavariancheese.de',
          country: 'DE',
          taxId: 'DE-123456789',
          vatNumber: 'DE123456789',
          tradeRegisterNumber: 'MUNICH-2834-HRB',
          address: 'Marienplatz 4, Munich, 80331',
          selfCertified: true,
          status: 'VERIFIED',
        },
        {
          id: 'app-3',
          name: 'Brussels Praline Co.',
          email: 'brussels_praline@eushop.local',
          country: 'BE',
          taxId: 'BE-098765432',
          vatNumber: 'BE098765432',
          tradeRegisterNumber: 'REG-BRUSSELS-7721',
          address: 'Grand Place 5, Brussels, 1000',
          selfCertified: true,
          status: 'VERIFIED',
        }
      ];
      try {
        localStorage.setItem('seller_applications', JSON.stringify(defaultSellers));
      } catch {}
      return defaultSellers;
    }
    return [];
  });
  const [listings, setListings] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = safeParseJSON<OrderRecord[]>('orders', []);
      if (storedOrders.length > 0) return storedOrders;
      const defaultOrders: OrderRecord[] = [
        {
          id: 'order-1',
          buyerEmail: 'buyer_germany@eushop.local',
          sellerName: 'Brussels Praline Co.',
          productName: 'Artisanal Belgian Chocolates',
          totalPrice: 38.97,
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'order-2',
          buyerEmail: 'buyer_france@eushop.local',
          sellerName: 'Modena Olive & Vineyards',
          productName: 'Aceto Balsamico Tradizionale',
          totalPrice: 59.98,
          status: 'PROCESSING',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      try {
        localStorage.setItem('orders', JSON.stringify(defaultOrders));
      } catch {}
      return defaultOrders;
    }
    return [];
  });
  const [waitlist, setWaitlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWaitlist = safeParseJSON<string[]>('waitlist_emails', []);
      if (storedWaitlist.length > 0) return storedWaitlist;
      const defaultEmails = ['investor1@earlystage.vc', 'venture.lead@pan-eu.fund'];
      try {
        localStorage.setItem('waitlist_emails', JSON.stringify(defaultEmails));
      } catch {}
      return defaultEmails;
    }
    return [];
  });

  // Memoized computed values for performance
  const pendingSellersCount = useMemo(() => 
    sellers.filter(s => s.status === 'PENDING').length, 
    [sellers]
  );

  useEffect(() => {
    // Load listings and resolve loading status
    const fetchListings = async () => {
      try {
        const all = await foodAPI.search(undefined, undefined, 1, 100);
        setListings(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleApproveSeller = (appId: string) => {
    const updatedSellers = sellers.map(s => {
      if (s.id === appId) {
        // Upgrade role of matching user in user database simulation
        const users = safeParseJSON<User[]>('local_users', []);
        const userIdx = users.findIndex(u => u.email === s.email);
        if (userIdx > -1) {
          users[userIdx].role = 'SELLER';
          users[userIdx].kycVerified = true;
          localStorage.setItem('local_users', JSON.stringify(users));
        }
        return { ...s, status: 'VERIFIED' as const };
      }
      return s;
    });
    setSellers(updatedSellers);
    localStorage.setItem('seller_applications', JSON.stringify(updatedSellers));
    alert('Merchant application approved and role updated to SELLER.');
  };

  const handleRejectSeller = (appId: string) => {
    const updatedSellers = sellers.map(s => {
      if (s.id === appId) {
        return { ...s, status: 'REJECTED' as const };
      }
      return s;
    });
    setSellers(updatedSellers);
    localStorage.setItem('seller_applications', JSON.stringify(updatedSellers));
  };

  const handleRemoveListing = (foodId: string) => {
    const localFoods = safeParseJSON<FoodItem[]>('local_foods', []);
    if (localFoods.length > 0) {
      const filtered = localFoods.filter(f => f.id !== foodId);
      localStorage.setItem('local_foods', JSON.stringify(filtered));
      // Update local UI state
      setListings(prev => prev.filter(f => f.id !== foodId));
      alert('Listing removed from simulated database.');
    } else {
      // It is a static trending food, remove from local UI only
      setListings(prev => prev.filter(f => f.id !== foodId));
      alert('Removed from active dashboard view.');
    }
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    alert(`Order status updated to ${nextStatus}.`);
  };

  const handleClearWaitlist = () => {
    if (confirm('Clear waitlist emails?')) {
      localStorage.setItem('waitlist_emails', '[]');
      setWaitlist([]);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="py-24 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading system logs...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <main className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm animate-slide-up">
          <div>
            <h1 className="text-xl font-black text-brand-dark dark:text-white font-display">Moderation Desk</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Conduct KYB verifications, review food products, monitor orders, and inspect waitlist signups.</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 rounded-full">
            Operator Panel
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-8 gap-2">
          <TabButton
            id="sellers"
            label="Seller Applications"
            count={pendingSellersCount}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="listings"
            label="Food Listings"
            count={listings.length}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="orders"
            label="System Orders"
            count={orders.length}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="waitlist"
            label="Investor Waitlist"
            count={waitlist.length}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'sellers' && (
          <div className="space-y-4">
            {sellers.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-150 rounded-2xl text-gray-400 text-xs">
                No seller registrations found in the simulated database.
              </div>
            ) : (
              sellers.map((app) => (
                <div key={app.id} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-sm text-brand-dark">{app.name}</h3>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-gray-500">
                      <div><strong className="text-gray-700">Email:</strong> {app.email}</div>
                      <div><strong className="text-gray-700">Country:</strong> {app.country}</div>
                      <div><strong className="text-gray-700">TIN (Tax ID):</strong> {app.taxId}</div>
                      <div><strong className="text-gray-700">Reg No:</strong> {app.tradeRegisterNumber}</div>
                    </div>
                    <div className="text-xs text-gray-500"><strong className="text-gray-700">Address:</strong> {app.address}</div>
                    <div className="text-[10px] text-gray-400">DSA Article 30 Compliance Statement: {app.selfCertified ? '✅ Self-Certified' : '❌ Incomplete'}</div>
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveSeller(app.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Approve Merchant
                      </button>
                      <button
                        onClick={() => handleRejectSeller(app.id)}
                        className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold transition text-gray-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                  <th className="p-4">Food Item</th>
                  <th className="p-4">Origin Country</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Allergen Profile (EU 1169/2011)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-brand-dark">{item.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">{item.country}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-semibold">{item.category || 'Specialty'}</span></td>
                    <td className="p-4 font-bold text-gray-800">€{item.price.toFixed(2)}</td>
                    <td className="p-4">
                      {item.allergens && item.allergens.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.map(a => (
                            <span key={a} className="text-[9px] font-bold px-1.5 py-0.2 bg-red-50 border border-red-100 text-red-600 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold">✓ Allergen-Free</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRemoveListing(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline"
                      >
                        Remove Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-150 rounded-2xl text-gray-400 text-xs">
                No orders recorded.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-sm text-brand-dark">{order.productName}</h3>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-gray-500">
                      <div><strong className="text-gray-700">Order ID:</strong> {order.id.split('-').slice(0,2).join('-')}</div>
                      <div><strong className="text-gray-700">Buyer:</strong> {order.buyerEmail}</div>
                      <div><strong className="text-gray-700">Seller:</strong> {order.sellerName}</div>
                      <div><strong className="text-gray-700">Total:</strong> €{order.totalPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-[10px] text-gray-400">Transaction Date: {formatDate(order.createdAt)}</div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'waitlist' && (
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider">Registered Investors</h3>
              {waitlist.length > 0 && (
                <button
                  onClick={handleClearWaitlist}
                  className="text-xs text-red-500 hover:underline font-bold"
                >
                  Clear Waitlist
                </button>
              )}
            </div>

            {waitlist.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No emails collected yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waitlist.map((email, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{email}</span>
                    <span className="text-[9px] text-gray-400 font-semibold">ID: #{idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </PageWrapper>
  );
}
