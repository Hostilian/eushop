
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">🍫 EUshop</h1>
          <div className="space-x-4">
            <a href="/search" className="text-gray-700 hover:text-indigo-600">Browse</a>
            <a href="/api/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded">Login</a>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Discover Europe's Finest Specialty Foods
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Find authentic chocolates, liverwurst, regional candies, and hidden culinary treasures from across the EU.
        </p>
        <div className="space-x-4">
          <a href="/search" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700">
            Start Browsing
          </a>
          <a href="/become-seller" className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg border-2 border-indigo-600 hover:bg-indigo-50">
            Become a Seller
          </a>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Pan-European</h3>
              <p className="text-gray-600">Find specialty foods from all EU countries</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Direct Connection</h3>
              <p className="text-gray-600">Chat with sellers in real-time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Verified Sellers</h3>
              <p className="text-gray-600">Buy with confidence from trusted vendors</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
