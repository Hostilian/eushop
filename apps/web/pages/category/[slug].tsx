import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { foodAPI } from '../../lib/services';
import { ProductCard } from '../../components/ui/ProductCard';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = typeof slug === 'string'
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Category';

  useEffect(() => {
    if (!slug) return;
    let isCancelled = false;

    foodAPI.search()
      .then((items: any[]) => {
        if (isCancelled) return;
        const categorySlug = (slug as string).toLowerCase();
        const filtered = (items || []).filter(item => {
          const itemCat = (item.category || '').toLowerCase();
          return itemCat === categorySlug || itemCat.includes(categorySlug) || categorySlug.includes(itemCat);
        });
        setProducts(filtered.length > 0 ? filtered : items || []);
      })
      .catch(() => {
        if (!isCancelled) setProducts([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [slug]);

  return (
    <PageWrapper>
      <Head>
        <title>{categoryName} — EUshop</title>
        <meta name="description" content={`Explore high-quality ${categoryName} products on EUshop.`} />
      </Head>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/search' },
          { label: categoryName }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white font-display">
            {categoryName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Authentic products verified under EU regulations.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading {categoryName} products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 font-medium">No products found in this category.</p>
            <Link href="/search" className="mt-4 inline-block text-brand-green dark:text-brand-gold font-semibold hover:underline">
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
