"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const FREE_DELIVERY_THRESHOLD = 500;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const sub = subtotal();
  const delivery = sub >= FREE_DELIVERY_THRESHOLD ? 0 : 50;
  const total = sub + delivery;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Your cart is empty</h1>
        <p className="text-slate-500 mb-8">Start shopping to add products here</p>
        <Link
          href="/products"
          className="px-8 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        Shopping Cart <span className="text-slate-400 font-normal text-lg">({items.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 bg-white rounded-2xl p-4 border border-slate-100"
            >
              {/* Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm font-semibold text-slate-800 hover:text-slate-900 line-clamp-2 block"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{product.unit}</p>
                <p className="text-slate-900 font-bold mt-1">{formatPrice(product.retail_price)}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-end gap-3">
                <button
                  id={`remove-cart-${product.id}`}
                  onClick={() => removeItem(product.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 size={15} />
                </button>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {formatPrice(product.retail_price * quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-20">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? "text-green-600 font-medium" : "font-medium"}>
                  {delivery === 0 ? "FREE" : formatPrice(delivery)}
                </span>
              </div>
              {sub < FREE_DELIVERY_THRESHOLD && (
                <p className="text-xs text-amber-500 bg-slate-50 px-3 py-2 rounded-lg">
                  Add {formatPrice(FREE_DELIVERY_THRESHOLD - sub)} more for free delivery!
                </p>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span className="text-xl text-slate-900">{formatPrice(total)}</span>
              </div>
            </div>

            {user ? (
              <Link
                href="/checkout"
                id="proceed-to-checkout-btn"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors"
              >
                Proceed to Checkout →
              </Link>
            ) : (
              <Link
                href="/login?redirect=/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors"
              >
                Sign In to Checkout →
              </Link>
            )}

            <Link
              href="/products"
              className="mt-3 w-full flex items-center justify-center py-3 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
