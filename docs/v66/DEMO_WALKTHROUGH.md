# EUshop Truthful Demo Script & Environment Walkthrough (v66 Release)

**Environment:** Next.js Frontend (`https://hostilian.github.io/eushop/`) + Spring Boot Core Service (Port 3001)  

---

## 1. Step-by-Step Demo Flow

1. **Step 1 — Buyer Marketplace Discovery**:
   - Navigate to `/eushop/`.
   - Filter by allergen exclusions (e.g. `Milk`, `Gluten`).
   - Click specialty item to inspect mandatory FIC 1169 food information (ingredients, net weight, origin).

2. **Step 2 — DSA Art. 30 Trader Traceability Inspection**:
   - Verify persistent UI badge `"Sold by Parmigiano Reggiano DOP Consortium (Reg. IT-994821)"`.

3. **Step 3 — Cart & Compliant Checkout**:
   - Add item to cart and open `/eushop/cart`.
   - Explicit button text: `"Pay Now — Order with Obligation to Pay"`.

4. **Step 4 — Seller Onboarding & KYBC Gate**:
   - Navigate to `/eushop/become-seller`. Verify business registry check and self-certification form.

5. **Step 5 — DAC7 Tax Annual Report**:
   - Trigger `Dac7Service.java` monthly cron to inspect XML export file generation.
