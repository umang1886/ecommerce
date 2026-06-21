"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getOrders } from "@/lib/api";
import type { Order } from "@/lib/api";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, FileText } from "lucide-react";

export default function OrdersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!token) return;
    getOrders(token)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-xl font-semibold text-slate-800 mb-2">No orders yet</p>
          <Link href="/products" className="text-slate-900 font-medium hover:underline">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-slate-900">#{order.order_number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-bold text-slate-900">{formatPrice(order.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <FileText size={13} /> Invoice
                  </a>
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
