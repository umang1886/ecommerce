"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, X, User, LogOut, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Disposables", href: "/category/disposable-products" },
  { label: "Cleaning", href: "/category/cleaning-products" },
  { label: "Paper", href: "/category/paper-products" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 font-black text-[1.05rem] sm:text-2xl tracking-tight leading-none sm:leading-tight justify-center py-2">
            <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              Jay Geli Ambe Maa
            </span>
            <span className="text-amber-500">Trader</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              id="search-toggle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              id="cart-nav-btn"
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-400 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative group hidden md:block">
                <button
                  id="user-menu-btn"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <User size={18} />
                  <span className="hidden sm:block">{user.email?.split("@")[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/orders" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl">
                    <Package size={15} /> My Orders
                  </Link>
                  <Link href="/account" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                    <User size={15} /> Account
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                id="login-nav-btn"
                className="hidden sm:flex items-center gap-1 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3 animate-fade-up">
            <form
              action="/products"
              method="get"
              className="flex gap-2"
            >
              <input
                id="global-search-input"
                name="q"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                autoFocus
                placeholder="Search products, brands, categories…"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 shadow-sm"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-1 animate-fade-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium",
                  pathname === link.href
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {user && <div className="h-px bg-slate-100 my-2" />}
            
            {!user ? (
              <Link
                href="/login"
                className="block px-3 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold text-center shadow-sm mt-4"
              >
                Sign In
              </Link>
            ) : (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Package size={16} /> My Orders
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <User size={16} /> Account
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
