# EU e-Privacy Directive & Cookie Consent

## Overview
EUshop must comply with EU e-Privacy Directive (2002/58/EC) and upcoming ePrivacy Regulation. Cookie consent is required for non-essential cookies.

## Cookie Categories
| Category | Consent | Examples |
|----------|---------|---------|
| Strictly Necessary | Not required | Session, auth, CSRF |
| Functional | Recommended | Language, currency preference |
| Analytics | Required | GA4, Hotjar |
| Marketing | Required | Facebook Pixel, remarketing |
| Third-party | Required | Embedded maps, social widgets |

## Implementation Pattern
```typescript
// hooks/useCookieConsent.ts
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);

  const grant = (category: CookieCategory) => {
    const record = { category, granted: true, timestamp: Date.now(), version: '1.0' };
    localStorage.setItem('consent_' + category, JSON.stringify(record));
    setConsent(record);
  };

  return { consent, grant, deny };
}
```

## Required Elements on Cookie Banner
1. Clear explanation of each cookie category
2. Granular accept/reject per category (not just "Accept All")
3. "Reject All" button equally prominent as "Accept All"
4. Link to full Cookie Policy
5. Easy withdrawal: accessible from footer at all times

// COMPLIANCE-REVIEW: Verify against national DPA guidance (ICO, CNIL, BfDI etc.) before launch
