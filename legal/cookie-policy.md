# Cookie Policy — EUshop

> **⚠️ DRAFT — FOR COUNSEL REVIEW ONLY**

**Last updated:** [DATE]

---

## 1. What Are Cookies

Cookies are small text files stored on your device. We use cookies and similar
technologies (local storage, session storage) to operate the platform.

---

## 2. Cookie Categories

### 2.1 Strictly Necessary (always active — no consent required)
| Cookie | Purpose | Duration |
|---|---|---|
| `session_id` | Maintain authenticated session | Session |
| `csrf_token` | CSRF attack prevention | Session |
| `eushop-theme` | Remember dark/light mode preference | 1 year |
| `cookieConsent` | Store your cookie preferences | 1 year |

These cannot be disabled as the platform cannot function without them.

### 2.2 Analytics (consent required)
| Cookie | Provider | Purpose | Duration |
|---|---|---|---|
| `_ga`, `_gid` | Google Analytics | Anonymised usage statistics | 2 years / 24h |

**Default:** OFF. Enabled only after explicit consent.

### 2.3 Marketing (consent required)
Currently: **none deployed.**

> **COMPLIANCE-REVIEW:** Before adding any marketing/retargeting cookies,
> update this policy and ensure the consent banner blocks the scripts until
> consent is given — not after.

---

## 3. How We Obtain Consent

- A cookie banner is displayed on first visit.
- You can accept all, reject all, or customise by category.
- Your choice is stored in `cookieConsent` (strictly necessary).
- You can change your preferences at any time via the Cookie Preferences link
  in the footer or the GDPR Center (/gdpr).
- We honour the **Global Privacy Control** browser signal.

> **COMPLIANCE-REVIEW:** The consent mechanism must block non-essential scripts
> until consent is given — not fire them and ask forgiveness. Verify the
> CookieBanner component actually prevents script execution before consent.

---

## 4. Third-Party Cookies

Google Analytics sets cookies on our behalf. See Google's privacy policy at
policies.google.com/privacy.

---

## 5. How to Manage Cookies

- **Browser settings:** Most browsers allow you to block or delete cookies.
- **Our preference centre:** /gdpr
- **Opt-out of Google Analytics:** tools.google.com/dlpage/gaoptout

---

*This is a draft template. Requires legal review before publication.*
