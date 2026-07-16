# EUshop V20 Design System

This document outlines the visual language and component specifications for the **EUshop V20** relaunch. All three platform surfaces (Android, iOS, and Web) must adhere to these tokens to ensure a unified product aesthetic.

---

## 🎨 Color Palette

### Primary & Accent Colors
*   **Gourmet Forest Green** (`#1E3F20`)
    *   *Usage:* Primary headers, brand branding, primary call-to-actions, navigation bars.
*   **Culinary Gold** (`#D4A373`)
    *   *Usage:* Interactive accents, badges (e.g., "Verified EU Trader"), checkmarks, rating stars, highlighting states.

### Neutral Colors
*   **Light Mode Background (Warm Ivory)** (`#FAF9F6`)
    *   *Usage:* Body backgrounds, outer containers.
*   **Dark Mode Background (Charcoal Black)** (`#161B19`)
    *   *Usage:* Body backgrounds in dark mode.
*   **Surface Color (Light Mode)** (`#FFFFFF`)
    *   *Usage:* Cards, panels, input fields, navigation blocks.
*   **Surface Color (Dark Mode)** (`#222825`)
    *   *Usage:* Cards and panels in dark mode.
*   **Muted Neutral (Warm Stone)** (`#EBE9E1`)
    *   *Usage:* Grid borders, inactive tabs, dividers.
*   **Dark Mode Border** (`#313A35`)
    *   *Usage:* Muted divider lines and borders in dark mode.

### Semantic Colors
*   **Success:** `#2E7D32` (Emerald Green)
*   **Danger / Error:** `#B33939` (Terracotta Red)
*   **Warning:** `#E67E22` (Saffron Orange)

---

## font-family Typography

### Fonts
*   **Display Font:** `Outfit` (Geometric sans-serif)
    *   *Usage:* Titles, headings (`h1`, `h2`, `h3`), hero copy.
*   **Body Font:** `Inter` (Functional sans-serif)
    *   *Usage:* Paragraphs, lists, button text, form inputs, tooltips.

### Type Scale
*   **H1 (Hero Heading):** 36pt / 48px (Bold/Black, letter-spacing: -0.02em)
*   **H2 (Section Heading):** 24pt / 32px (Bold, letter-spacing: -0.01em)
*   **H3 (Card Heading):** 16pt / 22px (Semi-Bold)
*   **Body Text:** 14px (Regular, line-height: 1.6)
*   **Small / Caption:** 11px (Medium, uppercase for labels / lowercase for descriptions)

---

## 📏 Spacing & Grid

We use an 8px base grid system for padding, margins, and borders.
*   **Extra Small (`xs`):** 4px
*   **Small (`sm`):** 8px
*   **Medium (`md`):** 16px
*   **Large (`lg`):** 24px
*   **Extra Large (`xl`):** 32px
*   **Double Extra Large (`xxl`):** 48px

---

## 🧱 Core Components

### 1. Buttons
*   **Primary Button:** Background Forest Green, text Ivory, rounded-xl (12px), bold font, slight transition hover scale/opacity.
*   **Secondary Button:** Transparent background, border Warm Stone, text Charcoal, rounded-xl.
*   **Accent Button:** Background Culinary Gold, text Forest Green, shadow highlights.

### 2. Cards
*   **Style:** Rounded-3xl (24px), border-width 1px, background White (light mode) / Charcoal-Surface (dark mode).
*   **Hover State:** Lift translate-y (-2px) with transition-all duration-300 ease-out.

### 3. Badge Indicators
*   **Verified Badge:** Background Gold (25% opacity), border Gold (30% opacity), text Gold, uppercase tracking-widest, extra small font.
