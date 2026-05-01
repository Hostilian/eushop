import React, { useState } from 'react';

export default function BecomeSeller() {
  const [formData, setFormData] = useState({
    businessName: '',
    country: '',
    email: '',
    phone: '',
    acceptTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API endpoint
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold text-indigo-600">🍫 EUshop</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">Become a Seller</h1>
          <p className="text-gray-600 mb-8">
            Join thousands of food producers and start selling your specialty products across Europe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                <option value="">Select your country</option>
                <option value="AT">Austria</option>
                <option value="BE">Belgium</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  required
                  className="rounded border-gray-300 text-indigo-600"
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Apply to Become a Seller
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
