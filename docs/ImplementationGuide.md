# VeloxMart E-Commerce — Implementation Guide

**Version:** 1.0  
**Stack:** Next.js + Supabase + Tailwind CSS  
**Estimated Timeline:** 10–12 weeks (solo dev) / 6–8 weeks (2-person team)

---

## 1. Tech Stack Recommendation

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SEO-friendly, fast, React-based |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, mobile-first |
| Backend/DB | Supabase (PostgreSQL) | Auth, DB, Storage in one; free tier |
| Payments | Razorpay | Best UPI + card support in India |
| Image Storage | Supabase Storage or Cloudinary | Product image hosting |
| Deployment | Vercel (frontend) + Supabase (backend) | Free to start, scalable |
| PDF Invoice | react-pdf or Puppeteer | Invoice generation |

---

## 2. Project Structure

```
veloxmart/
├── app/                          # Next.js App Router
│   ├── (store)/                  # Customer-facing routes
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          # All products / search
│   │   │   └── [slug]/page.tsx   # Product detail
│   │   ├── category/
│   │   │   └── [slug]/page.tsx   # Category listing
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   └── account/page.tsx
│   ├── (admin)/                  # Admin panel routes
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── customers/page.tsx
│   └── api/                      # API routes
│       ├── products/route.ts
│       ├── orders/route.ts
│       └── webhooks/razorpay/route.ts
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── store/                    # ProductCard, CartItem, etc.
│   └── admin/                    # AdminTable, ProductForm, etc.
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── utils.ts
│   └── catalog.ts                # Catalog data helpers
├── data/
│   └── catalog.json              # Seeded from PDF catalog
└── public/
    └── images/products/          # Product images
```

---

## 3. Database Schema (Supabase / PostgreSQL)

```sql
-- Departments (top-level groupings)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  retail_price NUMERIC(10,2),
  wholesale_price NUMERIC(10,2),
  moq INT DEFAULT 1,               -- minimum order quantity
  unit TEXT DEFAULT 'piece',       -- piece, pack, roll, etc.
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  email TEXT,
  account_type TEXT DEFAULT 'retail', -- 'retail' | 'wholesale'
  gst_number TEXT,                    -- B2B only
  is_approved BOOLEAN DEFAULT true,   -- admin approval for wholesale
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  label TEXT,                         -- 'Home', 'Office', etc.
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  address_id UUID REFERENCES addresses(id),
  status TEXT DEFAULT 'placed',       -- placed|confirmed|dispatched|delivered|cancelled
  payment_method TEXT,                -- 'cod' | 'online'
  payment_status TEXT DEFAULT 'pending',
  subtotal NUMERIC(10,2),
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2),
  razorpay_order_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,         -- snapshot at time of order
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

-- Cart (optional: use localStorage for guest, DB for logged-in)
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, product_id)
);
```

---

## 4. Catalog Seed Data

All products from the PDF catalog need to be seeded into the database. Below is the structure for `data/catalog.json` (abbreviated):

```json
{
  "departments": [
    {
      "name": "Disposable Products",
      "slug": "disposable-products",
      "categories": [
        {
          "name": "Paper Cups",
          "slug": "paper-cups",
          "products": [
            { "name": "100ml Paper Cup", "unit": "pack" },
            { "name": "150ml Paper Cup", "unit": "pack" },
            { "name": "200ml Paper Cup", "unit": "pack" },
            { "name": "200ml Plain Paper Cup", "unit": "pack" },
            { "name": "250ml Paper Cup", "unit": "pack" },
            { "name": "300ml Paper Cup", "unit": "pack" }
          ]
        },
        {
          "name": "Paper Plates",
          "slug": "paper-plates",
          "products": [
            { "name": "7 Inch Paper Plate", "unit": "pack" },
            { "name": "8 Inch Paper Plate", "unit": "pack" },
            { "name": "9 Inch Paper Plate", "unit": "pack" },
            { "name": "10 Inch Paper Plate", "unit": "pack" }
          ]
        }
      ]
    },
    {
      "name": "Cleaning Products",
      "slug": "cleaning-products",
      "categories": [
        {
          "name": "Garbage Bags",
          "slug": "garbage-bags",
          "products": [
            { "name": "Small Garbage Bag (17x19)", "unit": "pack" },
            { "name": "Medium Garbage Bag (19x21)", "unit": "pack" },
            { "name": "Large Garbage Bag (24x32)", "unit": "pack" },
            { "name": "Ex-Large Garbage Bag (30x37)", "unit": "pack" },
            { "name": "Jumbo Garbage Bag (30x50)", "unit": "pack" },
            { "name": "Ex-Jumbo Garbage Bag (40x50)", "unit": "pack" },
            { "name": "40x50 Kg Pack Garbage Bag", "unit": "pack" }
          ]
        }
      ]
    }
  ]
}
```

**Seed script** (`scripts/seed.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'
import catalog from '../data/catalog.json'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

async function seed() {
  for (const dept of catalog.departments) {
    const { data: deptRow } = await supabase
      .from('departments').insert({ name: dept.name, slug: dept.slug }).select().single()
    
    for (const cat of dept.categories) {
      const { data: catRow } = await supabase
        .from('categories').insert({ department_id: deptRow.id, name: cat.name, slug: cat.slug }).select().single()
      
      const products = cat.products.map(p => ({
        category_id: catRow.id,
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        unit: p.unit
      }))
      await supabase.from('products').insert(products)
    }
  }
  console.log('Seed complete')
}

seed()
```

---

## 5. Key Pages & Components

### 5.1 Homepage (`app/(store)/page.tsx`)
- Hero banner with VeloxMart branding + CTA "Shop Now"
- Department cards (Disposable / Cleaning / Chemicals / Paper / Plastic)
- Featured / popular products section
- Search bar prominently placed

### 5.2 Category Page (`app/(store)/category/[slug]/page.tsx`)
```typescript
// Fetch products for category from Supabase
const { data: products } = await supabase
  .from('products')
  .select('*, categories(name, departments(name))')
  .eq('categories.slug', params.slug)
  .eq('is_active', true)
```
- Sidebar with subcategory filters
- Product grid: name, image, price, "Add to Cart" button
- Pagination (20 products per page)

### 5.3 Product Detail Page (`app/(store)/products/[slug]/page.tsx`)
- Product image (with placeholder fallback)
- Name, category breadcrumb, description
- Price (show both retail & wholesale if user is B2B)
- Quantity selector respecting MOQ
- Add to Cart / Buy Now buttons
- Related products from same category

### 5.4 Cart (`app/(store)/cart/page.tsx`)
- Line items with quantity editor
- Subtotal calculation
- Delivery charge logic (free above ₹500, for example)
- Proceed to Checkout button
- Login prompt for guest users

### 5.5 Checkout (`app/(store)/checkout/page.tsx`)
- Address selection or new address form
- Payment method: COD or Online (Razorpay)
- Order summary
- Place Order button → triggers Razorpay if online

---

## 6. Payment Integration (Razorpay)

```typescript
// app/api/orders/route.ts — Create Razorpay order
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(req: Request) {
  const { amount, orderId } = await req.json()
  
  const rzpOrder = await razorpay.orders.create({
    amount: amount * 100,       // in paise
    currency: 'INR',
    receipt: orderId
  })
  
  return Response.json({ razorpayOrderId: rzpOrder.id })
}

// app/api/webhooks/razorpay/route.ts — Verify payment
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')!
  
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  
  if (expectedSig === signature) {
    const event = JSON.parse(body)
    if (event.event === 'payment.captured') {
      // Update order payment_status to 'paid' in Supabase
    }
  }
  return Response.json({ ok: true })
}
```

---

## 7. Admin Panel

Use a separate route group `app/(admin)/admin/` protected by middleware checking for admin role.

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    // Check admin role from customers table or a roles table
  }
  return res
}
```

**Admin: Product Management**
- Data table with search and filters (use TanStack Table)
- Inline edit for price and stock status
- Bulk CSV import using `papaparse`
- Image upload to Supabase Storage

---

## 8. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx  # exposed to frontend

MSG91_API_KEY=your-msg91-key   # for SMS/WhatsApp
```

---

## 9. Implementation Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Set up Next.js project with Tailwind and shadcn/ui
- [ ] Set up Supabase project, create all tables
- [ ] Seed full catalog from `catalog.json` (all 200+ products)
- [ ] Build department and category navigation
- [ ] Build product listing and product detail pages

### Phase 2 — Cart & Checkout (Week 3–4)
- [ ] Implement cart using Zustand or React Context
- [ ] Build checkout flow (address + payment method)
- [ ] Integrate Razorpay (test mode)
- [ ] COD order placement
- [ ] Order confirmation page + email

### Phase 3 — Auth & Accounts (Week 5)
- [ ] Supabase Auth: email/password + OTP (phone)
- [ ] Customer registration (retail vs B2B toggle)
- [ ] Order history page
- [ ] Saved addresses
- [ ] Reorder functionality

### Phase 4 — Admin Panel (Week 6–7)
- [ ] Admin dashboard with order stats
- [ ] Product management CRUD
- [ ] CSV bulk import for products/prices
- [ ] Order management with status updates
- [ ] PDF invoice generation (react-pdf)

### Phase 5 — Polish & Launch (Week 8)
- [ ] Mobile responsiveness audit
- [ ] SEO: meta tags, sitemap.xml, robots.txt
- [ ] Performance optimization (image lazy loading, caching)
- [ ] Razorpay switch to live mode
- [ ] Deploy to Vercel + connect custom domain
- [ ] Smoke testing all critical flows

---

## 10. Deployment

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Seed database
npx ts-node scripts/seed.ts

# Deploy to Vercel
vercel --prod
```

**Vercel config (`vercel.json`):**
```json
{
  "buildCommand": "next build",
  "framework": "nextjs",
  "regions": ["bom1"]
}
```
Use `bom1` (Mumbai) region for best latency in India.

---

## 11. Recommended npm Packages

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "@supabase/supabase-js": "^2",
    "@supabase/auth-helpers-nextjs": "^0.10",
    "razorpay": "^2",
    "zustand": "^4",
    "@tanstack/react-table": "^8",
    "papaparse": "^5",
    "@react-pdf/renderer": "^3",
    "zod": "^3",
    "react-hook-form": "^7",
    "lucide-react": "latest",
    "tailwindcss": "^3",
    "clsx": "^2"
  }
}
```

---

## 12. Quick Wins for Launch

1. **WhatsApp Order Button** — Add a floating WhatsApp button linking to the VeloxMart number with a pre-filled message. This provides a fallback for customers not comfortable with online checkout.

2. **Placeholder Images** — Use category-based colored placeholder images (e.g., green for cleaning, blue for paper) until real product photos are available.

3. **Price on Request** — For products without a price set, show "Contact for Price" with a WhatsApp/call link instead of ₹0.

4. **Pincode Check** — Simple delivery availability check by pincode before checkout to manage delivery expectations.