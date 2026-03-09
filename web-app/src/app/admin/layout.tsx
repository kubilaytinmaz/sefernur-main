"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/auth";
import { signOut } from "firebase/auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // 🔓 DEV MODE BYPASS - Remove this in production!
  const DEV_MODE_BYPASS = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === "true";
  const isAdmin = DEV_MODE_BYPASS || user?.roles?.includes("admin") || user?.roles?.includes("moderator");

  useEffect(() => {
    // 🔓 DEV MODE BYPASS - Skip auth redirect in dev mode
    if (!DEV_MODE_BYPASS && !isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router, DEV_MODE_BYPASS]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useAuthStore.getState().logout();
      router.replace("/");
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // 🔓 DEV MODE BYPASS - Allow access in dev mode
  if (!DEV_MODE_BYPASS && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-16 w-16 text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900">Erişim Engellendi</h1>
          <p className="max-w-sm text-gray-500">
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen yönetici ile
            iletişime geçin.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="mt-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
