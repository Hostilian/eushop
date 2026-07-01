import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Seller {
  id: string;
  name: string;
  country: string;
  email: string;
  kybStatus: 'pending' | 'verified' | 'rejected';
  taxId: string;
}

interface Listing {
  id: string;
  name: string;
  country: string;
  price: number;
  sellerName: string;
  status: 'active' | 'suspended' | 'flagged';
  reportsCount: number;
}

export default function AdminPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 142,
    totalSellers: 28,
    pendingKYB: 3,
    reportedItems: 2,
  });

  useEffect(() => {
    // Load mock database records for moderation purposes
    setSellers([
      { id: '1', name: 'Chocolatier Grand-Place', country: 'BE', email: 'info@grandplace.be', kybStatus: 'verified', taxId: 'BE0123456789' },
      { id: '2', name: 'Aceto Modena s.r.l.', country: 'IT', email: 'sales@acetomodena.it', kybStatus: 'verified', taxId: 'IT9876543210' },
      { id: '3', name: 'Alpine Deli', country: 'AT', email: 'kontakt@alpinedeli.at', kybStatus: 'pending', taxId: 'AT555444333' },
      { id: '4', name: 'Bretzel Factory', country: 'DE', email: 'hallo@bretzel.de', kybStatus: 'pending', taxId: 'DE999888777' },
    ]);

    setListings([
      { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99, sellerName: 'Chocolatier Grand-Place', status: 'active', reportsCount: 0 },
      { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 34.99, sellerName: 'Aceto Modena s.r.l.', status: 'active', reportsCount: 0 },
      { id: '3', name: 'Spanish Manchego Cheese', country: 'Spain', price: 44.99, sellerName: 'Don Quixote Queso', status: 'flagged', reportsCount: 3 },
      { id: '4', name: 'Austrian Speck', country: 'Austria', price: 18.50, sellerName: 'Alpine Deli', status: 'suspended', reportsCount: 1 },
    ]);
  }, []);

  const handleVerifyKyb = (id: string) => {
    setSellers(prev =>
      prev.map(seller =>
        seller.id === id ? { ...seller, kybStatus: 'verified' } : seller
      )
    );
    setStats(prev => ({ ...prev, pendingKYB: Math.max(0, prev.pendingKYB - 1) }));
  };

  const handleSuspendListing = (id: string) => {
    setListings(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: item.status === 'suspended' ? 'active' : 'suspended' } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-bold text-indigo-500">🍫 EUshop</Link>
            <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-500/30">
              Admin Portal (DSA Compliance)
            </span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold mb-8">Platform Moderation & KYB Control</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
            <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Sellers</p>
            <h3 className="text-3xl font-bold">{stats.totalSellers}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Pending KYB Verification</p>
            <h3 className="text-3xl font-bold text-yellow-400">{stats.pendingKYB}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Flagged Listings (Reports)</p>
            <h3 className="text-3xl font-bold text-red-400">{stats.reportedItems}</h3>
          </div>
        </div>

        {/* Seller Verification Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-12 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">1. Seller KYB & Tax Checks (DSA Art 30 / DAC7)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Tax Identification (TIN)</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sellers.map(seller => (
                  <tr key={seller.id} className="text-sm">
                    <td className="py-4 px-4 font-semibold">{seller.name}</td>
                    <td className="py-4 px-4">📍 {seller.country}</td>
                    <td className="py-4 px-4 text-gray-300">{seller.email}</td>
                    <td className="py-4 px-4"><code className="bg-gray-900 px-2 py-1 rounded text-xs">{seller.taxId}</code></td>
                    <td className="py-4 px-4">
                      {seller.kybStatus === 'verified' ? (
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                          Verified KYB
                        </span>
                      ) : (
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                          Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {seller.kybStatus === 'pending' && (
                        <button
                          onClick={() => handleVerifyKyb(seller.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-semibold transition"
                        >
                          Verify & Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Listings Moderation Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">2. Content & Listing Control</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="py-3 px-4">Listing Name</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Origin Country</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Reports</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {listings.map(item => (
                  <tr key={item.id} className="text-sm">
                    <td className="py-4 px-4 font-semibold">{item.name}</td>
                    <td className="py-4 px-4 text-gray-300">{item.sellerName}</td>
                    <td className="py-4 px-4">📍 {item.country}</td>
                    <td className="py-4 px-4 font-bold text-indigo-400">€{item.price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      {item.reportsCount > 0 ? (
                        <span className="text-red-400 font-semibold">⚠️ {item.reportsCount} report(s)</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {item.status === 'active' && (
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                          Active
                        </span>
                      )}
                      {item.status === 'flagged' && (
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                          Flagged
                        </span>
                      )}
                      {item.status === 'suspended' && (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleSuspendListing(item.id)}
                        className={`text-xs px-4 py-2 rounded-lg font-semibold transition ${
                          item.status === 'suspended'
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {item.status === 'suspended' ? 'Re-activate' : 'Suspend Listing'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
