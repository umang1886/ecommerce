import Link from "next/link";
import { getDepartments, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/store/ProductCard";
import { DEPT_ICONS, DEPT_COLORS } from "@/lib/utils";
import { ArrowRight, Truck, ShieldCheck, Headphones, Package } from "lucide-react";

export const revalidate = 3600; // ISR every hour

export default async function HomePage() {
  const [departments, featuredRes] = await Promise.all([
    getDepartments().catch(() => []),
    getProducts({ featured: "true", page: 1 }).catch(() => ({ data: [], total: 0, page: 1, page_size: 20, total_pages: 0 })),
  ]);

  return (
    <div className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 to-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-400/20 rounded-bl-[200px] -z-10 translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-20 w-[500px] h-[500px] bg-teal-500/10 rounded-t-[300px] -z-10 translate-y-1/4" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12 z-10">
          {/* Yellow Text Card */}
          <div className="flex-1 text-center md:text-left animate-fade-up">
            <div className="bg-amber-400 rounded-[2.5rem] p-8 md:p-12 shadow-xl inline-block max-w-xl relative">
              {/* Little detail shape on the card */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-teal-500 rounded-full shadow-lg" />
              
              <div className="inline-flex items-center gap-2 bg-white/40 text-amber-900 text-sm font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
                <Package size={14} /> 200+ Products Delivered to You
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                India&apos;s Trusted<br />
                <span className="text-teal-500 drop-shadow-sm">Retail</span> Supplier
              </h1>
              <p className="text-amber-900 font-medium text-lg mb-8 leading-relaxed">
                Disposable products, cleaning supplies, paper products &amp; more —
                at the best prices, delivered directly to your door.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href="/products"
                  id="hero-shop-now-btn"
                  className="px-8 py-3.5 bg-white text-teal-600 font-black rounded-full transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl text-center text-lg uppercase tracking-wide border-2 border-transparent hover:border-teal-500"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Graphic Side */}
          <div className="flex-1 relative w-full pt-10 md:pt-0">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto relative z-10">
              {[
                { label: "Products", value: "200+", bg: "bg-white", text: "text-teal-600" },
                { label: "Categories", value: "40+", bg: "bg-teal-600", text: "text-white" },
                { label: "Happy Clients", value: "500+", bg: "bg-amber-400", text: "text-slate-900" },
                { label: "Years", value: "15+", bg: "bg-white", text: "text-teal-600" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} rounded-[2rem] p-8 text-center shadow-lg transform hover:-translate-y-2 transition-transform ${i % 2 === 1 ? 'translate-y-4' : ''}`}
                >
                  <div className={`text-4xl font-black ${stat.text}`}>{stat.value}</div>
                  <div className={`text-sm font-bold mt-2 ${stat.text} opacity-80`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── USPs ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Delivery", desc: "On orders above ₹500" },
              { icon: ShieldCheck, label: "Genuine Products", desc: "100% authentic brands" },
              { icon: Headphones, label: "WhatsApp Support", desc: "Mon–Sat, 9am–7pm" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-slate-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Department Cards ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Shop by Department</h2>
            <p className="text-slate-500 mt-1">Browse our complete range of products</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-slate-900 font-semibold text-sm hover:gap-2 transition-all"
          >
            All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(departments.length > 0
            ? departments
            : [
                { slug: "disposable-products", name: "Disposable Products" },
                { slug: "cleaning-products", name: "Cleaning Products" },
                { slug: "cleaning-chemicals", name: "Cleaning Chemicals" },
                { slug: "paper-products", name: "Paper Products" },
                { slug: "plastic-products", name: "Plastic & Others" },
              ]
          ).map((dept: { slug: string; name: string }) => (
            <Link
              key={dept.slug}
              href={`/category/${dept.slug}`}
              className="group relative overflow-hidden rounded-2xl p-6 flex flex-col items-center text-center gap-3 cursor-pointer transition-all hover:scale-105"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${DEPT_COLORS[dept.slug] || "from-slate-500 to-teal-400"} opacity-90`}
              />
              <div className="relative text-4xl">{DEPT_ICONS[dept.slug] || "📦"}</div>
              <div className="relative">
                <p className="text-white font-bold text-sm leading-tight">{dept.name}</p>
              </div>
              <div className="relative flex items-center gap-1 text-white/80 text-xs font-medium group-hover:text-white">
                Shop now <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────── */}
      {featuredRes.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-slate-500 mt-1">Popular picks from our catalog</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-slate-900 font-semibold text-sm hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredRes.data.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
