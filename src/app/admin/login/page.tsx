"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/Toaster";
import { Shield, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast("Admin Login Successful ✓", "success");
      // Redirect to admin dashboard (AdminGuard will verify roles)
      window.location.href = "/admin/dashboard";
    } catch (err: unknown) {
      toast((err as Error).message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-up">
        <div className="bg-slate-50 p-8 text-center border-b border-slate-100 relative">
          <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Jay Geli Ambe Maa Trader Admin
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jaygeliambemaa.in"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-slate-900 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-slate-900 transition-shadow font-mono"
              />
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {loading ? "Authenticating…" : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
