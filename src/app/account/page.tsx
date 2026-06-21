"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Mail, Shield } from "lucide-react";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>
      
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
            <p className="text-slate-500">Manage your account details</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
            <Mail className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-500 font-medium">Email Address</p>
              <p className="text-slate-900 font-semibold">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
            <User className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-500 font-medium">Account ID</p>
              <p className="text-slate-900 font-mono text-sm">{user.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
            <Shield className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-500 font-medium">Authentication Status</p>
              <p className="text-teal-600 font-semibold">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
