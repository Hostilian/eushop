# EUshop Asset Provenance & Third-Party Content Clearance

> **Scope**: Registry of all external media assets, fonts, icons, datasets, and third-party software libraries bundled in EUshop.

---

## 1. Third-Party Media Assets & Visual Clearances

| Asset Path / Component | Source / Provider | License Type | Commercial Rights | Usage Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Product Demonstration Images** | Unsplash / Pexels Open Media | Unsplash License / CC0 | Free for commercial use | Real regional food images (Gouda, Smoked Paprika, Olive Oil, Prosciutto). |
| **Country Flag Overlays** | SVG Flag Icons (`apps/web/components/ui/ProductCard.tsx`) | MIT / Public Domain | Free for commercial use | Used for regional EU origin badges. |
| **PDO / PGI Protected Badges** | EU Commission Public Domain Assets | Public Domain / Fair Use | Regulatory / Descriptive | Used strictly to denote EU Protected Designation of Origin items. |
| **UI Icons** | Heroicons / Lucide React | MIT License | Free for commercial use | Standard navigation and action icons. |

---

## 2. Fonts & Typography Dependencies

- **Inter / Outfit Font Families**: Google Fonts (Open Font License - OFL). Free for personal and commercial distribution.

---

## 3. Demonstration Product Catalogue (`apps/web/data/demo-products.ts`)

- **Factual Food Information**: Product descriptions, ingredients, and allergen lists compiled directly from public EU FIC Reg. 1169/2011 Annex II reference standards.
- **Trader Names**: Fictional demonstration producers (e.g. *"Bavarian Artisanal Meats GmbH"*, *"Tuscan Artisan Press SpA"*).

---

## 4. Software Dependencies & License Compliance

- **Next.js & React**: MIT License.
- **Spring Boot Framework**: Apache License 2.0.
- **TailwindCSS**: MIT License.
- **Zod & Jest**: MIT License.
