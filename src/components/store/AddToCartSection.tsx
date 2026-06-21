"use client";

import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/api";

export function AddToCartSection({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [qty, setQty] = useState(product.moq || 1);

  const handleAdd = () => {
    addItem(product, qty);
    toast(`${product.name} added to cart ✓`, "success");
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    router.push("/cart");
  };

  return (
    <div className="space-y-3">
      {/* Quantity picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Qty:</label>
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
          <button
            id="qty-minus-btn"
            onClick={() => setQty(Math.max(product.moq || 1, qty - 1))}
            className="px-3 py-2 text-slate-600 hover:bg-slate-50 text-lg font-medium"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-slate-800 min-w-[3rem] text-center">
            {qty}
          </span>
          <button
            id="qty-plus-btn"
            onClick={() => setQty(qty + 1)}
            className="px-3 py-2 text-slate-600 hover:bg-slate-50 text-lg font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          id="add-to-cart-detail-btn"
          onClick={handleAdd}
          disabled={!product.in_stock}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
            product.in_stock
              ? "bg-teal-500 text-white hover:bg-teal-600"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
        <button
          id="buy-now-btn"
          onClick={handleBuyNow}
          disabled={!product.in_stock}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
            product.in_stock
              ? "bg-amber-400 text-white hover:bg-amber-500"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          <Zap size={16} /> Buy Now
        </button>
      </div>
    </div>
  );
}
