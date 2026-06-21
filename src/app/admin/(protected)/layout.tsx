import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Users } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Jay Geli Ambe Maa Trader" };

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
];

import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-100 py-8 px-4">
          <div className="text-xl font-black mb-8 px-2 flex flex-col leading-tight">
            <span className="text-slate-900">Jay Geli Ambe Maa</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-500">Trader</span>
              <span className="text-xs font-normal text-slate-400">Admin</span>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
              ← Back to Store
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-8 overflow-auto">{children}</main>
      </div>
    </AdminGuard>
  );
}

