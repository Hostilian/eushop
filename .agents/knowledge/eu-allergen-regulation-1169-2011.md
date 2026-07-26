# EU Allergen Regulation 1169/2011 Reference

## Overview
EU Regulation 1169/2011 (FIC) Annex II mandates declaration of 14 allergens on all food products. Source of truth: `packages/compliance/src/allergens.ts`.

## The 14 Regulated EU Allergens
1. **Cereals containing gluten** (wheat, rye, barley, oats, spelt, kamut)
2. **Crustaceans** (shrimp, crab, lobster, crayfish)
3. **Eggs**
4. **Fish**
5. **Peanuts**
6. **Soya**
7. **Milk** (including lactose)
8. **Nuts** (almonds, hazelnuts, walnuts, cashews, pecans, Brazil, pistachios, macadamia)
9. **Celery**
10. **Mustard**
11. **Sesame seeds**
12. **Sulphur dioxide / Sulphites** (> 10mg/kg or 10mg/litre expressed as SO2)
13. **Lupin**
14. **Molluscs** (clams, mussels, oysters, scallops, snails, squid)

## UI Implementation
```html
<!-- Allergen list MUST be clearly emphasised (bold recommended) -->
<p>Contains: <strong>wheat</strong>, <strong>milk</strong>, <strong>eggs</strong></p>
<p>May contain: <strong>nuts</strong></p>
```

## Database Schema
```sql
CREATE TYPE allergen AS ENUM (
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soya',
  'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs'
);
```

// COMPLIANCE-REVIEW: Verify allergen list against current text of EU 1169/2011 Annex II
