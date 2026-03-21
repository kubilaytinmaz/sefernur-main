"use client";

import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/providers/site-settings-provider";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Percent,
  Plane,
  Settings,
  UserCheck,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    label: "Rezervasyonlar",
    href: "/admin/reservations",
    icon: CalendarCheck,
  },
  {
    label: "Turlar",
    href: "/admin/tours",
    icon: Compass,
  },
  {
    label: "Oteller",
    href: "/admin/hotels",
    icon: Building2,
    subItems: [
      { label: "Oteller", href: "/admin/hotels" },
      { label: "Rezervasyonlar", href: "/admin/hotels/reservations" },
    ],
  },
  {
    label: "Transferler",
    href: "/admin/transfers",
    icon: Plane,
    subItems: [
      { label: "Araçlar", href: "/admin/transfers" },
      { label: "Rezervasyonlar", href: "/admin/transfers/reservations" },
      { label: "Rotalar ve Fiyatlar", href: "/admin/transfers/pricing" },
      { label: "Raporlar", href: "/admin/transfers/reports" },
    ],
  },
  {
    label: "Rehberler",
    href: "/admin/guides",
    icon: UserCheck,
  },
  {
    label: "Gezilecek Yerler",
    href: "/admin/places",
    icon: MapPin,
  },
  {
    label: "Kampanyalar",
    href: "/admin/campaigns",
    icon: Megaphone,
  },
  {
    label: "İndirimler",
    href: "/admin/promotions",
    icon: Percent,
  },
  {
    label: "İletişim Mesajları",
    href: "/admin/messages",
    icon: Mail,
  },
  {
    label: "Kullanıcılar",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Vize Başvuruları",
    href: "/admin/visa",
    icon: Globe,
  },
  {
    label: "Ayarlar",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.brandName}
                className="h-8 w-8 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                {settings.brandName.charAt(0)}
              </div>
            )}
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.has(item.label);
          
          if (hasSubItems && !collapsed) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => toggleExpanded(item.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active ? "text-emerald-600" : "text-gray-400",
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const subActive = isActive(subItem.href);
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                            subActive
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          )}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  active ? "text-emerald-600" : "text-gray-400",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <Link
          href="/"
          className={cn(
            "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Siteye Dön" : undefined}
        >
          <Globe className="h-5 w-5 flex-shrink-0 text-gray-400" />
          {!collapsed && <span>Siteye Dön</span>}
        </Link>
        <button
          onClick={onLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Çıkış Yap" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}
