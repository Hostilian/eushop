# EUshop v77 European Editorial Design System

## 1. Color Palette Tokens
| Token | Hex | Semantic Purpose |
| :--- | :--- | :--- |
| `v77-canvas` | `#f7f4ed` | Warm Porcelain Canvas background |
| `v77-paper` | `#fffdf8` | Warm Paper surface cards |
| `v77-ink` | `#141613` | Deep Ink editorial typography |
| `v77-muted` | `#65675f` | Mineral muted secondary text |
| `v77-cobalt` | `#1845d4` | European Cobalt primary brand action |
| `v77-cobalt-dark`| `#102f8f` | Cobalt hover & active state |
| `v77-saffron` | `#e5a024` | Saffron gold regional accent |
| `v77-terracotta` | `#c84e38` | Terracotta allergen & alert state |
| `v77-herb` | `#365e38` | Herb green authenticity & success |
| `v77-border` | `#dcd7cb` | Soft mineral border lines |

## 2. Typography Hierarchy
- **Display Headings**: `'Outfit'`, `'Inter'`, sans-serif (Bold, Black, tracking-tight).
- **Body & Controls**: `'Inter'`, sans-serif (Medium, Bold).
- **Numerals & Prices**: `font-mono` (`#141613` Deep Ink).

## 3. UI Component Library (`apps/web/components/v77/ui/`)
- `V77Button.tsx`: Variants `primary`, `cobalt`, `secondary`, `outline`, `ghost`.
- `V77Badge.tsx`: Variants `cobalt`, `saffron`, `terracotta`, `herb`, `neutral`, `outline`.
- `V77Card.tsx`: Porcelain paper card container with mineral borders.
