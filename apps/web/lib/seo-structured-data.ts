/**
 * @eushop/web — SEO & Schema.org Structured Data Helper
 *
 * Generates JSON-LD scripts for Product, Offer, FoodEstablishment, and Organization.
 * Compliant with Google Search Rich Snippets and EU Consumer Transparency rules.
 */

export interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  sku: string;
  brandName: string;
  priceEur: number;
  currency?: string;
  sellerName: string;
  countryOfOrigin: string;
  allergens?: string[];
}

export function generateProductJsonLd(props: ProductStructuredDataProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: props.name,
    description: props.description,
    image: props.image,
    sku: props.sku,
    brand: {
      '@type': 'Brand',
      name: props.brandName,
    },
    countryOfOrigin: props.countryOfOrigin,
    offers: {
      '@type': 'Offer',
      price: props.priceEur.toFixed(2),
      priceCurrency: props.currency || 'EUR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: props.sellerName,
      },
    },
  };
}
