<a id="readme-top"></a>

<div align="center">

# 📦 Stockora

### Simple Wholesale Ordering for Kirana Shops & FMCG Distributors

*Turn quick shop lists into stock-checked, GST-accurate wholesale orders in under a minute.*

Stockora is a full-stack B2B ordering web app built for FMCG wholesale distributors and neighborhood *kirana* stores in Jabalpur, Madhya Pradesh. Shopkeepers can check live carton stock, see their own shop rates and trade schemes, paste Hinglish WhatsApp lists to build orders fast, and let the distributor's Order Desk export approved bills straight into Tally ERP.

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Smart_Order-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Mumbai_(bom1)-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://stockora-khaki.vercel.app)

<br />

[**🌐 Live Application**](https://stockora-khaki.vercel.app) · [**🩺 Live API Health**](https://stockora-server-app.vercel.app/api/v1/health) · [**💻 GitHub Repository**](https://github.com/KandatiRanjithKumarReddy/Stockora)

</div>

---

<a id="table-of-contents"></a>
## 📑 Table of Contents

1. [Core Concept](#core-concept)
2. [Key Questions & Project Objectives](#key-questions--project-objectives)
3. [Key Features](#key-features)
4. [Feature Highlights](#feature-highlights)
5. [Tech Stack](#tech-stack)
6. [Test Scenarios & Sample Personas](#test-scenarios--sample-personas)
7. [Core Implementation & Business Logic](#core-implementation--business-logic)
8. [Security & Privacy](#security--privacy)
9. [Installation & Setup](#installation--setup)
10. [API Documentation](#api-documentation)
11. [Future Improvements](#future-improvements)
12. [License & Credits](#license--credits)

---

<a id="core-concept"></a>
## 🎯 Core Concept

### The Problem

Wholesale FMCG distributors serving 1,800+ kirana shops handle hundreds of carton orders every day, but most orders still arrive manually:

- **Messy Order Messages:** Shopkeepers send informal Hinglish WhatsApp notes (*"bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"*) or handwritten lists between customers.
- **No Live Visibility:** While ordering, shopkeepers cannot see whether an item is in stock, what their exact shop price is, whether GST is included, or what free-goods scheme is running.
- **Slow Office Re-Typing & Mistakes:** An office team re-types every order into Tally the next morning. Unclear pack sizes or *case vs. piece* confusion cause wrong deliveries, costly returns, and lost sales from surprise stock-outs.

### The Solution

**Stockora** replaces manual re-typing with one clean, fast workflow for both retailers and the distributor's office desk:

- **Fast Catalog for Budget Phones:** Loads quickly even on slow mobile networks, showing clear carton prices, GST rates, live stock badges, and active schemes.
- **Smart Order Capture:** Reads informal Hindi/Hinglish text notes, matches them to real catalog SKUs, asks the user to confirm any unclear units, and remembers each shop's item nicknames.
- **Exact Rule-Based Billing:** All prices, free-case schemes, percentage discounts, and GST (`CGST + SGST`) are calculated by strict backend math rules—never guessed by AI.
- **Order Desk & Tally Export:** Automatically puts over-limit orders on **Credit Hold** for staff review and exports approved orders to a ready-to-import **Tally CSV** file in one click.

---

<a id="key-questions--project-objectives"></a>
## 🧭 Key Questions & Project Objectives

| # | Question / Objective | What the Application Provides | How It Works |
| :--- | :--- | :--- | :--- |
| **1** | **How can shopkeepers order quickly on budget phones and slow 3G?** | Clean, uncluttered catalog with large tap buttons and fast page loads. | Uses tiny `< 2 KB` SVG product images, split JavaScript files, instant search filtering, and a Mumbai (`bom1`) server close to Indian users. |
| **2** | **How do we turn WhatsApp text lists into orders without wrong items?** | **Smart Order** screen that matches Hinglish text to catalog products for human review. | Uses Google Gemini with saved shop aliases, shows confidence levels and backup SKUs, flags unclear units (*case vs. piece*), and waits for user confirmation. |
| **3** | **How do we make sure schemes and GST totals are 100% accurate?** | Instant bill breakdown showing subtotal, free cases, discounts, `CGST`, `SGST`, and final payable amount. | `schemeEngine.ts` runs exact math formulas for case prices, free goods, slab discounts, and HSN tax rates on both preview and order creation. |
| **4** | **How do we keep each retailer's prices and credit private?** | Public visitors only see product names and MRP; wholesale prices unlock only after sign-in. | The server hides dealer rates on logged-out requests, blocks public caching of prices, and clears cart data when a user signs out. |
| **5** | **How do we prevent selling out-of-stock items or exceeding credit limits?** | Live stock locking when an order is placed, plus automatic **Credit Hold** on high balances. | Locks requested cases in MongoDB immediately on checkout and marks the order `CREDIT_HOLD` if `current balance + new bill > credit limit`. |
| **6** | **How does the office team avoid typing orders into Tally by hand?** | **Order Desk** dashboard with order review, line editing, and 1-click CSV download. | Staff approve or edit pending orders and download a clean TallyPrime / Tally ERP 9 sales voucher CSV file. |

---

<a id="key-features"></a>
## ✨ Key Features

- 📦 **Mobile-First Wholesale Catalog:** Search by product name or SKU, filter by category, brand, or *In-Stock Only*, and see clear per-pack rates, full-case rates, and `Excl. GST` labels.
- 🤖 **Stockora Smart Order:** Paste Hindi, Hinglish, or English order text to get matched catalog items, stock warnings, alternative SKU options, and unit confirmation before adding to cart.
- 🎁 **Automatic Trade Schemes:** Built-in support for **Buy X Get Y Free** (e.g., *Buy 10 cases, get 1 free*) and **Slab Discounts** (e.g., *3% off on 5+ cases*).
- 🧾 **Instant GST & Final Payable Summary:** Calculates `CGST` and `SGST` per product HSN code instantly in the cart and displays a confirmed invoice receipt as soon as the order is placed.
- 🔒 **Shop-Specific Dealer Pricing:** Supports custom negotiated pack prices for individual kirana stores (badged as `Shop Rate`) while keeping them hidden from other shops.
- 🛡️ **Stock Reservation & Credit Hold:** Reserves warehouse cartons as soon as an order is submitted and flags orders that cross a shop's credit limit for office approval.
- 🖥️ **Order Desk Portal:** Dedicated staff dashboard to filter orders, read original Smart Order notes, edit case quantities, approve dispatches, or reject holds.
- 📄 **1-Click Tally CSV Export:** Exports approved orders into a standard Tally sales voucher CSV (`VoucherDate, VoucherType, PartyName, ItemName, SKU, BilledQty, FreeQty, Rate, DiscountPercent, Amount`).
- ☀️ **Light Theme Default + Dark Mode Toggle:** Opens in a clean, high-contrast Light Theme by default for daytime shop use, with a manual toggle for True-Black Dark Mode saved to browser storage.

---

<a id="feature-highlights"></a>
## 🔍 Feature Highlights

### 1. Wholesale Catalog & Custom Shop Rates
- **Overview:** Built so shopkeepers can check stock and add cartons in seconds between serving walk-in customers.
- **User Workflow:** Open **Catalog** -> Sign in with mobile number (Password, OTP, or 1-Click Demo) -> Check live case counts, trade schemes, and case prices -> Tap `+` / `-` to pick cases and add to cart.
- **How It Works:** Logged-out visitors see `Sign in to view your shop rate`. Once signed in, the API loads active products, schemes, and any custom `RetailerPrice` for that shop in parallel.
- **Example:** For *M/s Gupta Kirana Bhandar*, *Glucose Biscuit Family Pack 120g* (`SKU-BS-120`) automatically shows their custom **Shop Rate** of `₹15.90/pack` (`₹954.00/case`) instead of the standard `₹16.50/pack`.

### 2. Smart Order (WhatsApp & Hinglish Text Capture)
- **Overview:** Turns everyday Hinglish shop messages into ready-to-check carton lines without risking silent mistakes.
- **User Workflow:** Open **Smart Order** -> Paste a message -> Click **Match Catalog Items** -> Check the matched SKUs, swap to an alternative SKU if needed, confirm any unclear units as `Cases` -> Click **Add Confirmed Items to Cart**.
- **How It Works:** The backend sends the active product list and the shop's saved nicknames (`RetailerAlias`) to Google Gemini. Every returned item is verified against real products in MongoDB, and out-of-stock items are automatically blocked from checkout.
- **Example:** Pasting `"bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"` matches `5` cases of `SKU-BS-075`, `2` cases of `SKU-DT-1KG`, and flags `SKU-TE-250` as `Out of Stock` (`0` cases).

### 3. Instant Checkout, GST Breakdown & Credit Hold
- **Overview:** Shows accurate totals immediately while protecting the distributor from stock shortages and unpaid credit risk.
- **User Workflow:** Review items in **Cart** -> Adjust case counts and see instant GST & scheme updates -> Click **Confirm & Place Order** -> View the confirmed voucher number (`STK-YYYYMMDD-XXXX`) and final payable breakdown.
- **How It Works:** The cart previews exact scheme and GST totals immediately in the browser while syncing live stock with `/api/v1/cart/calculate`. On submit, `/api/v1/orders` locks stock in MongoDB and checks whether the shop's balance plus the new order stays within their credit limit.

### 4. Order Desk Review & Tally ERP Export
- **Overview:** Gives office staff one clean screen to review holds, adjust lines, and export bills to Tally.
- **User Workflow:** Sign in at **Order Desk Portal** -> Filter by `Submitted` or `Credit Hold` -> Click **Inspect** to review credit numbers and line items -> Click **Approve** (or edit/reject) -> Click **Export Approved to Tally CSV**.
- **How It Works:** Approving an order deducts physical stock and adds the bill amount to the shop's outstanding balance. Rejecting an order releases reserved cartons back into available stock. Exporting downloads a CSV file and marks those orders `SYNCED_TO_TALLY`.

---

<a id="tech-stack"></a>
## 🛠️ Tech Stack

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | `React 19` + `TypeScript` | Builds interactive pages for shoppers and Order Desk staff |
| **Build Tool** | `Vite 8` | Fast local development and split production bundles |
| **Styling & Icons** | `Tailwind CSS 3.4` + `Lucide React` | Clean Light Theme default, optional Dark Mode, and crisp icons |
| **API Client** | `Axios` | Sends API requests with auth tokens and cancels outdated searches |
| **Backend Server** | `Node.js` + `Express 4` + `TypeScript` | Handles REST API routes, business rules, and Tally CSV generation |
| **Database** | `MongoDB Atlas` + `Mongoose 8` | Stores users, kirana shops, products, schemes, aliases, and orders |
| **Validation & Security** | `Zod`, `Helmet`, `express-rate-limit`, `cors` | Checks input data, adds security headers, and blocks spam requests |
| **Authentication** | `JSON Web Token (JWT)` + `bcryptjs` | Manages secure 7-day login sessions and encrypted passwords |
| **AI Order Parsing** | `@google/generative-ai` (Google Gemini) | Matches Hindi/Hinglish order notes to catalog SKUs |
| **Hosting** | `Vercel` (Frontend CDN + Mumbai `bom1` Backend) | Hosts the web app and runs backend APIs close to Indian users |

---

<a id="test-scenarios--sample-personas"></a>
## 🧪 Test Scenarios & Sample Personas

Running `npm run seed` loads sample Jabalpur data—**5 FMCG products**, **2 trade schemes**, **1 custom shop price**, **saved Hinglish aliases**, and **4 sample accounts** (local demo credentials are printed in your terminal after seeding, and the login screen also includes **1-Click Demo Sign-In** and **Demo OTP** for retailers).

| Persona / Store | Role | Mobile Number / Sign-In Method | Credit Profile | What to Test |
| :--- | :--- | :--- | :--- | :--- |
| **Ramesh Gupta** — *M/s Gupta Kirana Bhandar* | `RETAILER` | `9826012345` *(Password, Demo OTP, or 1-Click Demo)* | Limit: `₹60,000` · Used: `₹12,400` | Browse catalog, see custom **Shop Rate** on `SKU-BS-120`, test Smart Order Hinglish text, and place a normal order. |
| **Sunil Verma** — *Verma Super Daily Needs* | `RETAILER` | `9826054321` *(Password or Demo OTP)* | Limit: `₹40,000` · Used: `₹38,500` | **Credit Hold Flow:** Place any order above `₹1,500` to see it automatically placed on `CREDIT_HOLD`. |
| **New Shop Owner** — *Self-Signup* | `RETAILER` | *New Shop Onboarding* tab (any unused 10-digit mobile) | Default Limit: `₹50,000` | Register a brand-new kirana shop and immediately browse wholesale rates. |
| **Pooja Sharma** — *Office Clerk* | `ORDER_DESK` | `9425099881` *(Order Desk Portal — Password only)* | Staff Access | Inspect `SUBMITTED` and `CREDIT_HOLD` orders, edit case counts, approve/reject orders, and export Tally CSV. |
| **Rajesh Agarwal** — *Distributor Owner* | `ADMIN` | `9425000001` *(Order Desk Portal — Password only)* | Admin Access | Full oversight of the Order Desk queue, credit holds, and Tally exports. |

---

<a id="core-implementation--business-logic"></a>
## ⚙️ Core Implementation & Business Logic

### 1. Price, Scheme & GST Rules (`server/src/services/schemeEngine.ts`)

AI is never allowed to calculate money. Every cart preview and final order uses the same step-by-step math rules:

1. **Case Price:** Multiplies the shop's pack price (custom shop price if available, otherwise standard dealer price) by `unitsPerCase`:
   ```text
   casePrice   = round2(packPrice × unitsPerCase)
   grossAmount = round2(casePrice × orderedCases)
   ```
2. **Trade Schemes:**
   - **Buy X Get Y Free:** Calculates free cases using `floor(orderedCases / buyQuantity) × freeQuantity` at `₹0` extra charge.
   - **Slab Discount:** If `orderedCases >= minSlabQuantity`, subtracts `discountPercentage%` from `grossAmount`.
3. **HSN GST Calculation (`CGST + SGST`):**
   ```text
   taxableAmount = round2(grossAmount - discountAmount)
   cgstAmount    = round2(taxableAmount × (gstRatePercent / 200))
   sgstAmount    = round2(taxableAmount × (gstRatePercent / 200))
   ```
4. **Final Payable Amount:** Sums all lines and rounds `subtotal - totalDiscount + totalTax` to the nearest rupee.

#### Sample Calculation (`10` Cases Glucose Biscuit + `5` Cases Detergent Powder)

| SKU | Ordered Cases | Case Rate (`₹`) | Gross (`₹`) | Scheme Benefit | Taxable (`₹`) | GST | `CGST + SGST` (`₹`) | Line Total (`₹`) |
| :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| `SKU-BS-075` | `10` | `777.60` | `7,776.00` | **+1 Free Case** (*10+1 Scheme*) | `7,776.00` | `5%` | `194.40 + 194.40` | `8,164.80` |
| `SKU-DT-1KG` | `5` | `2,030.00` | `10,150.00` | **-3% Off** (`-₹304.50`) | `9,845.50` | `18%` | `886.09 + 886.09` | `11,617.68` |
| **Order Total** | **15 (+1 Free)** | — | **`17,926.00`** | **`-₹304.50` + `1` Free Case** | **`17,621.50`** | — | **`2,160.98`** | **`₹19,782`** |

---

### 2. Reliable Smart Order Parsing (`server/src/services/ai/geminiCascadeService.ts`)

- **Automatic Backup Models:** Configures three Gemini models in priority order. If the primary model times out or hits a busy limit, the server automatically switches to the backup model without failing the user's request.
- **Strict Catalog Check:** Returned SKUs are matched against active database products—so invalid or invented SKUs are never shown.
- **Shop Nickname Memory:** Saved mappings in `RetailerAlias` (such as `"biscuit chhota"` -> `SKU-BS-075`) are included in future prompts so Smart Order gets smarter for each shop.

---

### 3. Stock Locking & Order Lifecycle (`orderController.ts` & `orderDeskController.ts`)

Each product tracks **Available Cases** (`stockCasesAvailable`) and **Reserved Cases** (`stockCasesReserved`):

- **When an Order is Placed (`SUBMITTED` or `CREDIT_HOLD`):** Requested cases are immediately added to `stockCasesReserved` so two shops cannot buy the last carton at the same time.
- **When Approved by Order Desk (`APPROVED`):** Cases are deducted from physical stock (`stockCasesAvailable` and `stockCasesReserved`), and the order total is added to the shop's `outstandingBalance`.
- **When Declined by Order Desk (`REJECTED`):** Reserved cases are released back into sellable stock.
- **When Exported to Tally (`SYNCED_TO_TALLY`):** Approved orders are exported into a CSV batch and marked synced so they are never exported twice by mistake.

---

### 4. Database Collections (`server/src/models/`)

| Collection | What It Stores |
| :--- | :--- |
| `User` | Login accounts, mobile numbers, encrypted passwords, and roles (`RETAILER`, `ORDER_DESK`, `ADMIN`) |
| `Retailer` | Kirana shop name, address, GSTIN, credit limit, and current unpaid balance |
| `Product` | SKU code, pack size, units per case, HSN code, dealer price, GST %, and stock counts |
| `Scheme` | Active promotional rules (*Buy X Get Y Free* and *Volume Slab Discounts*) |
| `RetailerPrice` | Custom negotiated pack prices for specific kirana shops |
| `RetailerAlias` | Shop-specific Hinglish nicknames mapped to catalog SKUs |
| `Order` | Placed orders with item price snapshots, GST totals, credit-hold status, and Tally export info |
| `AIProcessingLog` | Internal logs for Smart Order parsing speed and model health |
| `Contact` & `Feedback` | Messages sent through the Contact Us page and Feedback button |

---

<a id="security--privacy"></a>
## 🔐 Security & Privacy

- **Private Wholesale Pricing:** Logged-out visitors cannot see dealer rates or warehouse stock counts. Product API responses disable public caching (`Cache-Control: private, no-store`), and signing out clears local cart items so one shop's rates never show up for another user.
- **Strict Role Separation:** Order Desk and Admin staff must sign in with a password (passwordless OTP is blocked for staff accounts), and all `/api/v1/desk/*` routes verify staff roles on every request.
- **Shop Isolation:** Retailers can only view their own past orders and can only save product aliases for their own shop.
- **Request & Input Protection:** Uses **Zod** validation on form and API inputs, **Helmet** security headers, restricted **CORS** origins, a `32 KB` request size limit, and **rate limits** on login, Smart Order, and public forms.
- **Safe CSV Exports:** Tally CSV cells are cleaned before download so special characters (`=`, `+`, `-`, `@`) cannot trigger spreadsheet formulas in Excel or Tally.

---

<a id="installation--setup"></a>
## 🚀 Installation & Setup

### Prerequisites

- **Node.js** `v20+` and **npm**
- **MongoDB Atlas** connection string (or local MongoDB server)
- **Google Gemini API Key** *(optional — needed only for live Smart Order text parsing)*

### 1. Clone the Repository

```bash
git clone https://github.com/KandatiRanjithKumarReddy/Stockora.git
cd Stockora
```

### 2. Install Dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Set Up Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
ENABLE_DEMO_AUTH=true
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stockora?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_random_secret_at_least_24_chars
JWT_EXPIRES_IN=7d

# Optional: Required for Smart Order AI text matching
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_PRIMARY_MODEL=gemini-3.5-flash-lite
GEMINI_SECONDARY_MODEL=gemini-3.5-flash
GEMINI_TERTIARY_MODEL=gemini-3.1-flash-lite

STOCK_RESERVATION_EXPIRY_MINUTES=1440
CLIENT_ORIGIN=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Seed Sample Data & Start Locally

```bash
# Load sample Jabalpur shops, products, schemes, and demo accounts
npm run seed

# Terminal 1 — Start Backend API (http://localhost:5000)
npm run dev:server

# Terminal 2 — Start Frontend App (http://localhost:5173)
npm run dev:client
```

### 5. Build for Production

```bash
npm run build
```

- **Backend (`server/`):** Configured in `server/vercel.json` to run in Vercel's **Mumbai (`bom1`)** region. Set `CLIENT_ORIGIN` to your live frontend URL.
- **Frontend (`client/`):** Configured in `client/vercel.json` for single-page routing. Set `VITE_API_URL` to `https://<your-backend-domain>/api/v1`.

---

<a id="api-documentation"></a>
## 📡 API Documentation

All API routes start with `/api/v1`. Protected routes accept a JWT token via `Authorization: Bearer <token>` or an `HttpOnly` cookie.

| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Check if the API server is online | Public |
| `POST` | `/api/v1/auth/register` | Register a new kirana shop and sign in | Public |
| `POST` | `/api/v1/auth/login` | Sign in with mobile number and password | Public |
| `POST` | `/api/v1/auth/otp/request` | Request a demo 6-digit OTP for a retailer mobile number | Public *(Demo Auth)* |
| `POST` | `/api/v1/auth/otp/verify` | Verify 6-digit OTP and sign in as a retailer | Public *(Demo Auth)* |
| `POST` | `/api/v1/auth/google` | 1-click demo retailer sign-in | Public *(Demo Auth)* |
| `GET` | `/api/v1/auth/me` | Get current logged-in user and shop profile | Logged-in User |
| `POST` | `/api/v1/auth/logout` | Clear session cookie and sign out | Public |
| `GET` | `/api/v1/products` | List catalog products (includes wholesale rates when signed in) | Optional Auth |
| `GET` | `/api/v1/products/categories` | Get list of product categories and brands | Public |
| `GET` | `/api/v1/products/:id` | Get single product details, scheme, and shop rate | Optional Auth |
| `POST` | `/api/v1/cart/calculate` | Calculate cart subtotal, free cases, discounts, GST, and stock warnings | Logged-in User |
| `POST` | `/api/v1/orders` | Reserve stock, check credit limit, and place a new order | `RETAILER` |
| `GET` | `/api/v1/orders/my` | Get order history for the logged-in kirana shop | `RETAILER` |
| `GET` | `/api/v1/orders/:id` | Get full details of a specific order | Logged-in User |
| `POST` | `/api/v1/ai/parse-order` | Match Hindi/Hinglish order text to catalog products | Logged-in User |
| `POST` | `/api/v1/ai/alias` | Save a shop nickname for a catalog product | Logged-in User |
| `GET` | `/api/v1/desk/orders` | List all orders with filters and counts for Order Desk | `ORDER_DESK` / `ADMIN` |
| `GET` | `/api/v1/desk/orders/:id` | Inspect full order and shop credit details | `ORDER_DESK` / `ADMIN` |
| `PATCH` | `/api/v1/desk/orders/:id/status` | Approve, reject, or hold an order and update stock/credit | `ORDER_DESK` / `ADMIN` |
| `PUT` | `/api/v1/desk/orders/:id/lines` | Edit order case quantities and recalculate totals | `ORDER_DESK` / `ADMIN` |
| `GET` | `/api/v1/desk/export/tally-csv` | Download approved orders as a Tally ERP CSV file | `ORDER_DESK` / `ADMIN` |
| `POST` | `/api/v1/public/contact` | Send a message from the Contact page | Public |
| `POST` | `/api/v1/public/feedback` | Send app feedback from the Feedback button | Public |

---

<a id="future-improvements"></a>
## 🗺️ Future Improvements

Planned enhancements not yet included in the current build:

- **Offline Salesman Mode:** Allow field salesmen to save shop orders without mobile signal and sync automatically when back online.
- **Photo & Voice Note Orders:** Let retailers upload photos of handwritten lists or Hindi voice notes in Smart Order.
- **Van Loading Lists:** Group approved orders by delivery route and total carton weight for warehouse loading teams.
- **Inactive Shop Alerts:** Dashboard list of kirana stores that have not ordered in the last 14 days so salesmen can follow up.
- **Auto-Release Expired Holds:** Background job to automatically free reserved stock if an unapproved hold passes its expiry time.

---

<a id="license--credits"></a>
## 📄 License & Credits

<div align="center">

Developed by **Kandati Ranjith Kumar Reddy** ([`@KandatiRanjithKumarReddy`](https://github.com/KandatiRanjithKumarReddy)) · **Stockora**

Built for wholesale FMCG distribution in Jabalpur, Madhya Pradesh.  
Source code: [github.com/KandatiRanjithKumarReddy/Stockora](https://github.com/KandatiRanjithKumarReddy/Stockora)

Copyright © 2026 Stockora. All rights reserved.

<br />

[**⬆️ Back to Top**](#readme-top)

</div>
