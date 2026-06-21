"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getDepartments,
} from "@/lib/api";
import type { Product, Department, Category } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  X,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  brand: string;
  size_variant: string;
  retail_price: string;
  wholesale_price: string;
  delivery_charge: string;
  moq: string;
  unit: string;
  category_id: string;
  image_url: string;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  new_category_name?: string;
  new_category_department_id?: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  brand: "",
  size_variant: "",
  retail_price: "",
  wholesale_price: "",
  delivery_charge: "",
  moq: "1",
  unit: "piece",
  category_id: "",
  image_url: "",
  in_stock: true,
  is_active: true,
  is_featured: false,
};

const UNITS = ["piece", "pack", "roll", "set", "kg", "litre", "bottle", "pouch", "can", "bag"];

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Product Form Modal ─────────────────────────────────────────────────────────
function ProductFormModal({
  product,
  departments,
  token,
  onClose,
  onSaved,
}: {
  product: Product | null;
  departments: Department[];
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductFormData>(
    product
      ? {
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          brand: product.brand || "",
          size_variant: product.size_variant || "",
          retail_price: product.retail_price?.toString() || "",
          wholesale_price: product.wholesale_price?.toString() || "",
          delivery_charge: product.delivery_charge?.toString() || "",
          moq: product.moq?.toString() || "1",
          unit: product.unit || "piece",
          category_id: product.category_id || "",
          image_url: product.image_url || "",
          in_stock: product.in_stock ?? true,
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
        }
      : EMPTY_FORM
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product?.image_url || "");
  const fileRef = useRef<HTMLInputElement>(null);

  // Flatten all categories from departments
  const allCategories: (Category & { dept_name: string })[] = departments.flatMap(
    (d) =>
      (d.categories || []).map((c) => ({ ...c, dept_name: d.name }))
  );

  function setField<K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setField("image_url", data.publicUrl);
      setPreviewUrl(data.publicUrl);
      toast("Image uploaded ✓", "success");
    } catch (err: unknown) {
      toast((err as Error).message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category_id) {
      toast("Name and category are required", "error");
      return;
    }
    setSaving(true);
    try {
      let finalCategoryId = form.category_id;

      // Handle new category creation inline
      if (form.category_id === "NEW") {
        if (!form.new_category_name || !form.new_category_department_id) {
          toast("New category name and department are required", "error");
          setSaving(false);
          return;
        }
        
        // Import inline to avoid top-level import issues if not already there
        const { adminCreateCategory } = await import("@/lib/api");
        const newCat = await adminCreateCategory(token, {
          name: form.new_category_name,
          slug: slugify(form.new_category_name),
          department_id: form.new_category_department_id,
          display_order: 99
        });
        
        if (newCat && newCat.id) {
          finalCategoryId = newCat.id;
        } else {
          throw new Error("Failed to create new category");
        }
      }

      const payload: Partial<Product> = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || undefined,
        brand: form.brand || undefined,
        size_variant: form.size_variant || undefined,
        retail_price: form.retail_price ? parseFloat(form.retail_price) : undefined,
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : undefined,
        delivery_charge: form.delivery_charge ? parseFloat(form.delivery_charge) : undefined,
        moq: parseInt(form.moq) || 1,
        unit: form.unit,
        category_id: finalCategoryId,
        image_url: form.image_url || undefined,
        in_stock: form.in_stock,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };

      if (isEdit && product?.id) {
        await adminUpdateProduct(token, product.id, payload);
        toast("Product updated ✓", "success");
      } else {
        await adminCreateProduct(token, payload);
        toast("Product created ✓", "success");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast((err as Error).message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Product Image
            </label>
            <div className="flex gap-4 items-start">
              {/* Preview */}
              <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={32} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 text-slate-900 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 w-full justify-center"
                >
                  <Upload size={15} />
                  {uploading ? "Uploading…" : "Upload from Computer"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-slate-400 text-center">or</p>
                <input
                  id="product-image-url"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => {
                    setField("image_url", e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="Paste image URL…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Name + Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Product Name *
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. 100ml Paper Cup"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                URL Slug *
              </label>
              <input
                id="product-slug"
                type="text"
                required
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="100ml-paper-cup"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Brand
              </label>
              <input
                id="product-brand"
                type="text"
                value={form.brand}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="e.g. Velox, Harpic"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Description
            </label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Brief product description…"
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Category + Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Category *
              </label>
              <select
                id="product-category"
                required
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select category…</option>
                {departments.map((dept) => (
                  <optgroup key={dept.id} label={dept.name}>
                    {(dept.categories || []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Actions">
                  <option value="NEW">➕ Add New Category...</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Size / Variant
              </label>
              <input
                id="product-size"
                type="text"
                value={form.size_variant}
                onChange={(e) => setField("size_variant", e.target.value)}
                placeholder="e.g. 100ml, 7 inch, Large"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {form.category_id === "NEW" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-teal-800 uppercase tracking-wide mb-1">
                  New Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.new_category_name || ""}
                  onChange={(e) => setField("new_category_name", e.target.value)}
                  placeholder="e.g. Fresh Fruits"
                  className="w-full px-3 py-2.5 border border-teal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-800 uppercase tracking-wide mb-1">
                  Department *
                </label>
                <select
                  required
                  value={form.new_category_department_id || ""}
                  onChange={(e) => setField("new_category_department_id", e.target.value)}
                  className="w-full px-3 py-2.5 border border-teal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">Select department…</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Retail Price (₹)
              </label>
              <input
                id="product-retail-price"
                type="number"
                min="0"
                step="0.01"
                value={form.retail_price}
                onChange={(e) => setField("retail_price", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Wholesale Price (₹)
              </label>
              <input
                id="product-wholesale-price"
                type="number"
                min="0"
                step="0.01"
                value={form.wholesale_price}
                onChange={(e) => setField("wholesale_price", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Delivery Charge (₹)
              </label>
              <input
                id="product-delivery-charge"
                type="number"
                min="0"
                step="0.01"
                value={form.delivery_charge}
                onChange={(e) => setField("delivery_charge", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                MOQ
              </label>
              <input
                id="product-moq"
                type="number"
                min="1"
                value={form.moq}
                onChange={(e) => setField("moq", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Unit
            </label>
            <select
              id="product-unit"
              value={form.unit}
              onChange={(e) => setField("unit", e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex gap-6 pt-2">
            {[
              { key: "in_stock", label: "In Stock" },
              { key: "is_active", label: "Active / Visible" },
              { key: "is_featured", label: "Featured on Homepage" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div
                  className={cn(
                    "relative w-10 h-5.5 rounded-full transition-colors",
                    form[key as keyof ProductFormData]
                      ? "bg-teal-600"
                      : "bg-slate-200"
                  )}
                  style={{ height: "22px" }}
                  onClick={() =>
                    setField(
                      key as keyof ProductFormData,
                      !form[key as keyof ProductFormData] as ProductFormData[keyof ProductFormData]
                    )
                  }
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      form[key as keyof ProductFormData] ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-product-btn"
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────────
function ConfirmDeleteModal({
  product,
  token,
  onClose,
  onDeleted,
}: {
  product: Product;
  token: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await adminDeleteProduct(token, product.id);
      toast(`"${product.name}" archived ✓`, "success");
      onDeleted();
      onClose();
    } catch (err: unknown) {
      toast((err as Error).message || "Delete failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Product?</h3>
        <p className="text-slate-600 text-sm mb-6">
          <span className="font-semibold">&ldquo;{product.name}&rdquo;</span> will be hidden from the
          store. This can be undone by editing the product.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Archiving…" : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Products Page ────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    const [prods, depts] = await Promise.all([
      adminGetProducts(token, { q, page: String(page) }).catch(() => ({
        data: [],
        total: 0,
      })),
      getDepartments().catch(() => []),
    ]);
    setProducts(prods.data);
    setTotal(prods.total);
    setDepartments(depts);
    setLoading(false);
  }

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, q, page]);

  function openAdd() {
    setEditProduct(null);
    setShowForm(true);
  }
  function openEdit(p: Product) {
    setEditProduct(p);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total products</p>
        </div>
        <button
          id="add-product-btn"
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          id="admin-products-search"
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-semibold text-slate-700">No products found</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              {q ? "Try a different search" : "Add your first product to get started"}
            </p>
            <button
              onClick={openAdd}
              className="px-6 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600"
            >
              <Plus size={15} className="inline mr-1" /> Add Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {[
                      "Product",
                      "Category",
                      "Retail Price",
                      "Wholesale",
                      "Delivery",
                      "MOQ",
                      "Stock",
                      "Actions",
                    ].map((h) => (
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
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 group">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-48">
                              {p.name}
                            </p>
                            {p.brand && (
                              <p className="text-xs text-slate-400">{p.brand}</p>
                            )}
                            {p.size_variant && (
                              <p className="text-xs text-slate-400">{p.size_variant}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 text-slate-600 text-xs max-w-32">
                        <span className="truncate block">
                          {(p.categories as (Category & { departments?: Department | null }) | null)?.name || "—"}
                        </span>
                      </td>
                      {/* Retail */}
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {p.retail_price ? formatPrice(p.retail_price) : "—"}
                      </td>
                      {/* Wholesale */}
                      <td className="px-4 py-3 text-slate-600">
                        {p.wholesale_price ? formatPrice(p.wholesale_price) : "—"}
                      </td>
                      {/* Delivery */}
                      <td className="px-4 py-3 text-slate-600">
                        {p.delivery_charge ? formatPrice(p.delivery_charge) : "—"}
                      </td>
                      {/* MOQ */}
                      <td className="px-4 py-3 text-slate-600">
                        {p.moq} {p.unit}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "badge text-xs",
                            p.in_stock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          )}
                        >
                          {p.in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                        {p.is_featured && (
                          <span className="badge bg-blue-100 text-amber-500 text-xs ml-1">
                            ⭐
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            id={`edit-product-${p.id}`}
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            id={`delete-product-${p.id}`}
                            onClick={() => setDeleteProduct(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Archive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {/* Modals */}
      {showForm && token && (
        <ProductFormModal
          product={editProduct}
          departments={departments}
          token={token}
          onClose={() => setShowForm(false)}
          onSaved={loadData}
        />
      )}
      {deleteProduct && token && (
        <ConfirmDeleteModal
          product={deleteProduct}
          token={token}
          onClose={() => setDeleteProduct(null)}
          onDeleted={loadData}
        />
      )}
    </div>
  );
}
