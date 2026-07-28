---
name: eushop-geo-blocking-compliance
description: Skill for verifying EU Geo-Blocking Regulation (EU 2018/302) compliance in routing, IP location detection, and payment gateway configuration.
---

# EU Geo-Blocking Regulation (2018/302) Compliance

## Overview
Regulation (EU) 2018/302 prohibits unjustified geo-blocking and other forms of discrimination based on customer's nationality, place of residence, or place of establishment within the EU. EUshop must not redirect, block, or apply different conditions to EU customers based on their geographic location without their explicit consent.

// COMPLIANCE-REVIEW: Geo-blocking rules apply differently to digital content services (which have specific exceptions). Verify physical goods vs. digital goods obligations with legal counsel.

## Prohibited Actions

| Prohibited Practice | Example | Consequence |
|--------------------|---------|------------|
| IP-based access block | Redirect DE user from ES storefront | Illegal — must allow access |
| Automatic redirect without consent | fr.eushop.eu → en.eushop.eu based on IP | Illegal without consent |
| Different pricing per country | Showing higher prices to non-local buyers | Illegal under Art. 4 |
| Payment method blocking | Refusing ES card for purchase on AT store | Illegal under Art. 5 |
| Different T&Cs per country | Different return policies per user origin | Illegal under Art. 4(1)(b) |

## Allowed Actions

- Displaying locale-appropriate language by default (with opt-out)
- Applying destination-country VAT (mandatory, not discrimination)
- Refusing delivery to certain non-EU countries (EU regulation only covers within EU)
- Pricing in local currency with accurate conversion disclosure

## IP Geolocation — Consent-Based Redirect

```typescript
// apps/web/middleware.ts
export function middleware(request: NextRequest) {
  const country = request.geo?.country ?? 'EU';
  const preferredLocale = getPreferredLocale(request);
  const currentLocale = request.nextUrl.locale;

  // ALLOWED: Suggest locale change — but NEVER auto-redirect without consent
  if (country !== currentLocale && !hasUserConsented(request)) {
    // Show locale suggestion banner — do NOT redirect
    return NextResponse.next({
      headers: { 'X-Suggested-Locale': country.toLowerCase() },
    });
  }

  // NEVER DO: return NextResponse.redirect(new URL(`/${country}${request.nextUrl.pathname}`, request.url));
  return NextResponse.next();
}
```

## Payment Method Non-Discrimination

```typescript
// services/core-service/src/checkout/PaymentMethodService.java — equivalent
// All EU-issued payment methods (cards, SEPA, etc.) must be accepted
// if EUshop has a payment gateway that supports them

export function getAvailablePaymentMethods(
  buyerCountryCode: string,
  paymentGateway: PaymentGateway
): PaymentMethod[] {
  // Do NOT filter payment methods based on buyer country
  // COMPLIANCE-REVIEW: Platform may decline high-risk payment sources under AML rules — but not by geography
  return paymentGateway.getSupportedMethods(); // All methods, not filtered by country
}
```

## Locale Suggestion Banner (UI)

```tsx
// apps/web/components/layout/LocaleSuggestionBanner.tsx
export function LocaleSuggestionBanner({ suggestedLocale }: { suggestedLocale: string }) {
  // Show suggestion — user must actively choose
  return (
    <div role="banner" aria-label="Language suggestion">
      <p>It looks like you might prefer {LOCALE_NAMES[suggestedLocale]}.</p>
      <button onClick={() => switchLocale(suggestedLocale)}>
        Switch to {LOCALE_NAMES[suggestedLocale]}
      </button>
      <button onClick={() => dismissSuggestion()}>Stay on current version</button>
      {/* COMPLIANCE-REVIEW: Store user preference in cookie to avoid re-prompting */}
    </div>
  );
}
```

## Monitoring & Audit

- Log every geo-based routing decision with user country, action taken, consent status
- Alert if any geo-based block returns HTTP 403 to EU IP addresses
- Audit Stripe/payment gateway config quarterly to verify no country-based payment method exclusions

## Source Files
- `apps/web/middleware.ts` — locale detection and routing
- `apps/web/components/layout/LocaleSuggestionBanner.tsx`
- `services/core-service/src/checkout/PaymentMethodService.java`
- See also: `eu-geo-blocking-regulation-2018-302.md` knowledge item
