"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/Toaster";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Signed in successfully ✓", "success");
    router.push("/");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { toast(error.message, "error"); setLoading(false); return; }

    if (data.user) {
      await supabase.from("customers").insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        email,
        account_type: "retail",
      });
    }
    setLoading(false);
    toast("Account created! Check your email to verify.", "success");
    setTab("login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-500 px-8 py-8 text-center">
          <Link href="/" className="text-2xl sm:text-3xl font-black text-white tracking-tight flex flex-col sm:flex-row sm:items-center justify-center leading-none sm:leading-tight">
            <span>Jay Geli Ambe Maa</span><span className="text-amber-400 sm:ml-1 mt-1 sm:mt-0">Trader</span>
          </Link>
          <p className="text-slate-300 text-sm mt-2">
            {tab === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "login", label: "Sign In" },
            { id: "register", label: "Register" },
          ].map((t) => (
            <button
              key={t.id}
              id={`${t.id}-tab-btn`}
              onClick={() => setTab(t.id as "login" | "register")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="px-8 py-8">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input
                    id="login-password-input"
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { id: "register-name", label: "Full Name", type: "text", val: fullName, set: setFullName, placeholder: "Your full name" },
                { id: "register-email", label: "Email", type: "email", val: email, set: setEmail, placeholder: "you@example.com" },
                { id: "register-phone", label: "Phone", type: "tel", val: phone, set: setPhone, placeholder: "+91 XXXXX XXXXX" },
              ].map((f) => (
                <div key={f.id}>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    required
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input
                    id="register-password"
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>


              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
