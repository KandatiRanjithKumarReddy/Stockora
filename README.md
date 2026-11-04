# Stockora — Orders Made Simple
**FMCG Distributor B2B Ordering Platform**  
*Built for Company A (Jabalpur, Madhya Pradesh) serving 1,800+ Kirana Stores.*

---

## 🌟 Key Features

1. **Mobile-First FMCG Catalog:**
   * Rapid search, brand/category filters, high-resolution product photos.
   * **Pack-to-Case Transparency:** Shows both dealer price per pack (e.g. ₹8.10) and calculated case price (e.g. ₹777.60 for case of 96).
   * Live stock indicators: `In Stock (340 cases)`, `Low Stock`, `Out of Stock`.

2. **Deterministic Scheme Engine:**
   * **Buy X, Get Y Free:** (e.g., Buy 10 cases of Glucose Biscuits → +1 Free case automatically added).
   * **Slab Discounts:** (e.g., 3% off on 5 or more cases of Detergent).
   * **GST Breakdown:** Per-SKU HSN tax computation (CGST + SGST) itemized cleanly.
   * Pure deterministic calculation on backend. AI is strictly prohibited from touching monetary numbers.

3. **Google Gemini 3-Tier Fallback AI Order Capture:**
   * Converts messy Hindi/Hinglish WhatsApp text messages (*"bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"*) into structured order suggestions in under 2 seconds.
   * **Single API Key (`GEMINI_API_KEY`)** driving a 3-tier model failover:
     1. Primary: `gemini-3.5-flash-lite`
     2. Fallback 1: `gemini-3.6-flash`
     3. Fallback 2: `gemini-3.8-flash`
   * Unit ambiguity guard: Never guesses ambiguous units without human-in-the-loop confirmation.
   * Alternative SKU suggestion chips.
   * Retailer alias learning: Remembers colloquial wording for future orders.

4. **Dual-Pool Stock Reservation & Credit Hold (Option B):**
   * Verifies and reserves stock on order submission with configurable expiry timer (`STOCK_RESERVATION_EXPIRY_MINUTES`).
   * When orders exceed a retailer's credit limit, automatically flags status as `CREDIT_HOLD` for Order Desk triage (never bypassed automatically).

5. **Order Desk Command Center & Tally ERP Export:**
   * High-density office dashboard for Company A's 6 clerks.
   * Filter and search orders by status, inspect original WhatsApp raw text against AI matches.
   * Approve orders (triggers permanent stock deduction in warehouse) or Reject orders (releases reserved stock).
   * **1-Click Tally CSV Export:** Generates standard `VoucherDate, VoucherType, PartyName, ItemName, SKU, BilledQty, FreeQty, Rate, DiscountPercent, Amount` batch files ready for import into Tally ERP 9 / TallyPrime.

6. **Design System (Light & Dark Mode):**
   * Intentional color tokens: Deep Sapphire Blue (`#1E3A8A`), Navy Charcoal (`#0B0F19`), Emerald (`#059669`), Amber (`#D97706`).
   * Persisted in `localStorage` with zero theme flash.
   * Fully responsive across mobile, tablet, laptop, and desktop viewports.
   * Global floating "Send Feedback" modal accessible across all screens.

---

## 🔑 Demo Login Accounts

| Role | Mobile Number | Password | Details |
| :--- | :--- | :--- | :--- |
| **Kirana Retailer (Standard)** | `9826012345` | `retailer123` | *M/s Gupta Kirana Bhandar* (Wright Town, Jabalpur) • Credit Limit: ₹60,000 |
| **Kirana Retailer (Near Limit)**| `9826054321` | `retailer123` | *Verma Super Daily Needs* (Gorakhpur, Jabalpur) • Tests Credit Hold Policy |
| **Order Desk Staff** | `9425099881` | `desk123` | *Pooja Sharma* • Office Clerk (Approve, Edit, Tally CSV Export) |
| **Distributor Admin** | `9425000001` | `admin123` | *Rajesh Agarwal* • Distributor Principal |
| **1-Click Google Sign-In** | Any | — | Click *"Continue with Google (1-Click Demo)"* on Sign In |
| **Mock SMS OTP** | Any mobile | `123456` | Click *"Login with Mock OTP"* and use `123456` |

---

## 🚀 Running Locally

### 1. Start Backend Server:
```bash
cd server
npm install
npm run seed     # Seeds live MongoDB Atlas database
npm run dev      # Runs Express API at http://localhost:5000
```

### 2. Start Frontend Client:
```bash
cd client
npm install
npm run dev      # Runs React + Vite frontend at http://localhost:5173
```

---

## 🛠️ Technology Stack
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios.
* **Backend:** Node.js, Express.js, TypeScript (ESM with tsx), Mongoose, Zod, JWT, bcryptjs.
* **Database:** MongoDB Atlas Cloud Database.
* **AI Subsystem:** Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.8-flash`) with single API key.
* **Accounting:** Tally ERP 9 / TallyPrime CSV Export Gateway.

