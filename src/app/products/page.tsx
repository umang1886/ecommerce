"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { getProducts, getDepartments } from "@/lib/api";
import type { Product, Department } from "@/lib/api";
import { Search, Grid3X3, List, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

function ProductsInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  const [q, setQ] = useState(initialQ);
  const [dept, setDept] = useState(searchParams.get("department") || "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [prods, depts] = await Promise.all([
        getProducts({ q, department: dept, page }).catch(() => ({
          data: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        })),
        getDepartments().catch(() => []),
      ]);
      setProducts(prods.data);
      setTotal(prods.total);
      setTotalPages(prods.total_pages);
      setDepartments(depts);
      setLoading(false);
    }
    load();
  }, [q, dept, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {q ? `Results for "${q}"` : "All Products"}
        </h1>
        {!loading && (
          <p className="text-slate-500 mt-1">{total} products found</p>
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="products-search-input"
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {q && (
            <button
              onClick={() => { setQ(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors",
            filterOpen ? "bg-slate-50 border-slate-300 text-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
          <button
            id="grid-view-btn"
            onClick={() => setView("grid")}
            className={cn("p-2.5", view === "grid" ? "bg-slate-50 text-slate-900" : "text-slate-400 hover:bg-slate-50")}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            id="list-view-btn"
            onClick={() => setView("list")}
            className={cn("p-2.5", view === "list" ? "bg-slate-50 text-slate-900" : "text-slate-400 hover:bg-slate-50")}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {filterOpen && (
          <aside className="w-56 flex-shrink-0 animate-fade-up">
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Department</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="dept"
                    value=""
                    checked={dept === ""}
                    onChange={() => { setDept(""); setPage(1); }}
                    className="accent-slate-900"
                  />
                  <span className={dept === "" ? "font-semibold text-slate-900" : "text-slate-600"}>All</span>
                </label>
                {departments.map((d) => (
                  <label key={d.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="dept"
                      value={d.slug}
                      checked={dept === d.slug}
                      onChange={() => { setDept(d.slug); setPage(1); }}
                      className="accent-slate-900"
                    />
                    <span className={dept === d.slug ? "font-semibold text-slate-900" : "text-slate-600"}>
                      {d.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className={cn("grid gap-4", view === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1")}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-semibold text-slate-800 mb-2">No products found</p>
              <p className="text-slate-500">Try a different search or browse by department</p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-4",
                  view === "grid"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate-600 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsInner />
    </Suspense>
  );
}
