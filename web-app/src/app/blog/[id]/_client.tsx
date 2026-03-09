"use client";

import { Card, CardContent } from "@/components/ui/Card";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    Facebook,
    Gift,
    Heart,
    Link as LinkIcon,
    Share2,
    Sparkles,
    Twitter,
    User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════
   BLOG POST VERİLERİ
   ═══════════════════════════════════════════════════════ */

const BLOG_POSTS = [
  {
    id: "ailenizle-manevi-yolculuk",
    title: "Ailenizle Manevi Yolculuk",
    subtitle: "Sevdiklerinizle birlikte kutsal topraklarda",
    excerpt:
      "Ailece yapılan umre, sadece bir ibadet değil, aynı zamanda birlikte paylaşılan manevi bir deneyimdir. Bu özel paketlerimizle ailenizle unutulmaz anılar biriktirin.",
    category: "Kampanya",
    author: "Sefernur Ekibi",
    date: "7 Mart 2026",
    readTime: "5 dakika",
    image:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-rose-600 via-pink-600 to-orange-500",
    discount: "%30",
    badge: "Aile Paketi",
    icon: Gift,
    content: `
      <h2>Ailece Umre: Birlikte Yaşanan Manevi Dönüşüm</h2>
      <p>Umre yolculuğu, ailece yapıldığında çok daha anlamlı ve unutulmaz bir deneyime dönüşür. Çocuklarınızla, eşinizle ve sevdiklerinizle birlikte Kabe'yi tavaf etmek, Safa ile Merve arasında sa'y yapmak, her adımda birlikte dua etmek... İşte ailenizle manevi yolculuğun eşsiz güzelliği.</p>

      <h3>Aile Paketlerimizin Avantajları</h3>
      <ul>
        <li><strong>%30 Özel İndirim:</strong> 4 kişilik aile paketlerinde büyük tasarruf</li>
        <li><strong>Aile Odaları:</strong> Geniş ve konforlu aile odalarında konaklama</li>
        <li><strong>Çocuk Dostu Hizmet:</strong> Çocuklarınız için özel menü ve aktiviteler</li>
        <li><strong>Esnek Program:</strong> Ailenizin tempona uygun ziyaret programı</li>
        <li><strong>Deneyimli Rehberlik:</strong> Aile gruplarında uzman rehber eşliği</li>
      </ul>

      <h3>Ailece Umre Hazırlığı</h3>
      <p>Çocuklarınızla yapacağınız umre için özel hazırlıklar önemlidir:</p>
      <ul>
        <li>Çocuklarınıza umrenin anlamını anlatın</li>
        <li>Basit duaları birlikte ezberleyin</li>
        <li>Rahat kıyafetler ve ayakkabılar seçin</li>
        <li>Sağlık kontrollerini yaptırın</li>
        <li>Pasaport ve vize işlemlerini önceden halladin</li>
      </ul>

      <h3>Paket Detayları</h3>
      <p>Aile paketlerimiz şunları içerir:</p>
      <ul>
        <li>Gidiş-dönüş uçak bileti (4 kişi)</li>
        <li>7 gece 4 yıldızlı otel konaklaması (aile odası)</li>
        <li>Yarım pansiyon (kahvaltı ve akşam yemeği)</li>
        <li>Havalimanı ve otel transferleri</li>
        <li>Rehberlik hizmeti</li>
        <li>Vize işlemleri</li>
        <li>Seyahat sigortası</li>
      </ul>

      <h3>Çocuklarla Umre İpuçları</h3>
      <p><strong>Sabırlı Olun:</strong> Çocuklar yorulabilir, ara vermek normaldir.</p>
      <p><strong>Eğlenceli Anlatın:</strong> İbadetleri oyunlaştırarak çocukların ilgisini canlı tutun.</p>
      <p><strong>Ödüllendirin:</strong> Güzel davranışları takdir edin ve teşvik edin.</p>
      <p><strong>Esneklik:</strong> Programda esnek olun, çocuğunuzun ihtiyaçlarına göre ayarlayın.</p>

      <h3>Rezervasyon ve İletişim</h3>
      <p>Aile paketlerimiz için erken rezervasyon yapmanızı öneririz. Özellikle tatil dönemlerinde ve Ramazan ayında yerler hızla dolmaktadır. Detaylı bilgi ve rezervasyon için bizimle iletişime geçin.</p>

      <blockquote class="border-l-4 border-rose-500 pl-4 italic text-slate-700 my-6">
        "Ailemizle birlikte yaptığımız umre, hayatımızın en güzel anılarından biri oldu. Çocuklarımız Kabe'yi görünce gösterdikleri heyecan ve mutluluk tarif edilemezdi." - Zeynep A.
      </blockquote>

      <h3>Hemen Rezervasyon Yapın</h3>
      <p>Bu özel %30 indirim kampanyası sınırlı sayıda ve sınırlı sürelidir. Ailenizle manevi bir yolculuğa çıkmak için bugün rezervasyon yapın!</p>
    `,
  },
  {
    id: "erken-rezervasyon-avantaji",
    title: "Erken Rezervasyon Avantajı",
    subtitle: "Şimdi rezervasyon yapın, büyük tasarruf edin",
    excerpt:
      "3 ay öncesinden yapılan rezervasyonlarda %50'ye varan indirimlerden yararlanın. Erken planlama hem bütçenize hem de huzurlu bir yolculuk için ideal.",
    category: "Kampanya",
    author: "Sefernur Ekibi",
    date: "7 Mart 2026",
    readTime: "4 dakika",
    image:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-emerald-600 via-teal-600 to-cyan-500",
    discount: "%50",
    badge: "Erken Kayıt",
    icon: Clock,
    content: `
      <h2>Erken Rezervasyonun Avantajları</h2>
      <p>Umre yolculuğunuzu önceden planlamak, hem maddi hem de manevi açıdan birçok avantaj sunar. Erken rezervasyon kampanyamızla %50'ye varan indirimlerden yararlanabilir, en iyi otel odalarını ve uçuş saatlerini seçme fırsatını yakalayabilirsiniz.</p>

      <h3>%50 İndirim Kampanyası</h3>
      <p>3 ay öncesinden yapacağınız rezervasyonlarda:</p>
      <ul>
        <li><strong>%50 İndirim:</strong> Standart paket fiyatlarında yarı yarıya tasarruf</li>
        <li><strong>Oda Seçimi:</strong> En iyi konumdaki odaları seçme önceliği</li>
        <li><strong>Uçuş Saatleri:</strong> Size uygun uçuş saatlerini belirleme fırsatı</li>
        <li><strong>Taksit Kolaylığı:</strong> Uzun vadeli ödeme planları</li>
        <li><strong>Ücretsiz İptal:</strong> 45 gün öncesine kadar ücretsiz iptal hakkı</li>
      </ul>

      <h3>Neden Erken Rezervasyon?</h3>
      <p><strong>Finansal Planlama:</strong> Bütçenizi rahatça planlayabilir, taksitle ödeme yapabilirsiniz.</p>
      <p><strong>Zihinsel Hazırlık:</strong> Manevi olarak hazırlanmak için yeterli zamanınız olur.</p>
      <p><strong>Evrak İşlemleri:</strong> Vize ve pasaport işlemlerini acele etmeden halledebilirsiniz.</p>
      <p><strong>Sağlık Hazırlığı:</strong> Aşılar ve sağlık kontrolleri için bolca vaktiniz olur.</p>

      <h3>Rezervasyon Süreci</h3>
      <ol>
        <li><strong>Tarih Seçimi:</strong> Gitmek istediğiniz tarihi belirleyin (en az 3 ay öncesi)</li>
        <li><strong>Paket Seçimi:</strong> İhtiyaçlarınıza uygun paketi seçin</li>
        <li><strong>Rezervasyon:</strong> Online veya telefon ile rezervasyonunuzu yapın</li>
        <li><strong>Ön Ödeme:</strong> Belirlediğiniz ödeme planına göre ilk taksiti ödeyin</li>
        <li><strong>Onay:</strong> Rezervasyon onayınızı e-posta ile alın</li>
      </ol>

      <h3>Kampanya Şartları</h3>
      <ul>
        <li>Kampanya, seyahat tarihinden en az 3 ay önce yapılan rezervasyonlar için geçerlidir</li>
        <li>İndirim oranı seçilen pakete ve tarihe göre %30 ile %50 arasında değişir</li>
        <li>Ramazan ve hac dönemleri için özel şartlar geçerli olabilir</li>
        <li>Kampanya, diğer indirimlerle birleştirilemez</li>
        <li>Rezervasyon iptalinde genel iptal şartları geçerlidir</li>
      </ul>

      <h3>Ödeme Kolaylıkları</h3>
      <p>Erken rezervasyonlarda özel ödeme planları:</p>
      <ul>
        <li>%20 peşinat, kalan tutar 6 eşit taksit</li>
        <li>Kredi kartına özel taksit seçenekleri</li>
        <li>Havale ve EFT'ye ek indirim</li>
      </ul>

      <blockquote class="border-l-4 border-emerald-500 pl-4 italic text-slate-700 my-6">
        "Erken rezervasyon sayesinde hem bütçemize uygun bir fiyata hem de istediğimiz tarihlerde umre yapma fırsatı bulduk. Kesinlikle tavsiye ederim!" - Ahmet K.
      </blockquote>

      <h3>Hemen Rezervasyon Yapın</h3>
      <p>Bu özel kampanya sınırlı kontenjan ile geçerlidir. Umre yolculuğunuzu planlamak ve en iyi fiyatlardan yararlanmak için hemen rezervasyon yapın!</p>
    `,
  },
  {
    id: "umre-yolculugu-firsati",
    title: "Umre Yolculuğu İçin Fırsat",
    subtitle: "Ekonomik paketlerle manevi yolculuk",
    excerpt:
      "Standart paketlerimizde %20 indirim fırsatı. Kaliteli hizmet, uygun fiyat. Umre hayalinizi gerçeğe dönüştürmenin tam zamanı.",
    category: "Kampanya",
    author: "Sefernur Ekibi",
    date: "7 Mart 2026",
    readTime: "6 dakika",
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-500",
    discount: "%20",
    badge: "Özel Fırsat",
    icon: Sparkles,
    content: `
      <h2>Ekonomik Umre Paketleri</h2>
      <p>Umre ibadeti, her müslümanın hayalini kurduğu manevi bir yolculuktur. Biz de bu kutsal yolculuğu herkes için ulaşılabilir kılmak amacıyla ekonomik ve kaliteli paketler sunuyoruz. %20 indirim kampanyamızla umre hayalinize bir adım daha yaklaşın.</p>

      <h3>Standart Paket İçeriği</h3>
      <p>Ekonomik paketlerimiz, kaliteden ödün vermeden uygun fiyat sunuyor:</p>
      <ul>
        <li><strong>Uçak Bileti:</strong> Gidiş-dönüş ekonomi sınıfı</li>
        <li><strong>Konaklama:</strong> 7 gece 3-4 yıldızlı otellerde</li>
        <li><strong>Mekke:</strong> 4 gece Mescid-i Haram'a yürüme mesafesinde</li>
        <li><strong>Medine:</strong> 3 gece Mescid-i Nebevi yakınında</li>
        <li><strong>Yemek:</strong> Açık büfe kahvaltı dahil</li>
        <li><strong>Transfer:</strong> Havalimanı ve şehir içi transferler</li>
        <li><strong>Rehberlik:</strong> Tecrübeli Türkçe rehber eşliği</li>
        <li><strong>Vize:</strong> Vize işlemleri ve takibi</li>
      </ul>

      <h3>%20 İndirim Fırsatı</h3>
      <p>Bu ay özel olarak standart paketlerimizde %20 indirim uyguluyoruz:</p>
      <ul>
        <li>Normal Fiyat: 65.000 TL</li>
        <li>İndirimli Fiyat: 52.000 TL</li>
        <li>Tasarruf: 13.000 TL</li>
      </ul>

      <h3>Neler Dahil?</h3>
      <p><strong>✈️ Ulaşım:</strong></p>
      <ul>
        <li>İstanbul - Cidde gidiş-dönüş uçak bileti</li>
        <li>Cidde - Mekke - Medine arası otobüs transferi</li>
        <li>Havalimanı karşılama ve uğurlama</li>
      </ul>

      <p><strong>🏨 Konaklama:</strong></p>
      <ul>
        <li>Mekke'de Harem'e yakın 3-4 yıldızlı otel</li>
        <li>Medine'de Mescid-i Nebevi yakınında otel</li>
        <li>Temiz ve konforlu odalar</li>
        <li>Günlük oda temizliği</li>
      </ul>

      <p><strong>🍽️ Yemek:</strong></p>
      <ul>
        <li>Her gün açık büfe kahvaltı</li>
        <li>İsteğe bağlı öğle ve akşam yemeği eklenebilir</li>
      </ul>

      <p><strong>👨‍🏫 Rehberlik:</strong></p>
      <ul>
        <li>Deneyimli Türkçe konuşan rehber</li>
        <li>Umre menasiki eğitimi</li>
        <li>Tarihi ve dini mekanların tanıtımı</li>
        <li>24 saat iletişim desteği</li>
      </ul>

      <h3>Ek Hizmetler (Opsiyonel)</h3>
      <ul>
        <li>Tam pansiyon yemek paketi: +8.000 TL</li>
        <li>5 yıldızlı otel yükseltmesi: +15.000 TL</li>
        <li>Özel transfer hizmeti: +3.000 TL</li>
        <li>Ek gezi programı (Hıra, Uhud): +2.500 TL</li>
      </ul>

      <h3>Kimler İçin Uygundur?</h3>
      <p>Bu paket özellikle şunlar için idealdir:</p>
      <ul>
        <li>İlk defa umre yapacak olanlar</li>
        <li>Bütçe dostu seçenekler arayanlar</li>
        <li>Kısa süreli seyahat planlayanlar</li>
        <li>Grup turlarını tercih edenler</li>
      </ul>

      <h3>Rezervasyon Koşulları</h3>
      <ul>
        <li>Minimum 2 kişilik rezervasyon gereklidir</li>
        <li>Tek kişilik odada ek ücret alınır</li>
        <li>Çocuk indirimleri mevcuttur (6-12 yaş %30, 0-6 yaş %50)</li>
        <li>Kampanya, belirtilen tarihler için geçerlidir</li>
      </ul>

      <h3>Ödeme Seçenekleri</h3>
      <ul>
        <li>Peşin ödeme: Ek %5 indirim</li>
        <li>3 taksit: Faizsiz, kredi kartına</li>
        <li>6 taksit: Bankalara özel kampanyalarla</li>
      </ul>

      <blockquote class="border-l-4 border-violet-500 pl-4 italic text-slate-700 my-6">
        "Ekonomik paket diye kalitesiz olacağını düşünüyordum ama çok yanılmışım. Her şey harikaydı, rehberimiz çok ilgiliydi, oteller temizdi. Fiyat performans açısından mükemmel!" - Fatma S.
      </blockquote>

      <h3>Sıkça Sorulan Sorular</h3>
      <p><strong>S: Vize süreci ne kadar sürer?</strong></p>
      <p>C: Normal koşullarda 7-10 iş günü içinde vize onayı alınır.</p>

      <p><strong>S: Sigortalar dahil mi?</strong></p>
      <p>C: Evet, seyahat sigortası paket fiyatına dahildir.</p>

      <p><strong>S: Tek başıma gidebilir miyim?</strong></p>
      <p>C: Evet, ancak tek kişilik oda kullanımı için ek ücret alınır.</p>

      <h3>Hemen Başvurun</h3>
      <p>%20 indirim fırsatından yararlanmak için hemen başvurun. Kontenjanlar sınırlıdır ve hızla dolmaktadır. Umre hayalinizi ertelemeyin!</p>
    `,
  },
];

/* ═══════════════════════════════════════════════════════
   BLOG DETAY SAYFASI
   ═══════════════════════════════════════════════════════ */

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const id = (params?.id as string) ?? "";
  const post = BLOG_POSTS.find((p) => p.id === id);

  // Diğer yazılar
  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== id).slice(0, 2);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            İçerik Bulunamadı
          </h1>
          <p className="text-slate-600 mb-6">
            Aradığınız blog yazısı bulunamadı.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const Icon = post.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 h-[500px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 h-[500px] bg-gradient-to-br ${post.gradient} opacity-90`}
        />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-32 -translate-x-32" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Geri Dön
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white mb-6">
            <Icon className="w-4 h-4" />
            <span className="font-semibold">{post.badge}</span>
            {post.discount && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span className="text-2xl font-black">{post.discount}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            {post.subtitle}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{post.author}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{post.date}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Bar */}
        <Card className="mb-8 sticky top-4 z-20 border-slate-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isFavorite
                    ? "bg-rose-50 text-rose-600"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                />
                <span className="text-sm font-medium">
                  {isFavorite ? "Favorilerde" : "Favorilere Ekle"}
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Paylaş</span>
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-4 h-4 rounded-full bg-green-600" />
                      <span className="text-sm text-slate-700">WhatsApp</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700">Facebook</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <Twitter className="w-4 h-4 text-sky-500" />
                      <span className="text-sm text-slate-700">Twitter</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <LinkIcon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">
                        Linki Kopyala
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="border-slate-200 mb-12">
          <CardContent className="p-8 md:p-12">
            <div
              className="prose prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-6 prose-ul:space-y-2
                prose-li:text-slate-700 prose-li:leading-relaxed
                prose-strong:text-slate-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic
                prose-ol:my-6 prose-ol:space-y-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className={`border-0 bg-gradient-to-br ${post.gradient} mb-12`}>
          <CardContent className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Özel Kampanya</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hemen Rezervasyon Yapın
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Bu özel kampanyadan yararlanmak için bugün iletişime geçin.
              Kontenjanlar sınırlıdır!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-colors shadow-lg"
              >
                İletişime Geç
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                Turları İncele
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Diğer Kampanyalar
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => {
                const RelatedIcon = relatedPost.icon;
                return (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 h-full">
                      <div className="relative h-48">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${relatedPost.gradient} opacity-80`}
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold">
                          <RelatedIcon className="w-3.5 h-3.5" />
                          {relatedPost.badge}
                        </div>
                        {relatedPost.discount && (
                          <div className="absolute top-4 right-4 text-3xl font-black text-white">
                            {relatedPost.discount}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {relatedPost.title}
                        </h4>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                          {relatedPost.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-2 text-emerald-600 font-medium text-sm group-hover:gap-3 transition-all">
                          Detayları Gör
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
