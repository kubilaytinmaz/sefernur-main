"use client";

import { EmptyState } from "@/components/states/AsyncStates";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import {
    CalendarDays,
    FileText,
    Heart,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    User,
    UserPen,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import ProfileApplications from "./components/ProfileApplications";
import ProfileEdit from "./components/ProfileEdit";
import ProfileFavorites from "./components/ProfileFavorites";
import ProfileOverview from "./components/ProfileOverview";
import ProfileReservations from "./components/ProfileReservations";
import ProfileReviews from "./components/ProfileReviews";
import ProfileSettings from "./components/ProfileSettings";

const tabs = [
  { key: "overview", label: "Hesap Özeti", icon: LayoutDashboard },
  { key: "edit", label: "Profil Düzenle", icon: UserPen },
  { key: "reservations", label: "Rezervasyonlar", icon: CalendarDays },
  { key: "favorites", label: "Favoriler", icon: Heart },
  { key: "applications", label: "Vize Başvuruları", icon: FileText },
  { key: "reviews", label: "Yorumlar", icon: MessageSquare },
  { key: "settings", label: "Ayarlar", icon: Settings },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function ProfileContent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabKey) || "overview";

  const handleNavigate = useCallback(
    (tab: string) => {
      router.push(`/profile?tab=${tab}`);
    },
    [router]
  );

  // Guest state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-emerald-700 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Hesap Merkezi</h1>
            <p className="text-emerald-100 mt-2">
              Profilinizi yönetmek için giriş yapın.
            </p>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Giriş yapmanız gerekiyor"
            description="Profilinizi görüntülemek ve yönetmek için lütfen giriş yapın."
          />
          <div className="flex justify-center mt-6">
            <Button size="lg" asChild>
              <Link href="/auth">Giriş Yap</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ProfileOverview onNavigate={handleNavigate} />;
      case "edit":
        return <ProfileEdit />;
      case "reservations":
        return <ProfileReservations />;
      case "favorites":
        return <ProfileFavorites />;
      case "applications":
        return <ProfileApplications />;
      case "reviews":
        return <ProfileReviews />;
      case "settings":
        return <ProfileSettings />;
      default:
        return <ProfileOverview onNavigate={handleNavigate} />;
    }
  };

  const currentTab = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <section className="bg-linear-to-r from-emerald-700 to-teal-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "Profil"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white/80" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.fullName || "Kullanıcı"}
              </h1>
              <p className="text-emerald-200 text-sm mt-0.5">
                {user.email || user.phoneNumber || "Hesap Merkezi"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Tab Selector */}
      <div className="lg:hidden border-b border-gray-200 bg-white sticky top-[80px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleNavigate(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.key
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar — Desktop Only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[160px]">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleNavigate(tab.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                      activeTab === tab.key
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <tab.icon
                      className={cn(
                        "w-[18px] h-[18px]",
                        activeTab === tab.key
                          ? "text-emerald-600"
                          : "text-gray-400"
                      )}
                    />
                    {tab.label}
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                    Çıkış Yap
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Current Section Label */}
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <currentTab.icon className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {currentTab.label}
              </h2>
            </div>

            {renderContent()}
          </main>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
