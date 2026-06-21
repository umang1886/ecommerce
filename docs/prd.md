# VeloxMart E-Commerce Platform — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** June 2026  
**Product:** VeloxMart Online Store  
**Scope:** B2C & B2B wholesale/retail e-commerce website

---

## 1. Executive Summary

VeloxMart is a wholesale and retail supplier of disposable products, cleaning products, paper products, and plastic/household goods. This PRD defines the requirements for building an e-commerce website that digitizes their Master Product Catalog, enabling customers to browse, search, and order products online.

---

## 2. Goals & Objectives

- Digitize the full VeloxMart product catalog (200+ SKUs across 40+ categories)
- Enable retail and wholesale customers to place orders online
- Support bulk/wholesale pricing tiers for B2B customers
- Reduce manual order-taking via phone/WhatsApp
- Provide an admin panel for catalog management and order processing

---

## 3. Target Users

**Retail Customers (B2C)**
- Individual buyers purchasing for home/office use
- One-time or repeat purchasers
- Browse by category, search by product name

**Wholesale Customers (B2B)**
- Restaurants, hotels, caterers, offices, cleaning businesses
- Require bulk pricing, large quantity ordering
- Need invoices and account history

**Admin (VeloxMart Staff)**
- Manage product catalog, prices, inventory
- Process and track orders
- Manage customer accounts

---

## 4. Product Catalog Structure

The catalog is organized into four top-level departments with subcategories as follows:

### 4.1 Disposable Products
| Category | Example SKUs |
|---|---|
| Paper Cups | 100ml, 150ml, 200ml, 250ml, 300ml |
| Paper Plates | 7", 8", 9", 10" |
| Silver Plates | 7", 8", 9", 10", 12" thali |
| Biodegradable Products | Plates (7"–12"), Bowls (60ml–360ml) |
| Spoons | 140mm, 160mm, biodegradable |
| Silver Foils | 9mtr–72mtr rolls, 1kg, butter paper, cling film |
| Zip Pouches | 8×8 to 12×14 |
| Zip Locks | 2×3 to 10×13 |

### 4.2 Cleaning Products
| Category | Example SKUs |
|---|---|
| Garbage Bags | Small (17×19) to Ex-Jumbo (40×50) |
| Toilet Brush | Single hockey, double hockey, heavy |
| Plastic Kharata | Royal, Premium, Samarthaya |
| Floor/Kitchen Wipers | Small to Jumbo, rubber variants |
| Wet & Dry Mops | Easy, Varni, Nath brands; refills |
| Microfiber Cloths | 40×40 and 40×60 variants |
| Scotch Brights | 7×7.5cm to 9.5×14cm, sponge types |
| Urinal Screens | Standard, V-screen |
| Grass Broom / Kharata | Hard, soft, small/large/big |
| Dusters & Spray Bottles | Normal, chex duster, feather brush |
| Carpet Brush | Soft, hard |
| Zaptiya / Dustpan | Samarthaya, Mappy, Safee |

### 4.3 Cleaning Chemicals
| Category | Example SKUs |
|---|---|
| Toilet Cleaner | Harpic 500ml/1ltr, flushmatic, bloom |
| Glass Cleaner | Colin 500ml/pouch, Pollie, generic 5ltr |
| Floor Cleaner | Lizol, Walker, Sunny, Pollie, Surface cleaner |
| Dishwash Liquid | Vim 250ml/750ml, Freshco, Toral, Prince 5ltr |
| Handwash | Dettol pouch/pump, Do Missile, 5ltr bulk |
| Bleaching | 1ltr, 5ltr, Rin Ala 500ml |
| Pest Control | Black Hit, Red Hit, Khatnil Spray |
| Air Freshener | Godrej, Odonil, Pour Home, Kruger variants |
| Bathroom Freshener | 15+ variants including Glade, Pour Home |

### 4.4 Paper Products
| Category | Example SKUs |
|---|---|
| Paper Napkins | Velox 22×22, 25×28, 28×30, 2ply 30×30 |
| Toilet Rolls | Double Diamond, Century (6in1, 10in1) |
| HRT Rolls | 1kg |
| Box Tissues | Premier 4in1, D.D 4in1 |
| Kitchen Towel | Claret, Century, Velox Premium 2in1 |

### 4.5 Plastic Products & Others
| Category | Example SKUs |
|---|---|
| Dustbins | Small/Medium paddle bin, 20/60/80ltr swing |
| Buckets | Hariware 5ltr–25ltr |
| Tumblers | 750ml, 1ltr |
| Bucket Mop | Refill set |
| Water Bottles | Single, 6in1 |
| Batteries | Duracell AA, AAA |

---

## 5. Feature Requirements

### 5.1 Customer-Facing Features

**F1 — Product Catalog & Browsing**
- Department-level navigation (Disposable / Cleaning / Chemicals / Paper / Plastic)
- Category drill-down with breadcrumb navigation
- Product listing page with grid/list toggle
- Product detail page: name, category, size/variant, price, quantity selector
- Related products suggestions within same category

**F2 — Search**
- Global search bar with autocomplete
- Search by product name, category, brand, or size
- Filter results by department, category, price range

**F3 — Cart & Checkout**
- Add to cart with quantity selection
- Cart summary with subtotal
- Checkout: shipping address, contact, delivery slot preference
- Order summary before payment
- Support COD (Cash on Delivery) and UPI/online payment

**F4 — Wholesale / Bulk Ordering**
- Minimum order quantity (MOQ) per product
- Tiered pricing: retail price vs. wholesale price (triggered at threshold qty)
- Bulk order form: upload CSV or enter quantity per SKU
- Request quote for large orders

**F5 — User Accounts**
- Register/Login (email or mobile OTP)
- Order history and reorder button
- Saved addresses
- Wishlist / saved items
- B2B account type with GST number field

**F6 — Order Tracking**
- Order status: Placed → Confirmed → Dispatched → Delivered
- SMS/WhatsApp notification at each stage
- Invoice download (PDF) after order confirmation

### 5.2 Admin Panel Features

**A1 — Catalog Management**
- Add / edit / delete products and categories
- Bulk import products via CSV/Excel
- Upload product images
- Set retail price, wholesale price, MOQ per SKU
- Mark products as in-stock / out-of-stock / discontinued

**A2 — Order Management**
- View all orders with filters (date, status, customer type)
- Update order status manually
- Generate and download invoice PDF
- Export orders to Excel

**A3 — Customer Management**
- View customer list (B2C and B2B)
- Approve B2B accounts
- View order history per customer

**A4 — Reports**
- Best-selling products
- Revenue by category/period
- Low-stock alerts

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 2 seconds on mobile |
| Mobile responsiveness | Full support (primary audience is mobile) |
| Uptime | 99.5% |
| Search response | < 500ms |
| Concurrent users | Support 100+ simultaneous users |
| Security | HTTPS, OTP auth, input sanitization |
| SEO | Product pages indexable, meta tags per product |

---

## 7. Out of Scope (v1.0)

- Product reviews and ratings
- Loyalty/rewards program
- Live chat support
- Multi-vendor marketplace
- Mobile app (native iOS/Android)
- Automated inventory sync with physical store

---

## 8. Success Metrics

- Online orders per week (target: 50+ in first 3 months)
- Catalog coverage: 100% of products from the master catalog live at launch
- Cart abandonment rate < 40%
- Repeat customer rate > 30% within 60 days

---

## 9. Assumptions & Constraints

- VeloxMart will handle its own delivery/logistics initially (no third-party fulfillment)
- Pricing data will be provided by VeloxMart team before launch
- Product photos may not be available for all SKUs at launch; placeholder images will be used
- GST invoicing is required (India B2B compliance)
- Primary language: English (Hindi support in v2)