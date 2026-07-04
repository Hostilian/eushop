import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AllergenBadge, VerifiedSellerBadge } from './Badge';

export interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  country: string;
  imageUrl?: string;
  allergens?: string[];
  seller?: {
    name: string;
    rating: number;
    verified: boolean;
  };
  averageRating?: number;
  reviewCount?: number;
  onAddToCart?: (id: string) => void;
}

/**
 * Product listing card for food items.
 *
 * - Uses next/image for WebP optimisation and Core Web Vitals compliance.
 * - Displays EU allergen information as required by FIR 1169/2011.
 * - Shows DSA "Verified EU Trader" badge when seller is KYC-verified.
 * - Meets WCAG 2.1 AA: keyboard accessible, descriptive alt text, focus rings.
 */
export function ProductCard({
  id,
  name,
  description,
  price,
  country,
  imageUrl,
  allergens = [],
  seller,
  averageRating,
  reviewCount,
  onAddToCart,
}: ProductCardProps) {
  const countryFlag = country ? getCountryFlag(country) : '🇪🇺';
  const ratingDisplay = averageRating ? averageRating.toFixed(1) : null;

  return (
    <article
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
      aria-label={`${name} — €${price.toFixed(2)}`}
    >
      {/* Product image */}
      <Link
        href={`/food/${id}`}
        className="block relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden"
        tabIndex={0}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Photo of ${name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl" aria-hidden="true">
            🍫
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Country + seller */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
            <span aria-label={`Origin: ${country}`}>{countryFlag}</span>
            {country}
          </span>
          {seller?.verified && <VerifiedSellerBadge />}
        </div>

        {/* Name */}
        <Link
          href={`/food/${id}`}
          className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug hover:text-primary dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          {name}
        </Link>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Allergens — EU FIR 1169/2011 disclosure */}
        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-1" aria-label="Contains allergens:">
            {allergens.slice(0, 3).map((a) => (
              <AllergenBadge key={a} allergen={a} />
            ))}
            {allergens.length > 3 && (
              <span className="text-xs text-gray-400 self-center">+{allergens.length - 3} more</span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Rating */}
        {ratingDisplay && (
          <div className="flex items-center gap-1" aria-label={`Rating: ${ratingDisplay} out of 5`}>
            <span className="text-yellow-400 text-sm" aria-hidden="true">★</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ratingDisplay}</span>
            {reviewCount != null && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              €{price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => onAddToCart?.(id)}
            aria-label={`Add ${name} to cart`}
            className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const EU_FLAGS: Record<string, string> = {
  AT: '🇦🇹', BE: '🇧🇪', BG: '🇧🇬', HR: '🇭🇷', CY: '🇨🇾', CZ: '🇨🇿',
  DK: '🇩🇰', EE: '🇪🇪', FI: '🇫🇮', FR: '🇫🇷', DE: '🇩🇪', GR: '🇬🇷',
  HU: '🇭🇺', IE: '🇮🇪', IT: '🇮🇹', LV: '🇱🇻', LT: '🇱🇹', LU: '🇱🇺',
  MT: '🇲🇹', NL: '🇳🇱', PL: '🇵🇱', PT: '🇵🇹', RO: '🇷🇴', SK: '🇸🇰',
  SI: '🇸🇮', ES: '🇪🇸', SE: '🇸🇪',
};

function getCountryFlag(isoCode: string): string {
  return EU_FLAGS[isoCode.toUpperCase()] ?? '🇪🇺';
}
