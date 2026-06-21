"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  showWholesalePrice?: boolean;
}

export function ProductCard({ product, showWholesalePrice }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product, product.moq);
    toast(`${product.name} added to cart ✓`, "success");
  }

  const displayPrice = showWholesalePrice && product.wholesale_price
    ? product.wholesale_price
    : product.retail_price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="product-card group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">📦</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {!product.in_stock && (
            <span className="badge bg-red-100 text-red-600">Out of Stock</span>
          )}
          {product.is_featured && (
            <span className="badge bg-blue-100 text-amber-500">Featured</span>
          )}
          {product.moq > 1 && (
            <span className="badge bg-slate-100 text-amber-500">MOQ: {product.moq}</span>
          )}
        </div>

        {/* Quick view on hover */}
        <div className="absolute inset-0 bg-teal-700/0 group-hover:bg-teal-700/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1 bg-white/90 backdrop-blur text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            <Eye size={12} /> View Details
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          {product.brand && (
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
            {product.name}
          </h3>
          {product.size_variant && (
            <p className="text-xs text-slate-500 mt-0.5">{product.size_variant}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            {displayPrice ? (
              <p className="text-base font-bold text-slate-900">
                {formatPrice(displayPrice)}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  / {product.unit}
                </span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-500">Contact for price</p>
            )}
            {showWholesalePrice && product.wholesale_price && product.retail_price !== product.wholesale_price && (
              <p className="text-xs text-slate-400 line-through">
                {formatPrice(product.retail_price)}
              </p>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              product.in_stock
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
