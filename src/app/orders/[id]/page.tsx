"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getOrder } from "@/lib/api";
import type { Order } from "@/lib/api";
import { formatPrice, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";

const STEPS = ["placed", "confirmed", "dispatched", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    getOrder(token, id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12"><div className="skeleton h-96 rounded-2xl" /></div>;
  if (!order) return <div className="text-center py-20"><p className="text-slate-500">Order not found</p></div>;

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Success banner */}
      {isSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 mb-6 animate-fade-up">
          <CheckCircle2 size={22} />
          <div>
            <p className="font-bold">Order Placed Successfully!</p>
            <p className="text-sm">You will receive a confirmation shortly.</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">#{order.order_number}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-sm`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 z-0">
              <div
                className="h-full bg-teal-600 transition-all duration-500"
                style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            {STEPS.map((step, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i <= stepIndex ? "bg-teal-600 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <p className="text-xs text-slate-600 capitalize font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Package size={16} /> Order Items
        </h2>
        <div className="divide-y divide-slate-50">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.product_name}</p>
                <p className="text-slate-500 text-xs">{formatPrice(item.unit_price)} × {item.quantity}</p>
              </div>
              <p className="font-bold text-slate-800">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Delivery</span>
            <span>{order.delivery_charge === 0 ? "FREE" : formatPrice(order.delivery_charge)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 text-center border border-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
        >
          Download Invoice
        </a>
        <Link
          href="/orders"
          className="flex-1 py-3 text-center bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
        >
          All Orders
        </Link>
      </div>
    </div>
  );
}
