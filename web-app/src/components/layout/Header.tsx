"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/providers/site-settings-provider";
import { useAuthStore } from "@/store/auth";
import {
  ChevronDown,
  Compass,
  FileText,
  Heart,
  Hotel,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plane,
  Shield,
  User,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Oteller", href: "/oteller", icon: Hotel },
  { name: "Transfer", href: "/transferler", icon: Plane },
  { name: "Turlar", href: "/turlar", icon: Compass },
  { name: "Gezilecek Yerler", href: "/gezilecek-yerler", icon: MapPin },
  { name: "Rehber", href: "/rehberler", icon: UserCircle },
  { name: "Vize", href: "/vize", icon: Shield },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const settings = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Hide header on auth page and admin panel (full-screen layout)
  if (pathname === "/auth" || pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-emerald-900 text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="flex items-center hover:text-emerald-200 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center hover:text-emerald-200 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                {settings.email}
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-200">
                🇹🇷 {settings.tagline}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.brandName}
                className="w-12 h-12 rounded-xl object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-2xl">{settings.brandName.charAt(0)}</span>
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-gray-900">{settings.brandName}</div>
              <div className="text-xs text-gray-500 -mt-1">
                {settings.brandSubtitle}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.fullName || "Kullanıcı"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.phoneNumber}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-500 transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-semibold text-gray-900">
                          {user.fullName || "Kullanıcı"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email || user.phoneNumber}
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profilim
                      </Link>
                      <Link
                        href="/profile?tab=reservations"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FileText className="w-4 h-4 mr-3" />
                        Rezervasyonlarım
                      </Link>
                      <Link
                        href="/profile?tab=favorites"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        Favorilerim
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden md:inline-flex"
                >
                  <Link href="/auth">Giriş Yap</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth">Üye Ol</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Button size="md" className="w-full" asChild>
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Giriş Yap / Üye Ol
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
