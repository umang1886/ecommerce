"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { adminGetOrders, adminUpdateOrderStatus } from "@/lib/api";
import type { Order } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import { ChevronLeft, ChevronRight, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const result = await adminGetOrders(token, {
        page: String(page),
        status: statusFilter,
      });
      setOrders(result.data);
      setTotal(result.total);
    } catch (err: unknown) {
      toast((err as Error).message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, statusFilter]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!token) return;
    try {
      await adminUpdateOrderStatus(token, orderId, newStatus);
      toast("Order status updated", "success");
      loadData();
    } catch (err: unknown) {
      toast((err as Error).message || "Failed to update status", "error");
    }
  }

  const STATUSES = ["placed", "confirmed", "dispatched", "delivered", "cancelled"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 max-w-sm">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-semibold text-slate-700">No orders found</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              {statusFilter ? "Try a different filter" : "No orders have been placed yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Order", "Date", "Customer", "Total", "Payment", "Status"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 group align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 mb-2">{o.order_number}</div>
                        {o.order_items && o.order_items.length > 0 && (
                          <div className="space-y-1.5 border-l-2 border-slate-100 pl-2">
                            {o.order_items.map(item => (
                              <div key={item.id} className="flex items-start gap-2 text-xs">
                                <div className="min-w-0 flex-1">
                                  <div className="text-slate-700 font-medium truncate" title={item.product_name}>
                                    {item.product_name}
                                  </div>
                                  <div className="text-slate-500">
                                    {item.quantity} x {formatPrice(item.unit_price)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{o.customers?.full_name || "Unknown"}</div>
                        <div className="text-xs text-slate-500">{o.customers?.email || ""}</div>
                        <div className="text-xs text-slate-500 mb-1">{o.customers?.phone || ""}</div>
                        {o.addresses && (
                          <div className="text-[10px] text-slate-500 leading-snug border-t border-slate-100 pt-1 mt-1">
                            {o.addresses.line1}{o.addresses.line2 ? `, ${o.addresses.line2}` : ""} <br />
                            {o.addresses.city}, {o.addresses.state} - {o.addresses.pincode}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800 uppercase text-xs font-bold">{o.payment_method}</div>
                        <div className={cn(
                          "text-xs",
                          o.payment_status === "paid" ? "text-green-600" : "text-amber-500"
                        )}>
                          {o.payment_status}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={cn(
                            "px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white",
                            o.status === "delivered" ? "bg-green-50 text-green-700 border-green-200" :
                            o.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                            o.status === "placed" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-medium text-slate-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
