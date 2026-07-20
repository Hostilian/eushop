import Link from 'next/link';
import Head from 'next/head';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  // JSON-LD for SEO (Schema.org BreadcrumbList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://eushop.eu${item.href}` } : {}),
    })),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-gray-400 dark:text-gray-600">/</span>}
              {isLast || !item.href ? (
                <span className="text-gray-800 dark:text-gray-200 font-medium">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-brand-green dark:hover:text-brand-gold transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
