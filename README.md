# Stockora — Wholesale Ordering Made Simple

**FMCG Distributor B2B Ordering Platform**  
*Built for Company A (Jabalpur, Madhya Pradesh) serving 1,800+ Kirana Stores.*

---

## Key Features

1. **Mobile-First Wholesale Catalogue:**
   * Rapid search, category pills, and brand filters with zero-latency local vector product illustrations (`< 2 KB` each, optimized for 3G mobile networks).
   * **Pack-to-Case & GST Transparency:** Displays dealer pack rate, calculated full-case billing rate, and explicit `Excl. X% GST` / `Incl. GST` tax disclosures.
   * Live stock availability badges (`In Stock`, `Low Stock`, `Out of Stock`) with automatic case limits.

2. **Deterministic Scheme & Tax Engine:**
   * **Buy X, Get Y Free:** Automatically adds promotional free cases (e.g., Buy 10 cases of Glucose Biscuits → +1 Free case).
   * **Volume Slab Discounts:** Automatically applies percentage discounts on qualifying case quantities (e.g., 3% off on 5+ cases of Detergent).
   * **Itemized GST Breakdown:** Per-SKU HSN tax computation (`CGST + SGST`) calculated deterministically on the backend.

3. **Stockora Smart Order (Instant Order Capture):**
   * Converts Hindi, Hinglish, or English WhatsApp order lists (*"bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"*) into structured draft orders ready for review.
   * **Resilient Multi-Tier Processing:** Backend health tracking, request cancellation timeouts, transient retry, automatic cooldown recovery, and retailer alias memory—completely abstracted behind one unified assistant experience.
   * **Human-in-the-Loop Safeguards:** Interactive unit confirmation for ambiguous quantities (`Case` verification), one-tap alternative SKU swaps, and mandatory confirmation before cart addition.

4. **Dual-Pool Stock Reservation & Credit Hold:**
   * Reserves warehouse cases upon order submission (`STOCK_RESERVATION_EXPIRY_MINUTES`).
   * Automatically routes orders exceeding a retailer's available credit limit into `CREDIT_HOLD` for Order Desk review.

5. **Order Desk Command Center & Tally ERP Export:**
   * High-density operations workspace for distributor clerks to search, filter, inspect Smart Order transcripts, approve warehouse dispatch, or release rejected stock reservations.
   * **1-Click Tally CSV Export:** Exports approved vouchers (`VoucherDate, VoucherType, PartyName, ItemName, SKU, BilledQty, FreeQty, Rate, DiscountPercent, Amount`) for TallyPrime / Tally ERP 9.

6. **Commercial B2B Design System & True Black Dark Mode:**
   * **Light Mode:** Clean neutral zinc surfaces (`#FAFAFA` / `#FFFFFF`) with high-contrast Inter typography and `tabular-nums` financial alignment.
   * **True Black Dark Mode:** Pure `#000000` canvas, `#0A0A0A` primary surfaces, `#141414` elevated panels, and `#262626` borders—initialized synchronously in `<head>` with zero flash of unstyled theme.
   * Dedicated **Contact & Support** page (Distributor Offices + FAQ Accordion) and **Privacy Policy** page.

---

## Demo Login Accounts

| Role | Mobile Number | Password | Details |
| :--- | :--- | :--- | :--- |
| **Kirana Retailer (Standard)** | `9826012345` | `retailer123` | *M/s Gupta Kirana Bhandar* (Wright Town, Jabalpur) • Credit Limit: ₹60,000 |
| **Kirana Retailer (Near Limit)** | `9826054321` | `retailer123` | *Verma Super Daily Needs* (Gorakhpur, Jabalpur) • Tests Credit Hold Policy |
| **Order Desk Staff** | `9425099881` | `desk123` | *Pooja Sharma* • Office Clerk (Approve, Reject, Tally CSV Export) |
| **Distributor Admin** | `9425000001` | `admin123` | *Rajesh Agarwal* • Distributor Principal |
| **1-Click Demo Sign-In** | Any | — | Click *"Continue with 1-Click Demo Account"* on Sign In |
| **SMS OTP (Demo)** | Registered mobile | `123456` | Switch to *"Sign In with OTP"* and enter `123456` |

---

## Running Locally

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Seeds MongoDB database
npm run dev      # Starts Express API at http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev      # Starts React + Vite frontend at http://localhost:5173
```

### 3. Production Build (Both Workspaces)
```bash
npm run build
```

---

## Technology Stack
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios.
* **Backend:** Node.js, Express.js, TypeScript (`tsx` / ESM), Mongoose, Zod, JWT, `bcryptjs`.
* **Database:** MongoDB Atlas.
* **Accounting Integration:** Tally ERP 9 / TallyPrime CSV Export.
