---
name: open-design-engine
description: Open-source design engine & Claude Design alternative (nexu-io/open-design). Rich aesthetics, design system tokens, responsive layouts, micro-animations, and UI mockups.
---

# Open Design Engine

This skill implements the **nexu-io/open-design** local-first design engine principles for AI agents.

## Design System Tokens & Aesthetics
1. **Curated Color Palettes**:
   - Primary: Slate dark `#141613`, Royal Blue `#1845d4`, Emerald Green `#059669`, Warm Amber `#e5a024`.
   - Dark Mode & Glassmorphism: Sleek dark surfaces with subtle translucent borders (`border-white/10`, `backdrop-blur-md`).
2. **Modern Typography**:
   - Headings: Google Fonts `Outfit`, `Inter`, or `Space Grotesk` (`font-display font-extrabold`).
   - Monospace: `font-mono` for IDs, codes, VAT numbers, and metrics.
3. **Micro-Animations & Interaction**:
   - Hover scale transitions (`hover:scale-[1.02] transition-all duration-200`).
   - Loading skeletons and subtle shadow depth (`shadow-sm` -> `shadow-xl`).
4. **No Generic Placeholders**:
   - Use real contextual data or generated mock images (`/images/belgian_chocolates.png`, `/images/italian_olive_oil.png`, etc.).
