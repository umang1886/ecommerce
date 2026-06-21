import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const DEPT_ICONS: Record<string, string> = {
  "disposable-products": "🥤",
  "cleaning-products": "🧹",
  "cleaning-chemicals": "🧴",
  "paper-products": "🧻",
  "plastic-products": "🪣",
};

export const DEPT_COLORS: Record<string, string> = {
  "disposable-products": "from-orange-500 to-amber-400",
  "cleaning-products": "from-cyan-500 to-teal-400",
  "cleaning-chemicals": "from-green-500 to-emerald-400",
  "paper-products": "from-blue-500 to-indigo-400",
  "plastic-products": "from-purple-500 to-violet-400",
};
