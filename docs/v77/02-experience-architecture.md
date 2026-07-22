# EUshop v77 Experience Architecture

## 1. Information Architecture
```text
Global Header (v77 Editorial Navigation + Country Pills + Cart Counter)
  │
  ├── Homepage (v77 Editorial Hero "Shop Europe like a local")
  │     ├── European Food Atlas (Interactive SVG/CSS Map Canvas)
  │     ├── Marketplace Pulse ("From Europe This Week")
  │     ├── Curated Collections ("Pantry", "Sweets", "DOP", "Allergen-Aware")
  │     ├── Single Market Trust Shield (DSA Art. 30, FIC 1169, DAC7)
  │     └── Dual Conversion Action ("Explore Europe" vs "Sell Across Europe")
  │
  ├── Regional Search & Discovery (/search)
  │     ├── Quick Country Filters (IT, FR, ES, DE, GR, PT, NL, BE, AT, PL)
  │     ├── Allergen Exclusion Pills (14 EU Regulated Allergens)
  │     └── Direct Add-to-Order Actions
  │
  ├── Product Detail Pages (/products/[id], /food/[id])
  │     ├── Named Producer Identity (DSA Art. 30 Traceability)
  │     └── Protected Geographical Origin Indicators (DOP/IGP)
  │
  ├── Cart & Single Market Checkout (/cart, /checkout)
  │     ├── Seller-Grouped Order Items
  │     └── Destination-Country VAT Transparency (27 EU Member States)
  │
  └── Seller Onboarding (/become-seller)
        └── 4-Step Trader Verification & DAC7 Compliance Guide
```

## 2. Key UX Principles
- **Clarity in 5 Seconds**: Immediate understanding of product proposition and geographic discovery.
- **Single Market Trust**: Clear seller identity and allergen visibility placed right next to purchasing decisions.
- **Graceful Storage Degradation**: Local storage fallback with zero runtime loss when live micro-services are unreachable.
