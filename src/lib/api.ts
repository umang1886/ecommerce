function getBaseUrl() {
  // 1. If the user explicitly configured NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    let url = process.env.NEXT_PUBLIC_API_URL;
    url = url.replace(/\/$/, ""); // remove trailing slash
    if (url.endsWith("/api")) {
      url = url.slice(0, -4); // strip /api to avoid /api/api
    }
    // On the client, empty string is fine. On the server, it must be absolute.
    if (typeof window === "undefined" && url === "") {
      return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    }
    return url;
  }

  // 2. Server-side in Vercel requires absolute URLs
  if (typeof window === "undefined") {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000"; // Fallback for local SSR if env is missing
  }

  // 3. Client-side in production (fallback to relative paths)
  if (process.env.NODE_ENV === "production") {
    return "";
  }

  // 4. Local development fallback
  return "http://localhost:5000";
}

const API_BASE = getBaseUrl();
async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Use a 15-second timeout to prevent build hangs on Vercel while allowing cold starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      signal: controller.signal
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || "API error");
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Departments & Categories
export const getDepartments = () => apiFetch<Department[]>("/api/departments");
export const getDepartment = (slug: string) =>
  apiFetch<Department>(`/api/departments/${slug}`);
export const getCategory = (slug: string) =>
  apiFetch<Category>(`/api/categories/${slug}`);

// Products
export const getProducts = (params: Record<string, string | number>) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  return apiFetch<ProductsResponse>(`/api/products?${qs}`);
};
export const getProduct = (slug: string) =>
  apiFetch<Product>(`/api/products/${slug}`);

// Cart (requires token)
export const getCart = (token: string) =>
  apiFetch<CartItem[]>("/api/cart", { token });
export const upsertCartItem = (
  token: string,
  payload: { product_id: string; quantity: number }
) =>
  apiFetch<CartItem>("/api/cart", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
export const removeCartItem = (token: string, productId: string) =>
  apiFetch<{ ok: boolean }>(`/api/cart/${productId}`, {
    method: "DELETE",
    token,
  });
export const clearCart = (token: string) =>
  apiFetch<{ ok: boolean }>("/api/cart", { method: "DELETE", token });

// Orders
export const createOrder = (token: string, payload: CreateOrderPayload) =>
  apiFetch<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
export const getOrders = (token: string) =>
  apiFetch<Order[]>("/api/orders", { token });
export const getOrder = (token: string, id: string) =>
  apiFetch<Order>(`/api/orders/${id}`, { token });

// Admin
export const adminCheckRole = (token: string) =>
  apiFetch<{ ok: boolean }>("/api/admin/check", { token });
export const adminGetStats = (token: string) =>
  apiFetch<AdminStats>("/api/admin/stats", { token });
export const adminGetOrders = (token: string, params = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ data: Order[]; total: number }>(
    `/api/admin/orders?${qs}`,
    { token }
  );
};
export const adminUpdateOrderStatus = (
  token: string,
  orderId: string,
  status: string
) =>
  apiFetch<Order>(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    token,
  });
export const adminGetProducts = (token: string, params = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ data: Product[]; total: number }>(
    `/api/admin/products?${qs}`,
    { token }
  );
};
export const adminCreateProduct = (token: string, payload: Partial<Product>) =>
  apiFetch<Product>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
export const adminUpdateProduct = (
  token: string,
  id: string,
  payload: Partial<Product>
) =>
  apiFetch<Product>(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });
export const adminDeleteProduct = (token: string, id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/products/${id}`, {
    method: "DELETE",
    token,
  });
export const adminGetCustomers = (token: string, params = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ data: Customer[]; total: number }>(
    `/api/admin/customers?${qs}`,
    { token }
  );
};

export async function adminUploadImage(
  token: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/admin/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Upload failed");
  }
  const data = await res.json();
  return data.url as string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  display_order: number;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  department_id: string;
  departments?: Department;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  size_variant?: string;
  retail_price: number;
  wholesale_price?: number;
  moq: number;
  unit: string;
  image_url?: string;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  categories?: Category;
  related_products?: Product[];
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CartItem {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  products: Product;
}

export interface Order {
  id: string;
  order_number: string;
  status: "placed" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  payment_method: "cod" | "online";
  payment_status: "pending" | "paid" | "failed";
  subtotal: number;
  delivery_charge: number;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
  addresses?: Address;
  customers?: Customer;
}

export interface OrderItem {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  account_type: "retail" | "wholesale";
  gst_number?: string;
  is_approved: boolean;
  created_at?: string;
}

export interface CreateOrderPayload {
  items: { product_id: string; quantity: number }[];
  address_id: string;
  payment_method: "cod" | "online";
  notes?: string;
}

export interface CreateOrderResponse {
  order: Order;
}

export interface AdminStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  delivered_orders: number;
  out_of_stock_products: number;
  total_customers: number;
}
