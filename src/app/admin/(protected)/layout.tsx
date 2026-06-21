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
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-100 py-4 md:py-8 px-4 flex flex-col md:block">
          <div className="flex justify-between items-center md:items-start md:flex-col mb-4 md:mb-8 px-2">
            <div className="text-xl font-black leading-tight">
              <span className="text-slate-900">Jay Geli Ambe Maa</span>
              <div className="flex items-center gap-1">
                <span className="text-amber-500">Trader</span>
                <span className="text-xs font-normal text-slate-400">Admin</span>
              </div>
            </div>
            <Link href="/" className="md:hidden text-xs text-slate-500 hover:text-slate-900 font-medium bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
              Store ↗
            </Link>
          </div>
          <nav className="flex md:flex-col gap-2 md:gap-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {NAV.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm font-medium text-slate-600 whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block mt-8 pt-8 border-t border-slate-100">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
              ← Back to Store
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 w-full min-w-0 px-4 md:px-6 py-6 md:py-8 overflow-x-hidden">{children}</main>
      </div>
    </AdminGuard>
  );
}

