"use client";

import { HotelQuickLinksSection, HotelSearchForm, type HotelSearchFormParams } from "@/components/hotels";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function OtellerPageClient() {
  const router = useRouter();

  const handleSearch = useCallback((params: HotelSearchFormParams) => {
    // Arama parametrelerini URL'e ekle ve sonuçlar sayfasına yönlendir
    const searchParamsString = new URLSearchParams({
      cityCode: (params.cityCode ?? 164).toString(),
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      rooms: encodeURIComponent(JSON.stringify(params.rooms)),
    }).toString();

    router.push(`/otel-sonuclar?${searchParamsString}`);
  }, [router]);

  const handleQuickSearch = useCallback((params: HotelSearchFormParams) => {
    // Hızlı arama için direkt sonuçlar sayfasına yönlendir
    handleSearch(params);
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,#dcfce7,#ecfeff_40%,#f8fafc_70%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  Otel Rezervasyonu
                </h1>
                <p className="text-slate-600 mt-1">
                  Mekke ve Medine&apos;de en uygun otelleri keşfedin
                </p>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <HotelSearchForm onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section - SEO Friendly Hotel Categories */}
      <HotelQuickLinksSection onQuickSearch={handleQuickSearch} />

      {/* Info Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Kutsal Şehirlerde Konaklama</h3>
            <p className="text-slate-600 text-sm">Mekke ve Medine&apos;de Harem-i Şerif&apos;e yürüme mesafesinde oteller.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Güvenli Rezervasyon</h3>
            <p className="text-slate-600 text-sm">Anında onaylı rezervasyon ve güvenli ödeme seçenekleri.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Uygun Fiyatlar</h3>
            <p className="text-slate-600 text-sm">Her bütçeye uygun otel seçenekleri ve özel kampanyalar.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
