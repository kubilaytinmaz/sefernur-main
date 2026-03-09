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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/patterns/islamic.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Mekke ve Medine
              <span className="block text-emerald-200 mt-2">Gezilecek Yerler</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              Umre ve hac ziyaretinizde ziyaret edebileceğiniz kutsal yerler hakkında detaylı bilgi.
              İslam tarihinin en önemli mekanlarını keşfedin.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{mekkePlaces.length}</div>
              <div className="text-sm text-emerald-200 mt-1">Mekke</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{medinePlaces.length}</div>
              <div className="text-sm text-emerald-200 mt-1">Medine</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{allPlaces.length}</div>
              <div className="text-sm text-emerald-200 mt-1">Toplam</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Keywords */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {placeSEOKeywords.mekke.slice(0, 6).map((keyword, i) => (
            <Badge key={i} className="bg-emerald-50 text-emerald-700 border-emerald-200 text-sm px-3 py-1.5">
              #{keyword}
            </Badge>
          ))}
          {placeSEOKeywords.medine.slice(0, 6).map((keyword, i) => (
            <Badge key={`med-${i}`} className="bg-cyan-50 text-cyan-700 border-cyan-200 text-sm px-3 py-1.5">
              #{keyword}
            </Badge>
          ))}
        </div>
      </section>

      {/* Mekke Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Mekke Gezilecek Yerler</h2>
            <p className="text-slate-600">İslam'ın en kutsal şehrinde ziyaret edilecek yerler</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mekkePlaces.map((place) => (
            <PlaceCard key={place.id} place={place} city="mekke" />
          ))}
        </div>
      </section>

      {/* Medine Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Medine Gezilecek Yerler</h2>
            <p className="text-slate-600">Peygamber şehrinde ziyaret edilecek kutsal mekanlar</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medinePlaces.map((place) => (
            <PlaceCard key={place.id} place={place} city="medine" />
          ))}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Umre ve Hac Ziyaretiniz İçin Önemli Bilgiler
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
              <p>
                Mekke ve Medine, İslam dünyasının en kutsal şehirleridir. Her yıl milyonlarca Müslüman,
                umre ve hac ibadetlerini yerine getirmek için bu kutsal topraklara ziyarette bulunur.
                Bu sayfada, ziyaretiniz sırasında görebileceğiniz en önemli kutsal yerler hakkında
                detaylı bilgi bulabilirsiniz.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mt-6">Mekke'de Görülmesi Gerekenler</h3>
              <p>
                Mekke'de Kabe-i Muazzama ve Mescid-i Haram ziyaretinizin merkezinde yer alır.
                Tavaf ibadeti, Safa ve Merve arasında sa'y, zemzem suyu içmek ve Makam-ı İbrahim'de
                namaz kılmak, umrenin farz ve sünnetleri arasındadır. Ayrıca Cennetü'l Mualla
                kabristanlığı, Hz. Hatice ve sahabelerin kabirlerini ziyaret edebilirsiniz.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mt-6">Medine'de Görülmesi Gerekenler</h3>
              <p>
                Medine ziyaretinizde Mescid-i Nebevi ve Ravza-i Mutahhara en önemli duraklarınızdan
                biri olacaktır. Hz. Peygamber'in (s.a.v.) kabri, Hz. Ebu Bekir ve Hz. Ömer'in de
                burada medfun olduğunu unutmayın. Uhud Dağı'ndaki şehitliği, Kuba Camii'ni ve
                Cennetü'l Baki kabristanlığını ziyaret etmeyi ihmal etmeyin.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {placeSEOKeywords.mekke.map((keyword, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                    {keyword}
                  </span>
                ))}
                {placeSEOKeywords.medine.map((keyword, i) => (
                  <span key={`med-${i}`} className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
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
}: {
  place: ReturnType<typeof getAllStaticPlaces>[0];
  city: "mekke" | "medine";
}) {
  const isMekke = city === "mekke";
  const gradientClass = isMekke
    ? "from-amber-500 to-orange-600"
    : "from-emerald-500 to-cyan-600";

  return (
    <Link href={`/places/${place.id}`}>
      <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
        isMekke ? "border-amber-100 hover:border-amber-300" : "border-emerald-100 hover:border-emerald-300"
      }`}>
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {place.images && place.images.length > 0 ? (
            <Image
              src={place.images[0]}
              alt={place.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge className={`${isMekke ? 'bg-amber-500' : 'bg-emerald-500'} text-white border-0`}>
              {placeCityLabels[place.city]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {place.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {place.shortDescription}
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
            <span>Detaylı Bilgi</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
