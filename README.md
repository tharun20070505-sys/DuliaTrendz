# DULIA TRENDZ — COMPLETE WOMEN'S WEAR E-COMMERCE PLATFORM

> **"Your Style, Our Passion..."**

Dulia Trendz is a modern, haute couture full-stack MERN e-commerce boutique specializing in women's modern, ethnic, casual, festive, and occasion wear. Built with production-style architecture, pure JavaScript, rich editorial aesthetics, atomic size/colour variant inventory management, Razorpay payment processing, and comprehensive administrative controls.

---

## 1. BRAND PALETTE & LUXURY AESTHETICS

- **Warm Ivory (`#F7F0E8`)**: Background radiance and soft editorial canvas.
- **Deep Burgundy (`#641F36`)**: Primary brand accents, action CTAs, and hero highlights.
- **Champagne (`#D9B99B`)**: Border accents, metallic badges, and subtle division lines.
- **Charcoal (`#292524`)**: High-contrast typography and admin suite backgrounds.
- **Muted Rose (`#C58A98`)**: Soft indicators and seasonal badges.
- **Pure White (`#FFFFFF`)**: Clean product cards and contrast modals.

Typography pairings:
- **Headings & Editorial**: *Playfair Display* (Google Fonts Serif)
- **UI, Navigation & Controls**: *Plus Jakarta Sans* (Google Fonts Modern Sans)

---

## 2. KEY FEATURES & ARCHITECTURE

### Customer Boutique Experience (28 Pages)
1. **Homepage with 5 Dedicated Swiper.js Carousels**:
   - **Hero Carousel**: 5 editorial full-width slides with call-to-actions.
   - **Shop by Category Carousel**: 5 key silhouette slides (Ethnic Wear, Western Wear, Dresses, Tops & Shirts, Co-ord Sets).
   - **New Arrivals Carousel**: Live dynamic newest products from MongoDB.
   - **Bestsellers Carousel**: Admin-flagged and highest-selling pieces.
   - **Occasion Collections Carousel**: 5 lifestyle edits (Everyday Essentials, Office Wear, Festive Collection, Wedding Guest, Weekend & Vacation).
   - Plus: Shop by Category Grid, Trending Now, The Dulia Edit, Shop the Look, Limited-Time Offers, Why Dulia Trendz, Verified Customer Reviews, Instagram Style Gallery, and Recently Viewed.
2. **Shop & Filtering Suite**: Multi-facet filter drawer & sidebar (Category, Subcategory, Price Range slider, Sizes XS–XXXL, Colours, Fabrics, Occasions, Availability, Discounts, Sorting).
3. **Product Discovery & Global Search**: Live autocomplete suggestions, keyword matching, SKU indexing, and empty states.
4. **Rich Product Details**: Thumbnail switcher, zoom lightbox, variant selector (Size + Colour), real-time stock indicator ("In Stock", "Only X left", "Out of Stock"), Pincode delivery estimator, Garment specifications, Care instructions, Size Guide modal, and verified purchase reviews.
5. **Bag & Wishlist**: Guest bag persisted via `localStorage`, synchronized and merged with MongoDB upon user login.
6. **Checkout & Multi-Address**: Address manager with landmark support, order summary breakdown (Subtotal, Coupon discount, Shipping calculation, Tax), Razorpay Online payment modal + Cash on Delivery (COD).
7. **Order Fulfilment & Live Tracking**: Interactive visual timeline (`Placed` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`), courier AWB tracking, return request submission, and printable invoices.
8. **Customer Account Center**: Profile details, address book, order history, returns manager, and password security.
9. **Store Information & Policies**: About Us, Contact & Concierge, FAQ accordion, Shipping Policy, Return Policy, Privacy Policy, Terms & Conditions.

### Admin Management Portal (15 Pages)
1. **Admin Dashboard**: Real-time sales metrics, revenue over time chart, low-stock warnings, recent orders, and fast action links.
2. **Product Catalogue Management**: Tabular overview with search, filters, variant count, stock badges, duplicate as draft, archive/active toggle, and delete.
3. **Multi-Section Product Creator & Editor**: Master SKU, category, subcategory, editorial tagline, rich description, Cloudinary / local drag-and-drop image uploader, price & discount auto-calculation, interactive Size & Colour variant matrix (`+Add Variant`, `+Add Size`, `+Add Colour`), fabric specs, and shipping rules.
4. **Variant-Level Inventory Management**: SKU-by-SKU table showing units on hand, threshold alerts, stock adjustment modal (Restock, Return, Audit Correction, Damaged), and audited Stock Movement Ledger tracking delta changes.
5. **Categories & Silhouettes**: Category banner photo, display order, and dynamic subcategory tag chips.
6. **Curated Collections**: Occasion wear edits, hero banners, and homepage feature toggles.
7. **Orders & Dispatch Management**: Fulfilment status workflow, courier partner selection (Bluedart, Delhivery, DTDC, etc.), AWB tracking number assignment, tracking link, and full item order inspection.
8. **Patron Directory**: Customer spend analytics, total order count, lifetime value (LTV), registration dates, and profile modals.
9. **Review Moderation**: Verified purchase badge inspection, star rating review, approve and hide toggles, and review deletion.
10. **Discount Coupons & Vouchers**: Percentage & flat ₹ discounts, minimum order threshold, maximum discount cap, expiry dates, and usage counters.
11. **Homepage Banner & Carousel Editor**: Change announcement bar text/colors, edit all 5 hero slides, category slides, and occasion collections without modifying code.
12. **Payment & Settlement Ledger**: Razorpay HMAC-verified transaction records, COD pending collections, amount logs, and statuses (`PAID`, `PENDING`, `FAILED`, `REFUNDED`).
13. **Store Policies & Settings**: Free shipping threshold, standard & express shipping fees, COD order limits, default low-stock threshold, and return policy window.

---

## 3. TECHNOLOGY STACK

- **Frontend**: React 18, Vite 6, Tailwind CSS, React Router DOM v6, Axios, React Icons (`fi`), Framer Motion, Swiper.js, React Hot Toast, React Hook Form.
- **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose.
- **Authentication**: JSON Web Tokens (JWT) stored in HTTP headers & cookies, bcryptjs password hashing.
- **Payment Gateway**: Razorpay (supports live keys or zero-config sandbox simulation mode).
- **Media Storage**: Cloudinary with automatic local disk upload fallback.
- **Zero-Config Database**: Multi-tier connection with automatic persistent fallback via `mongodb-memory-server` in `backend/.mongo-data` (requires no manual database installation on development machines).

---

## 4. PROJECT STRUCTURE

```text
dulia/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── collectionController.js
│   │   ├── couponController.js
│   │   ├── homepageController.js
│   │   ├── inventoryController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   ├── storeSettingsController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Address.js
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Collection.js
│   │   ├── Coupon.js
│   │   ├── InventoryMovement.js
│   │   ├── NewsletterSubscriber.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── StoreSettings.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── inventoryService.js
│   │   └── paymentService.js
│   ├── app.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── home/
│   │   │   │   ├── HeroCarousel.jsx
│   │   │   │   ├── CategoryCarousel.jsx
│   │   │   │   ├── NewArrivalsCarousel.jsx
│   │   │   │   ├── BestsellersCarousel.jsx
│   │   │   │   └── OccasionCarousel.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   │   └── products/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   ├── SettingsContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AddProduct.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── CategoriesAdmin.jsx
│   │   │   │   ├── CollectionsAdmin.jsx
│   │   │   │   ├── CouponsAdmin.jsx
│   │   │   │   ├── CustomersAdmin.jsx
│   │   │   │   ├── EditProduct.jsx
│   │   │   │   ├── HomepageManagement.jsx
│   │   │   │   ├── Inventory.jsx
│   │   │   │   ├── OrdersAdmin.jsx
│   │   │   │   ├── PaymentManagement.jsx
│   │   │   │   ├── ProductManagement.jsx
│   │   │   │   ├── ReviewsAdmin.jsx
│   │   │   │   └── StoreSettingsAdmin.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Shop.jsx
│   │   │   └── ... (28 customer pages)
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json
└── README.md
```

---

## 5. DEFAULT TEST ACCOUNTS & SEEDED CREDENTIALS

The database comes pre-seeded with 22 handcrafted women's fashion garments (Kurtis, Anarkalis, Sarees, Western Dresses, Tops, Co-ords, and Bottom Wear), complete with multi-size variants, verified customer reviews, active promo codes, and administrative data.

### Store Administrator Account
- **Email**: `admin@duliatrendz.com` (or `admin@duliatrenz.com`)
- **Password**: `Admin@12345`
- **Admin Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)

### Sample Customer Account
- **Email**: `customer@duliatrendz.com`
- **Password**: `Customer@12345`

### Pre-Configured Promotional Coupons
- `WELCOME10`: 10% off (Min order ₹999, Max discount ₹300)
- `DULIA20`: 20% off (Min order ₹1,999, Max discount ₹600)
- `FESTIVE500`: Flat ₹500 off (Min order ₹2,999)

---

## 6. INSTALLATION & QUICK START

### Prerequisites
- Node.js v18+ installed
- npm v9+ installed

### Step 1: Install Dependencies

From root directory:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 2: Environment Configuration

Backend `.env` (`backend/.env`):
```env
PORT=5001
NODE_ENV=development

# MongoDB: Leave blank for automatic persistent embedded MongoMemoryServer
MONGODB_URI=

JWT_SECRET=dulia_trenz_jwt_secret_dev_key_2026_super_secure
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary credentials (fallback uses local static uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Razorpay API keys (fallback uses simulation sandbox mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Frontend `.env` (`frontend/.env`):
```env
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=
```

### Step 3: Seed the Database

Run the seed script from the root directory:

```bash
npm run seed
```

This populates:
- 22 complete fashion products across Ethnic, Western, Sarees, Dresses, Tops, and Bottom Wear
- Atomic size/colour variants with varying stock (including low-stock and out-of-stock items)
- Initial inventory movement audit logs
- Default categories & subcategories
- Default occasion wear collections
- Active discount coupons
- Verified customer reviews
- Administrator and customer patron profiles

### Step 4: Run the Application

You can launch backend and frontend simultaneously:

**Terminal 1 — Backend API Server:**
```bash
npm run dev:backend
# Server starts at http://localhost:5001
# Health endpoint: http://localhost:5001/api/health
```

**Terminal 2 — Frontend Boutique UI:**
```bash
npm run dev:frontend
# Boutique runs at http://localhost:5173
```

---

## 7. INVENTORY & ATOMIC TRANSACTIONS RULE

In Dulia Trendz, stock is tracked at the **Variant Level (Size + Colour + SKU)** rather than just at the product level.

```text
Product: Royal Maroon Velvet Anarkali Set
  ├── S  / Burgundy (DT-ANK-001-BUR-S) : 10 Units
  ├── M  / Burgundy (DT-ANK-001-BUR-M) : 15 Units
  └── L  / Burgundy (DT-ANK-001-BUR-L) :  0 Units -> "Out of Stock"
```

When a patron places an order for `M / Burgundy × 2`:
1. The backend verifies stock availability atomically in MongoDB before accepting the order.
2. Upon confirmation / Razorpay payment verification, `stock` is decremented via atomic `$inc: { "variants.$.stock": -quantity }`.
3. An audit record is created in `InventoryMovement` logging previous stock, delta change, new stock, timestamp, and order reference.
4. Other sizes (e.g., `S` or `L`) remain completely unaffected.
5. If stock hits 0, the item instantly reflects **"Out of Stock"** and cannot be checked out.

---

## 8. RAZORPAY PAYMENT FLOW

```text
Customer Checkout
       ↓
Backend Validates Cart, Prices & Stock
       ↓
Creates Razorpay Order (Paise conversion)
       ↓
Frontend Opens Razorpay Payment Modal (UPI / Card / NetBanking)
       ↓
Patron Completes Payment
       ↓
Backend Verifies Razorpay Signature (HMAC-SHA256)
       ↓
Deducts Inventory Atomically & Creates Order Receipt
       ↓
Clears Cart & Displays Order Success Confirmation
```

If Razorpay keys are omitted in development, the platform smoothly executes in **Simulation Mode**, generating realistic order IDs and payment tokens for full end-to-end checkout testing.

---

## 9. PRODUCTION BUILD & DEPLOYMENT

To build the client for production:

```bash
npm run build:frontend
```

Optimizations applied:
- Code-split Rollup chunks (`vendor`, `ui`, `index`)
- Total minified production bundle < 200 KB gzip
- Image lazy loading with responsive aspect ratios
- Smooth animations disabled under `prefers-reduced-motion`

---

## 10. COMMON ISSUES & TROUBLESHOOTING

1. **macOS Port 5000 AirPlay Conflict**:
   - On macOS Monterey/Ventura/Sonoma/Sequoia, the native AirPlay Receiver listens on port 5000 (`ControlCenter`).
   - Dulia Trendz is configured to run on port **`5001`** by default, with automatic increment fallback (`5002`, `5003`) if occupied.

2. **MongoDB Connection**:
   - If no local MongoDB service is running, the app automatically initializes an embedded `mongodb-memory-server` stored persistently in `backend/.mongo-data`.
   - To connect to MongoDB Atlas, simply provide your connection string in `backend/.env` under `MONGODB_URI`.

3. **Cloudinary & Images**:
   - High-resolution editorial photography is hosted via CDN links and supports direct uploads.
   - If Cloudinary credentials are not configured, file uploads fall back automatically to the local `backend/uploads/` directory.

---

## 11. LICENSE

Developed for **DULIA TRENDZ** — Modern Women's Haute Couture. All rights reserved.
