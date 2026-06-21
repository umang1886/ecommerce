"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCartStore } from "@/store/cart";
import { createOrder } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/Toaster";
import { MapPin, CreditCard, Truck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Address {
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

export default function CheckoutPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { items, subtotal, deliveryTotal, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [mounted, setMounted] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const sub = subtotal();
  const delivery = deliveryTotal();
  const total = sub + delivery;

  useEffect(() => {
    setMounted(true);
    if (!user) { router.push("/login?redirect=/checkout"); return; }
    if (items.length === 0 && !orderPlaced) { router.push("/cart"); return; }

    supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", user.id)
      .then(({ data }) => {
        if (data) {
          setAddresses(data as Address[]);
          const def = data.find((a) => a.is_default);
          if (def) setSelectedAddr(def.id);
        }
      });
  }, [user, items, router]);

  async function saveNewAddress() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...newAddr, customer_id: user.id, is_default: false })
        .select()
        .single();
        
      if (error) {
        toast(error.message, "error");
        return;
      }
      
      if (data) {
        setAddresses([...addresses, data as Address]);
        setSelectedAddr(data.id);
        setShowNewAddr(false);
        setNewAddr({ label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
      }
    } catch (err: any) {
      toast(err.message, "error");
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddr) { toast("Please select a delivery address", "error"); return; }
    if (!token) return;
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        address_id: selectedAddr,
        payment_method: paymentMethod,
        notes,
      };
      const result = await createOrder(token, orderPayload);

      setOrderPlaced(true);
      clearCart();
      router.push(`/orders/${result.order.id}?success=1`);
    } catch (err: unknown) {
      toast((err as Error).message || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: address + payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4">
              <MapPin size={18} className="text-amber-500" /> Delivery Address
            </h2>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={cn(
                    "flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    selectedAddr === addr.id ? "border-slate-800 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddr === addr.id}
                    onChange={() => setSelectedAddr(addr.id)}
                    className="mt-1 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {addr.full_name} · {addr.label}
                    </p>
                    <p className="text-sm text-slate-600">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-xs text-slate-500">{addr.phone}</p>
                  </div>
                </label>
              ))}

              {/* Add new address form */}
              {showNewAddr ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "full_name", label: "Full Name", colSpan: 1 },
                      { key: "phone", label: "Phone", colSpan: 1 },
                      { key: "line1", label: "Address Line 1", colSpan: 2 },
                      { key: "line2", label: "Address Line 2", colSpan: 2 },
                      { key: "city", label: "City", colSpan: 1 },
                      { key: "state", label: "State", colSpan: 1 },
                      { key: "pincode", label: "Pincode", colSpan: 1 },
                    ].map(({ key, label, colSpan }) => (
                      <input
                        key={key}
                        placeholder={label}
                        value={newAddr[key as keyof typeof newAddr]}
                        onChange={(e) => setNewAddr({ ...newAddr, [key]: e.target.value })}
                        className={cn(
                          "px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                          colSpan === 2 ? "col-span-2" : ""
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveNewAddress} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold">
                      Save Address
                    </button>
                    <button onClick={() => setShowNewAddr(false)} className="px-4 py-2 text-slate-600 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewAddr(true)}
                  className="flex items-center gap-2 text-slate-900 text-sm font-medium hover:underline"
                >
                  <Plus size={14} /> Add New Address
                </button>
              )}
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4">
              <CreditCard size={18} className="text-amber-500" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when delivered" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={cn(
                    "flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    paymentMethod === method.value ? "border-slate-800 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value as "cod" | "online")}
                    className="mt-1 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{method.icon} {method.label}</p>
                    <p className="text-xs text-slate-500">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <textarea
              placeholder="Order notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-4 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </section>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-xs text-slate-600">
                  <span className="line-clamp-1 flex-1 pr-2">{product.name} × {quantity}</span>
                  <span className="font-medium">{formatPrice(product.retail_price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
                <span className={delivery === 0 ? "text-green-600" : ""}>{delivery === 0 ? "FREE" : formatPrice(delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-slate-900">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddr}
              className="w-full py-3.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Placing Order…" : paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
