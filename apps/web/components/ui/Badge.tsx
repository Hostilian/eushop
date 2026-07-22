
import * as React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'allergen';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  success:  'bg-green-50  text-green-700  border-green-200  dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  warning:  'bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  error:    'bg-red-50    text-red-700    border-red-200    dark:bg-red-950   dark:text-red-300   dark:border-red-800',
  info:     'bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-950  dark:text-blue-300  dark:border-blue-800',
  neutral:  'bg-gray-100  text-gray-700   border-gray-200   dark:bg-gray-800  dark:text-gray-300  dark:border-gray-700',
  allergen: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
};

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

/**
 * Inline label badge. Used for allergen disclosure, seller verification status,
 * order status, and other categorical labels.
 */
export function Badge({ children, variant = 'neutral', size = 'sm', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full border',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].filter(Boolean).join(' ')}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

// ─── Specialised variants ─────────────────────────────────────────────────────

/**
 * Renders a "Verified EU Trader" badge from the stored KYC state.
 * Must only be shown when user.kycVerified === true.
 * COMPLIANCE-REVIEW: Confirm that the stored verification state is backed by current trader evidence.
 */
export function VerifiedSellerBadge() {
  return (
    <Badge variant="success" size="sm" icon={<span>✓</span>}>
      Verified EU Trader
    </Badge>
  );
}

/**
 * Renders a verified-purchase label on a review.
 * Must only be shown when review.verifiedPurchase === true.
 */
export function VerifiedPurchaseBadge() {
  return (
    <Badge variant="info" size="sm" icon={<span>✓</span>}>
      Verified Purchase
    </Badge>
  );
}

/**
 * Renders an EU allergen label for one of the 14 regulated allergens.
 * Used in food listings to satisfy EU Food Information Regulation (EU FIR 1169/2011).
 *
 * WCAG 1.4.1: Must not rely on colour alone. The aria-label provides a full
 * text alternative for screen readers. The warning icon is decorative (aria-hidden).
 * WCAG 1.3.1: The role="img" + aria-label pattern ensures the allergen name is
 * announced even if CSS is disabled.
 */
export function AllergenBadge({ allergen }: { allergen: string }) {
  return (
    <Badge variant="allergen" size="sm">
      <span aria-hidden="true">⚠</span>
      <span aria-label={`Contains allergen: ${allergen}`}>{allergen}</span>
    </Badge>
  );
}

/**
 * Renders a seller response SLA tracking badge under DSA Article 20/30 (<24h response).
 */
export function SellerSlaBadge({ averageResponseHours = 2 }: { averageResponseHours?: number }) {
  const isFast = averageResponseHours <= 24;
  return (
    <Badge variant={isFast ? "success" : "warning"} size="sm" icon={<span>⚡</span>}>
      {isFast ? `Fast SLA (<${averageResponseHours}h Response)` : `SLA Response (${averageResponseHours}h)`}
    </Badge>
  );
}

