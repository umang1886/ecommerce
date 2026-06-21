"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { adminCheckRole } from "@/lib/api";
import { ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !token) {
      router.replace("/admin/login");
      return;
    }

    let isMounted = true;
    adminCheckRole(token)
      .then(() => {
        if (isMounted) setIsAdmin(true);
      })
      .catch(() => {
        if (isMounted) setIsAdmin(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, token, authLoading, router]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          You do not have administrator privileges to view this page. If you are an admin, please log in with the correct account.
        </p>
        <button
          onClick={() => router.replace("/admin/login")}
          className="px-6 py-2.5 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
