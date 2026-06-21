import { getProduct } from "@/lib/api";
import { ProductCard } from "@/components/store/ProductCard";
import { AddToCartSection } from "@/components/store/AddToCartSection";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Jay Geli Ambe Maa Trader`,
    description: product.description || `Buy ${product.name} at the best price on Jay Geli Ambe Maa Trader`,
  };
}

export const revalidate = 3600;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  
  console.log("Fetching product detail for slug:", slug);
  let product;
  try {
    product = await getProduct(slug);
    console.log("Product fetched:", product ? product.id : null);
  } catch (err) {
    console.error("Error fetching product:", err);
    product = null;
  }
  
  if (!product) notFound();

  const category = product.categories;
  const department = category?.departments;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-slate-500 mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight size={12} />
        {department && (
          <>
            <Link href={`/category/${department.slug}`} className="hover:text-slate-900">
              {department.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        {category && (
          <>
            <Link href={`/category/${category.slug}`} className="hover:text-slate-900">
              {category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-slate-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm flex items-center justify-center group">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-12 mix-blend-multiply transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">📦</span>
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-red-100 text-red-600 font-bold px-6 py-3 rounded-2xl text-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.brand && (
            <p className="text-sm text-slate-500 uppercase tracking-widest font-medium mb-2">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {product.name}
          </h1>
          {product.size_variant && (
            <p className="text-slate-500 mb-4">{product.size_variant}</p>
          )}

          {/* Price */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            {product.retail_price ? (
              <>
                <p className="text-3xl font-black text-slate-900">
                  {formatPrice(product.retail_price)}
                  <span className="text-base font-normal text-slate-500 ml-1">/ {product.unit}</span>
                </p>
                {product.wholesale_price && product.wholesale_price !== product.retail_price && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Wholesale: {formatPrice(product.wholesale_price)} / {product.unit}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xl font-semibold text-slate-600">
                Contact for Price —{" "}
                <a href="https://wa.me/911234567890" className="text-green-600 underline">
                  WhatsApp us
                </a>
              </p>
            )}
            {product.moq > 1 && (
              <p className="text-xs text-slate-500 mt-2">
                Minimum order quantity: {product.moq} {product.unit}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 mb-6 leading-relaxed">{product.description}</p>
          )}

          {/* Add to cart (client component) */}
          <AddToCartSection product={product} />

          {/* Meta */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
            {[
              { label: "Unit", value: product.unit },
              { label: "MOQ", value: `${product.moq} ${product.unit}` },
              { label: "Availability", value: product.in_stock ? "✅ In Stock" : "❌ Out of Stock" },
              { label: "Category", value: category?.name || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.related_products && product.related_products.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {product.related_products.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
