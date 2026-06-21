"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCategory, getDepartment, getProducts } from "@/lib/api";
import type { Category, Product, Department } from "@/lib/api";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DEPT_ICONS } from "@/lib/utils";

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Try fetching as category first, if not, try as department
      let cat = await getCategory(slug).catch((err) => {
        console.error(`[CategoryPage] Error fetching category ${slug}:`, err);
        return null;
      });
      let isDept = false;
      let deptData = null;

      if (!cat) {
        deptData = await getDepartment(slug).catch((err) => {
          console.error(`[CategoryPage] Error fetching department ${slug}:`, err);
          return null;
        });
        if (deptData) {
          isDept = true;
          // Create a mock category object for UI compatibility
          cat = {
            id: deptData.id,
            name: deptData.name,
            slug: deptData.slug,
            department_id: deptData.id,
            departments: deptData,
          };
        }
      }

      const prods = await getProducts({
        [isDept ? "department" : "category"]: slug,
        page,
      }).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      }));

      setCategory(cat);
      setProducts(prods.data);
      setTotal(prods.total);
      setTotalPages(prods.total_pages);
      setLoading(false);
    }
    load();
  }, [slug, page]);

  const dept = category?.departments;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight size={12} />
        {dept && (
          <>
            <Link href={`/category/${dept.slug}`} className="hover:text-slate-900">{dept.name}</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-slate-800 font-medium">{category?.name || slug}</span>
      </nav>

      {/* Category header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl">
          {DEPT_ICONS[slug] || "📦"}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {category?.name || slug}
          </h1>
          {!loading && (
            <p className="text-slate-500 mt-0.5">{total} products available</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-slate-800 mb-2">No products in this category</p>
          <Link href="/products" className="text-slate-900 font-medium hover:underline">
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-600 px-3">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
