"use client";

import { Button } from "@/components/ui/Button";
import { useSiteSettings } from "@/providers/site-settings-provider";
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Send,
    Twitter,
    Youtube,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const settings = useSiteSettings();

  // Hide footer on auth page and admin panel (full-screen layout)
  if (pathname === "/auth" || pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Fırsatlardan Haberdar Olun
              </h3>
              <p className="text-gray-400">
                Özel kampanyalar ve indirimlerden ilk siz haberdar olun
              </p>
            </div>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500"
              />
              <Button size="md" className="group">
                Abone Ol
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.brandName}
                  className="w-12 h-12 rounded-xl object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">{settings.brandName.charAt(0)}</span>
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-white">{settings.brandName}</div>
                <div className="text-xs text-gray-400">{settings.brandSubtitle}</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {settings.aboutText}
            </p>
            <div className="flex space-x-3">
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.socialLinks.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.socialLinks.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Hizmetlerimiz</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/hotels"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Otel Rezervasyonu
                </Link>
              </li>
              <li>
                <Link
                  href="/tours"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Umre Turları
                </Link>
              </li>
              <li>
                <Link
                  href="/transfers"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Transfer Hizmetleri
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Rehberlik
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-500">
                  Araç Kiralama (Yakında)
                </span>
              </li>
              <li>
                <Link
                  href="/visa"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Vize İşlemleri
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Kurumsal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  İletişim
                </Link>
              </li>
              <li>
                <Link
                  href="/campaigns"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Kampanyalar
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Gezilecek Yerler
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Sık Sorulanlar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Yasal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link
                  href="/kvkk"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  KVKK
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  İptal & İade
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold mb-4">İletişim</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex items-start text-sm hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-start text-sm hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start text-sm">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>© {settings.copyrightYear} {settings.brandName}. Tüm hakları saklıdır.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span>Güvenli Ödeme</span>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold">
                  VISA
                </div>
                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold">
                  MC
                </div>
                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold">
                  TROY
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
