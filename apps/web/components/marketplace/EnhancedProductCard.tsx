import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { AllergenBadge, VerifiedSellerBadge, Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import type { StatusOrigin } from '../../lib/degradation';

export interface EnhancedProductCardProps {
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
  dietaryRestrictions?: string[];
  qualityScheme?: 'PDO' | 'PGI' | 'TSG';
  averageRating?: number;
  reviewCount?: number;
  onAddToCart?: (id: string) => void;
  origin?: StatusOrigin;
}

/**
 * Enhanced product card that displays allergen information and dietary badges
 * as required for Task 15: Interactive EU Allergen & Origin Filter Engine
 */
export default function EnhancedProductCard({
  id,
  name,
  description,
  price,
  country,
  imageUrl,
  allergens = [],
  seller,
  dietaryRestrictions = [],
  qualityScheme,
  averageRating,
  reviewCount,
  onAddToCart,
  origin
}: EnhancedProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const countryFlag = country ? getCountryFlag(country) : '🇪🇺';
  const ratingDisplay = averageRating ? averageRating.toFixed(1) : null;
  const sellerName = seller?.name?.trim() || 'Seller identity unavailable';

  // Determine dietary badges
  const badges = getDietaryBadges({
    dietaryRestrictions,
    qualityScheme,
    allergens
  });

  // Allergen explanations for tooltips
  const allergenExplanations: Record<string, string> = {
    'Cereals containing gluten': 'Contains wheat, rye, barley, oats, spelt, kamut or their hybridised strains',
    'Crustaceans': 'Includes crab, lobster, crayfish, shrimp, prawn',
    'Eggs': 'Chicken eggs and other bird eggs',
    'Fish': 'All species of fish and fish products',
    'Peanuts': 'Legume commonly known as groundnut',
    'Soybeans': 'Soy beans and soy-derived products',
    'Milk': 'Milk from cows, goats, sheep and other mammals',
    'Nuts': 'Almonds, hazelnuts, walnuts, cashews, pecans, brazils, pistachios, macadamia, Queensland nuts',
    'Celery': 'Includes celery stalks, leaves, seeds and celeriac',
    'Mustard': 'Liquid mustard, mustard powder and mustard seeds',
    'Sesame seeds': 'Sesame seeds and sesame seed paste (tahini)',
    'Sulphur dioxide and sulphites': 'Preservative E220-E228 found in dried fruit, wine, etc.',
    'Lupin': 'Lupin beans and flour, common in gluten-free baking',
    'Molluscs': 'Includes mussels, oysters, squid, snails and clams'
  };

  return (
    <article
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
      aria-label={`${name} — €${price.toFixed(2)}`}
    >
      {/* Product image */}
      <Link
        href={`/food/${id}`}
        className="block relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
        tabIndex={0}
      >
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={`Photo of ${name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            <svg width="100%" height="100%" viewBox="0 0 4 3" aria-label="Image placeholder" role="img" className="block">
              <rect width="4" height="3" fill="currentColor" opacity="0.2" />
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="currentColor" opacity="0.6" font-size="0.6">
                {imageUrl ? 'Image unavailable' : 'No image'}
              </text>
            </svg>
          </div>
        )}
        {/* Region flag overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-1 text-2xl">
          <span aria-label={`Origin: ${country}`} role="img">
            {countryFlag}
          </span>
          {origin === 'demo' && (
            <span className="text-xs bg-green-100 text-green-800 rounded-full px-1.5 py-0.5">
              Demo
            </span>
          )}
          <span className="sr-only">{country}</span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Country + verification state */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
            <span aria-label={`Origin: ${country}`}>{countryFlag}</span>
            {country}
            {origin === 'demo' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs rounded-full px-1.5 py-0.5">
                Demo
              </span>
            )}
          </span>
          {seller?.verified && <VerifiedSellerBadge />}
        </div>

        {/* COMPLIANCE-REVIEW: DSA Art. 30 requires persistent seller identity display. */}
        <p
          className="flex flex-wrap items-baseline gap-1 text-xs text-gray-600 dark:text-gray-300"
          aria-label={`Sold by ${sellerName}`}
          data-testid="seller-identity"
        >
          <span>Sold by </span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{sellerName}</span>
        </p>

        {/* Name */}
        <Link
          href={`/food/${id}`}
          className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug hover:text-brand-green dark:hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded"
        >
          {name}
        </Link>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Allergens — EU FIR 1169/2011 disclosure */}
        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Contains allergens:">
            {allergens.map((a) => (
              <Tooltip key={a} content={allergenExplanations[a]}>
                <AllergenBadge allergen={a} />
              </Tooltip>
            ))}
          </div>
        )}

        {/* Dietary badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, index) => (
              <Badge
                key={`${badge.label}-${index}`}
                variant={badge.variant as any}
                size="sm"
              >
                {badge.label}
              </Badge>
            ))}
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
            className="bg-brand-green text-white px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 transition-colors duration-150"
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
  SI: '🇸🇮', ES: '🇪𝟀', SE: '🇸🇪',
};

function getCountryFlag(isoCode: string): string {
  return EU_FLAGS[isoCode.toUpperCase()] ?? '🇪🇺';
}

function getDietaryBadges(params: {
  dietaryRestrictions: string[];
  qualityScheme?: 'PDO' | 'PGI' | 'TSG';
  allergens: string[];
}) {
  const { dietaryRestrictions, qualityScheme, allergens } = params;
  const badges: Array<{ label: string; variant: 'success' | 'info' | 'warning' }> = [];

  // Check for PDO/PGI
  if (qualityScheme === 'PDO') {
    badges.push({ label: 'Protected Designation of Origin', variant: 'success' });
  } else if (qualityScheme === 'PGI') {
    badges.push({ label: 'Protected Geographical Indication', variant: 'success' });
  }

  // Check for gluten-free (no gluten-containing cereals)
  const hasGluten = allergens.includes('Cereals containing gluten');
  if (!hasGluten) {
    badges.push({ label: 'Gluten-Free', variant: 'info' });
  }

  // Check for organic (in dietary restrictions)
  if (dietaryRestrictions.includes('Organic')) {
    badges.push({ label: 'Organic', variant: 'success' });
  }

  return badges;
}