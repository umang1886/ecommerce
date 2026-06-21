"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { adminGetCustomers } from "@/lib/api";
import type { Customer } from "@/lib/api";
import { toast } from "@/components/ui/Toaster";
import { Users } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 25;

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const result = await adminGetCustomers(token, {
        page: String(page),
        type: typeFilter,
      });
      setCustomers(result.data);
      setTotal(result.total);
    } catch (err: unknown) {
      toast((err as Error).message || "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total customers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 max-w-sm">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Account Types</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-semibold text-slate-700">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Name", "Email", "Phone", "Type", "Joined"].map((h) => (
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
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 group">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {c.full_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.phone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${c.account_type === 'wholesale' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                          {c.account_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
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
