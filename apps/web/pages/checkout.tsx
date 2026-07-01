import React, { useState } from 'react';
import Link from 'next/link';

export default function Checkout() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'DE',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    acceptTerms: false
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment submission and order registration
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-gray-800">
        <div className="max-w-md w-full bg-white p-8 rounded-lg border border-gray-200 shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-green-800 font-bold">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for shopping at EUshop. Your payment has been processed and the seller has been notified.
          </p>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-left mb-8 text-sm text-gray-700">
            <p className="font-semibold mb-1">Shipping Details:</p>
            <p>{formData.firstName} {formData.lastName}</p>
            <p>{formData.address}</p>
            <p>{formData.postalCode} {formData.city}</p>
            <p>EU Member State: {formData.country}</p>
          </div>
          <Link href="/" className="inline-block bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-800 hover:text-green-700">
            EUshop
          </Link>
          <Link href="/cart" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Back to Cart
          </Link>
        </div>
      </nav>

      {/* Main Form */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout Securely</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Delivery Address</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">EU Country (Logistics Restricted to EU Single Market)</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  value={formData.country}
                >
                  <option value="AT">Austria</option>
                  <option value="BE">Belgium</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="ES">Spain</option>
                  <option value="CZ">Czech Republic</option>
                </select>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">2. Payment Method</h2>
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                  onChange={e => setFormData({ ...formData, cardName: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number (Stripe Secure Elements)</label>
                <input
                  type="text"
                  required
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                  onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                    onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CVC / Security Code</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-800 focus:border-green-800"
                    onChange={e => setFormData({ ...formData, cardCvc: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary Side-Block */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Review Order</h2>
              
              <div className="space-y-4 border-b border-gray-200 pb-6 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Belgian Chocolates x2</span>
                  <span className="font-semibold">49.98 €</span>
                </div>
                <div className="flex justify-between">
                  <span>Italian Balsamic x1</span>
                  <span className="font-semibold">34.99 €</span>
                </div>
              </div>

              <div className="space-y-4 border-b border-gray-200 py-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>84.97 €</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT & Processing (15%)</span>
                  <span>12.75 €</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>9.99 €</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900 my-6">
                <span>Grand Total</span>
                <span>107.71 €</span>
              </div>

              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 rounded border-gray-300 text-green-800 focus:ring-green-800"
                    onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  />
                  <span className="ml-2 text-xs text-gray-600 leading-normal">
                    I agree to the <Link href="/terms" className="text-green-800 hover:underline">Terms of Service</Link> (including right-of-withdrawal exemptions on perishables) and <Link href="/privacy" className="text-green-800 hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-green-800 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Pay & Place Order
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} EUshop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
