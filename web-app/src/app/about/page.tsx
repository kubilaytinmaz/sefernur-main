import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
    Award,
    Globe,
    Headphones,
    Heart,
    MapPin,
    Shield,
    Sparkles,
    Target,
    Users,
} from "lucide-react";
import type { ComponentType } from "react";

const STATS = [
  { value: "20+", label: "Yıllık Deneyim" },
  { value: "15.000+", label: "Mutlu Müşteri" },
  { value: "500+", label: "Başarılı Organizasyon" },
  { value: "7/24", label: "Destek Hattı" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Güvenilirlik",
    description:
      "Tüm hizmetlerimiz lisanslı ve sigortalıdır. Müşterilerimizin güvenliği ve memnuniyeti her zaman önceliğimizdir.",
  },
  {
    icon: Heart,
    title: "Samimiyet",
    description:
      "Manevi bir yolculukta yanınızdayız. Her müşterimize aile ferdi gibi yaklaşır, özel ihtiyaçlarınızı dinleriz.",
  },
  {
    icon: Target,
    title: "Şeffaflık",
    description:
      "Fiyatlarda sürpriz yok. Tüm hizmet detaylarını, koşulları ve ücretleri açıkça paylaşırız.",
  },
  {
    icon: Sparkles,
    title: "Kalite",
    description:
      "Konaklama, ulaşım ve rehberlik hizmetlerinde yalnızca en iyi standartları sunarız. Anlaşmalı otellerimiz düzenli denetlenir.",
  },
  {
    icon: Globe,
    title: "Dijital Dönüşüm",
    description:
      "Geleneksel hizmet anlayışını modern teknolojiyle birleştiriyoruz. Mobil uygulama ve web platformumuz tüm süreçleri kolaylaştırır.",
  },
  {
    icon: Headphones,
    title: "Sürekli Destek",
    description:
      "Yolculuk öncesi, esnası ve sonrasında yanınızdayız. 7/24 çağrı merkezi ve WhatsApp destek hattımız her an ulaşılabilirdir.",
  },
];

const MILESTONES = [
  { year: "2004", event: "Sefernur'un kuruluşu ve ilk umre organizasyonu" },
  { year: "2008", event: "Suudi Arabistan'da yerel ofis açılışı" },
  { year: "2012", event: "5.000. müşteriye ulaşılması" },
  { year: "2016", event: "Dijital rezervasyon altyapısına geçiş" },
  { year: "2020", event: "Mobil uygulama lansmanı" },
  { year: "2024", event: "Yeni nesil web platformunun faaliyete geçmesi" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <Badge className="bg-white/15 border-white/25 text-white mb-5">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            2004'den beri hizmetinizdeyiz
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
            Manevi yolculuğunuzda güvenilir yol arkadaşınız
          </h1>
          <p className="mt-4 text-emerald-100 max-w-2xl text-lg leading-relaxed">
            Sefernur, 20 yılı aşkın saha deneyimiyle Umre ve Hac organizasyonlarında
            uçtan uca profesyonel hizmet sunan lider bir seyahat platformudur.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className="border-slate-200 bg-white text-center">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-emerald-700">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Hikayemiz
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Sefernur, 2004 yılında İstanbul'da küçük bir ofiste kuruldu. Kurucumuz,
                kendi umre deneyiminde yaşadığı aksaklıklardan yola çıkarak
                "daha iyisini yapabiliriz" vizyonuyla bu yolculuğa başladı.
              </p>
              <p>
                İlk yıllarımızda yılda 200-300 kişilik gruplarla başladık. Bugün
                yıllık 15.000'den fazla müşteriye hizmet veriyoruz. Mekke ve Medine'de
                kendi operasyon ekiplerimiz, anlaşmalı otellerimiz ve araç filomuz bulunuyor.
              </p>
              <p>
                Geleneksel turizm anlayışının ötesine geçerek teknolojiyi hizmetlerimize
                entegre ettik. Mobil uygulamamız ve web platformumuz sayesinde
                müşterilerimiz tüm süreçleri dijital ortamda kolayca yönetebiliyor.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Ofislerimiz</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <p className="font-medium text-slate-900">İstanbul Merkez Ofis</p>
                <p className="text-sm text-slate-500 mt-1">Fatih, İstanbul - Türkiye</p>
                <p className="text-xs text-emerald-600 mt-1">Genel Merkez & Satış</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-medium text-slate-900">Mekke Operasyon Ofisi</p>
                <p className="text-sm text-slate-500 mt-1">Ajyad, Mekke - Suudi Arabistan</p>
                <p className="text-xs text-emerald-600 mt-1">Saha Koordinasyonu</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-medium text-slate-900">Medine İrtibat Ofisi</p>
                <p className="text-sm text-slate-500 mt-1">Merkez, Medine - Suudi Arabistan</p>
                <p className="text-xs text-emerald-600 mt-1">Transfer & Rehber Hizmetleri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Değerlerimiz</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">
              Her hizmetimizin temelinde bu ilkeler yer alır
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((item) => (
              <ValueCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          Kilometre Taşları
        </h2>
        <div className="max-w-2xl mx-auto">
          {MILESTONES.map((m, i) => (
            <div key={m.year} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shrink-0">
                  {m.year.slice(-2)}
                </div>
                {i < MILESTONES.length - 1 && (
                  <div className="w-0.5 flex-1 bg-emerald-200 mt-2" />
                )}
              </div>
              <div className="pt-2">
                <p className="text-xs font-medium text-emerald-600">{m.year}</p>
                <p className="text-slate-700 mt-0.5">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team summary */}
      <section className="bg-emerald-50 border-t border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Users className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Profesyonel Ekip</h2>
          <p className="max-w-2xl mx-auto text-slate-600 leading-relaxed">
            İstanbul, Mekke ve Medine'de toplam 50+ kişilik operasyon ekibimiz
            müşterilerimize kesintisiz hizmet sunmaktadır. Rehberlerimiz lisanslı,
            şoförlerimiz deneyimli ve müşteri temsilcilerimiz 7/24 ulaşılabilirdir.
          </p>
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-slate-200 bg-slate-50 hover:bg-white transition-colors">
      <CardContent className="p-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-emerald-700" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
