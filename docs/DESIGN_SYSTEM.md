# EUshop V20 Shared Design System

This design system establishes a consistent, premium visual identity for EUshop across the Website, Android app, and iOS app. The design is inspired by high-end consumer tools (Linear, Stripe) combined with a warm, organic culinary aesthetic.

---

## 🎨 Color Palette

### Brand Colors
- **Primary (Gourmet Forest Green)**: `#1E3F20`
  - Used for primary buttons, prominent text, branding marks, and headers. Represents quality, fresh ingredients, and premium food sourcing.
- **Secondary (Culinary Gold / Warm Amber)**: `#D4A373`
  - Used for CTAs, notifications, badges, focus states, and highlights. Represents artisanal baking, wheat, honey, and quality verification.
- **Accents**:
  - Light Olive: `#7B8F77` - for secondary highlights, toggles, and metadata.

### Neutral Colors
- **Background (Alabaster White / Warm Ivory)**: `#FAF9F6`
  - Used as the default app/web body background. Creates a soft, gourmet, "artisan menu" feel that is warmer and more premium than sterile cold grays.
- **Surface (Cream White)**: `#FFFFFF`
  - Used for cards, sheets, forms, and dialog boxes.
- **Text (Charcoal Black)**: `#161B19`
  - Used for body copy and headings, offering high contrast while being softer on the eyes than pure black.
- **Borders (Warm Stone Gray)**: `#EBE9E1`
  - Used for structural lines, card borders, and dividing lines.

### Semantic Colors
- **Success**: `#2E7D32` (Forest Success Green)
- **Danger/Error**: `#B33939` (Terracotta Red)
- **Warning**: `#E67E22` (Saffron Orange)

---

## 🔠 Typography

- **Headings (Display)**: `Outfit`
  - A clean, geometric sans-serif that balances modern elegance with friendly curves. Use for h1, h2, h3, and hero titles.
- **Body Copy**: `Inter`
  - An exceptionally readable sans-serif optimized for small interfaces, listing descriptions, and user inputs.

### Scale
- **Display Extra Large**: `3.5rem` / `56px` (h1 Hero)
- **Display Large**: `2.25rem` / `36px` (h2 Headers)
- **Display Medium**: `1.5rem` / `24px` (h3 Section Titles)
- **Body Large**: `1.125rem` / `18px`
- **Body Regular**: `0.875rem` / `14px`
- **Caption/Micro**: `0.75rem` / `12px` (Allergens, prices, badges)

---

## 📐 Spacing & Grid

We use an **8px grid baseline** for all layouts:
- Padding / Margins: `4px` (xs), `8px` (sm), `16px` (md), `24px` (lg), `32px` (xl), `48px` (2xl)
- Mobile safe-area boundaries: `16px` margin.
- Web container maximum width: `1280px` (`max-w-7xl`).

---

## ✨ Motion & Easing

Animations must feel tactile and snappy:
- **Duration**: `200ms` (hover, fade-ins), `300ms` (slide-ups, panels)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out, typical of Apple platforms)
- **Hover Scale**: `scale(1.02)` for cards, buttons.

---

## 📦 Core Components

### 1. Buttons
- **Primary**: Gourmet Forest Green background, Alabaster White text. Hover state: opacity `90%`, scale `1.02`.
- **Secondary**: Alabaster White background, Gourmet Forest Green text, Warm Stone Gray border.
- **Accent (CTA)**: Culinary Gold background, Charcoal Black text.

### 2. Cards
- Alabaster White or Cream background, rounded `24px` (`rounded-3xl` / `rounded-2xl` on mobile), thin border (`1px solid #EBE9E1`), subtle drop shadow (`shadow-sm`).

### 3. Inputs
- Rounded `12px` (`rounded-xl`), background Alabaster White, border Warm Stone Gray, font size `14px`. On focus: border color shifts to Culinary Gold with a subtle `ring-2` accent.

### 4. Navigation
- Sticky/floating glassmorphism bar with backdrop blur (`backdrop-blur-md`) and Alabaster/Charcoal gradients depending on dark mode.

---

## 🌙 Dark Mode System

- **Background (Charcoal Black)**: `#161B19`
- **Surface (Dark Slate)**: `#222825`
- **Text (Alabaster White)**: `#FAF9F6`
- **Borders (Muted Slate)**: `#313A35`
- **Primary/Secondary Color Adjustments**:
  - Primary Green remains `#1E3F20` but is paired with light olive details.
  - Secondary Gold transitions to a brighter amber `#E5A869` to maintain visual contrast.
