import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getAllStaticPlaces, getStaticPlacesByCity, placeSEOKeywords } from "@/lib/places/places-data";
import { placeCityLabels } from "@/types/place";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mekke ve Medine Gezilecek Yerler - Umre Hac Ziyaret Rehberi",
  description:
    "Mekke ve Medine'de ziyaret edilecek kutsal yerler. Kabe, Mescid-i Haram, Mescid-i Nebevi, Ravza-i Mutahhara, Uhud, Kuba Camii ve daha fazlası hakkında detaylı bilgi.",
  keywords: [
    "Mekke gezilecek yerler",
    "Medine ziyaret yerleri",
    "Umre rehberi",
    "Hac ziyaret",
    "Kabe tavaf",
    "Mescid-i Haram",
    "Mescid-i Nebevi",
    "Ravza",
    "Uhud",
    "Kuba Camii",
    "Safa Merve",
    "Arafat",
    "Mina",
    "Zemzem",
  ],
  openGraph: {
    title: "Mekke ve Medine Gezilecek Yerler - Umre Hac Ziyaret Rehberi",
    description:
      "Mekke ve Medine'de ziyaret edilecek kutsal yerler. Kabe, Mescid-i Haram, Mescid-i Nebevi, Ravza-i Mutahhara, Uhud, Kuba Camii ve daha fazlası hakkında detaylı bilgi.",
    type: "website",
  },
};

export default function PlacesPage() {
  const mekkePlaces = getStaticPlacesByCity("mekke");
  const medinePlaces = getStaticPlacesByCity("medine");
  const allPlaces = getAllStaticPlaces();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Modern Glassmorphism */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMS4xMDUuODk1LTIgMi0yczIgLjg5NSAyIDItLjg5NSAyLTIgMi0yLS44OTUtMi0yem0wIDZjMC0xLjEwNS44OTUtMiAyLTJzMCAuODk1IDIgMi0uODk1IDItMiAyLTItLjg5NS0yLTJ6bS02IDBjMC0xLjEwNS44OTUtMiAyLTJzMCAuODk1IDIgMi0uODk1IDItMiAyLTItLjg5NS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-emerald-100 text-sm font-medium">Kutsal Yolculuk Rehberi</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Mekke ve Medine
              <span className="block mt-2 bg-gradient-to-r from-amber-200 via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                Gezilecek Yerler
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed mb-12">
              Umre ve hac ziyaretinizde ziyaret edebileceğiniz kutsal yerler hakkında detaylı bilgi.
              İslam tarihinin en önemli mekanlarını keşfedin.
            </p>

            {/* Modern Stats Cards */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
              {[
                { label: "Mekke", value: mekkePlaces.length, color: "from-amber-500 to-orange-600" },
                { label: "Medine", value: medinePlaces.length, color: "from-emerald-500 to-cyan-600" },
                { label: "Toplam", value: allPlaces.length, color: "from-teal-500 to-blue-600" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all hover:bg-white/15 hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-emerald-200 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24 fill-slate-50" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* Quick Filter Tags */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {placeSEOKeywords.mekke.slice(0, 6).map((keyword, i) => (
            <Badge
              key={i}
              className="bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer px-4 py-2 text-sm shadow-sm hover:shadow-md"
            >
              #{keyword}
            </Badge>
          ))}
          {placeSEOKeywords.medine.slice(0, 6).map((keyword, i) => (
            <Badge
              key={`med-${i}`}
              className="bg-white border border-slate-200 text-slate-700 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 transition-all cursor-pointer px-4 py-2 text-sm shadow-sm hover:shadow-md"
            >
              #{keyword}
            </Badge>
          ))}
        </div>
      </section>

      {/* Mekke Section - Bento Grid Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Mekke Gezilecek Yerler</h2>
            <p className="text-slate-600 mt-1">İslam'ın en kutsal şehrinde ziyaret edilecek yerler</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mekkePlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} city="mekke" index={index} />
          ))}
        </div>
      </section>

      {/* Medine Section - Bento Grid Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Medine Gezilecek Yerler</h2>
            <p className="text-slate-600 mt-1">Peygamber şehrinde ziyaret edilecek kutsal mekanlar</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medinePlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} city="medine" index={index} />
          ))}
        </div>
      </section>

      {/* SEO Content Section - Modern Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/50 to-cyan-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Umre ve Hac Ziyaretiniz İçin Önemli Bilgiler
              </h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
              <p className="text-lg leading-relaxed">
                Mekke ve Medine, İslam dünyasının en kutsal şehirleridir. Her yıl milyonlarca Müslüman,
                umre ve hac ibadetlerini yerine getirmek için bu kutsal topraklara ziyarette bulunur.
                Bu sayfada, ziyaretiniz sırasında görebileceğiniz en önemli kutsal yerler hakkında
                detaylı bilgi bulabilirsiniz.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Mekke'de Görülmesi Gerekenler
                  </h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Mekke'de Kabe-i Muazzama ve Mescid-i Haram ziyaretinizin merkezinde yer alır.
                    Tavaf ibadeti, Safa ve Merve arasında sa'y, zemzem suyu içmek ve Makam-ı İbrahim'de
                    namaz kılmak, umrenin farz ve sünnetleri arasındadır.
                  </p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100">
                  <h3 className="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Medine'de Görülmesi Gerekenler
                  </h3>
                  <p className="text-emerald-800 text-sm leading-relaxed">
                    Medine ziyaretinizde Mescid-i Nebevi ve Ravza-i Mutahhara en önemli duraklarınızdan
                    biri olacaktır. Hz. Peygamber'in (s.a.v.) kabri, Hz. Ebu Bekir ve Hz. Ömer'in de
                    burada medfun olduğunu unutmayın.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200">
              {placeSEOKeywords.mekke.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  {keyword}
                </span>
              ))}
              {placeSEOKeywords.medine.map((keyword, i) => (
                <span
                  key={`med-${i}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition-colors cursor-pointer"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/* ────────── Place Card Component ────────── */

function PlaceCard({
  place,
  city,
  index,
}: {
  place: ReturnType<typeof getAllStaticPlaces>[0];
  city: "mekke" | "medine";
  index: number;
}) {
  const isMekke = city === "mekke";
  const gradientClass = isMekke
    ? "from-amber-500 to-orange-600"
    : "from-emerald-500 to-cyan-600";

  const accentColor = isMekke ? "amber" : "emerald";

  return (
    <Link href={`/places/${place.id}`}>
      <Card
        className={`group relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
          isMekke ? "hover:shadow-amber-200/50" : "hover:shadow-emerald-200/50"
        }`}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: "fadeInUp 0.6s ease-out forwards",
        }}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          {place.images && place.images.length > 0 ? (
            <>
              <Image
                src={place.images[0]}
                alt={place.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
          )}

          {/* Floating Badge */}
          <div className="absolute top-4 left-4">
            <Badge
              className={`${isMekke ? "bg-amber-500" : "bg-emerald-500"} text-white border-0 shadow-lg backdrop-blur-sm px-3 py-1.5`}
            >
              {placeCityLabels[place.city]}
            </Badge>
          </div>

          {/* Image count indicator */}
          {place.images && place.images.length > 1 && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {place.images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 relative">
          {/* Hover glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${isMekke ? "from-amber-50" : "from-emerald-50"} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-b-2xl`} />

          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
            {place.title}
          </h3>
          
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
            {place.shortDescription}
          </p>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 text-sm font-semibold text-${accentColor}-600 group-hover:text-${accentColor}-700 transition-colors`}>
              <span>Detaylı Bilgi</span>
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </CardContent>

        {/* Animated border gradient */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${isMekke ? "from-amber-400 via-orange-500 to-amber-400" : "from-emerald-400 via-cyan-500 to-emerald-400"} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20 blur-sm`} />
      </Card>
    </Link>
  );
}
