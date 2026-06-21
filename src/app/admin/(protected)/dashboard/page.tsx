"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { adminGetStats, adminGetOrders, adminUpdateOrderStatus } from "@/lib/api";
import type { AdminStats, Order } from "@/lib/api";
import { formatPrice, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, Users, AlertTriangle, Clock } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

const ORDER_STATUSES = ["placed", "confirmed", "dispatched", "delivered", "cancelled"];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!token) return;
    const [s, o] = await Promise.all([
      adminGetStats(token).catch(() => null),
      adminGetOrders(token, { page: "1" }).catch(() => ({ data: [], total: 0 })),
    ]);
    setStats(s);
    setOrders(o.data);
    setLoading(false);
  }

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleStatusChange(orderId: string, status: string) {
    if (!token) return;
    try {
      await adminUpdateOrderStatus(token, orderId, status);
      toast(`Order status updated to ${status}`, "success");
      loadData();
    } catch {
      toast("Failed to update status", "error");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: stats?.total_orders ?? 0, icon: ShoppingBag, color: "text-slate-900", bg: "bg-slate-50" },
          { label: "Total Revenue", value: formatPrice(stats?.total_revenue ?? 0), icon: TrendingUp, color: "text-green-700", bg: "bg-green-50" },
          { label: "Pending Orders", value: stats?.pending_orders ?? 0, icon: Clock, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Delivered", value: stats?.delivered_orders ?? 0, icon: Package, color: "text-teal-700", bg: "bg-teal-50" },
          { label: "Out of Stock", value: stats?.out_of_stock_products ?? 0, icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50" },
          { label: "Total Customers", value: stats?.total_customers ?? 0, icon: Users, color: "text-purple-700", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-slate-900 font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Order #", "Customer", "Total", "Payment", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-800">#{order.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{order.customers?.full_name || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className="uppercase text-xs font-semibold text-slate-500">{order.payment_method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      id={`order-status-${order.id}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
