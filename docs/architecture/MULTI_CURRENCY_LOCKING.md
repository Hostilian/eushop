# EUshop Cross-Border Multi-Currency Display & Exchange Rate Locking Standard

**Base Currency:** EUR (€)  
**Supported Currencies:** EUR, DKK, SEK, PLN, CZK, HUF  
**Compliance Standard:** Direct ECB (European Central Bank) Daily Reference Rates  

---

## 1. Multi-Currency Rules

- **15-Minute Rate Locking**: During checkout, foreign currency exchange rates are locked for 15 minutes to guarantee exact price display.
- **Server Base Conversion**: All database transactions, seller payouts, and DAC7 thresholds are recorded in base currency EUR (`Money.java`).
- **Display Formatting**: Non-EUR amounts render secondary locked currency estimates (`"€45.00 (~335 DKK)"`).
