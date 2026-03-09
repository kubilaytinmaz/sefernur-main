import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowRight, ArrowLeft, Check, Star, Calendar, 
  Plane, Shield, Clock, Phone, Mail
} from 'lucide-react';

export function UmrahDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const packages = [
    {
      name: 'Ekonomik Umre',
      duration: '7 Gün',
      price: '₺45,000',
      hotel: '3 Yıldız'
    },
    {
      name: 'Standart Umre',
      duration: '10 Gün',
      price: '₺65,000',
      hotel: '4 Yıldız'
    },
    {
      name: 'Lüks Umre',
      duration: '14 Gün',
      price: '₺95,000',
      hotel: '5 Yıldız'
    }
  ];

  const features = [
    'Farklı Süre Seçenekleri',
    'Ekonomik Paket Fiyatları',
    'Esnek Tarih Seçenekleri',
    'Konforlu Konaklama',
    'Türk Havayolları Uçuşları',
    'Profesyonel Rehberlik',
    'Havalimanı Transferleri',
    '7/24 Destek Hattı',
    'Vize İşlemleri Dahil',
    'Seyahat Sigortası',
    'Grup ve Bireysel Turlar',
    'Ziyaret Programları'
  ];

  const tourProgram = [
    {
      title: 'Medine Ziyaretleri',
      items: [
        'Mescid-i Nebevi',
        'Ravza-i Mutahhara',
        'Uhud Dağı ve Şehitleri',
        'Kuba Mescidi',
        'Kıble Mescidi',
        'Cennetü\'l Baki Kabristanı'
      ]
    },
    {
      title: 'Mekke Ziyaretleri',
      items: [
        'Mescid-i Haram',
        'Kabe Tavafı',
        'Hıra Mağarası',
        'Sevr Mağarası',
        'Mina Vadisi',
        'Arafat Meydanı'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759568950656-4d2e3006f837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Umre Seyahatleri"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mb-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm">
                Popüler Hizmet
              </span>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">4.7</span>
                <span className="text-white/70">(489 değerlendirme)</span>
              </div>
            </div>
            <h1 className="text-white mb-4 text-4xl md:text-5xl">Umre Seyahatleri</h1>
            <p className="text-emerald-100 text-lg max-w-2xl">
              Farklı süre ve bütçe seçenekleriyle manevi yolculuğunuzu planlayın
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-4">Umre Seyahatleri Hakkında</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sefernur olarak, yıl boyunca farklı süre ve bütçe seçenekleriyle umre seyahatleri 
                  düzenliyoruz. Her seviyeden misafirimize uygun paketlerimiz ile kutsal topraklara 
                  konforlu ve huzurlu bir yolculuk yapmanızı sağlıyoruz.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Umre paketlerimiz, ekonomik seçeneklerden lüks konsepte kadar geniş bir yelpazede 
                  sunulmaktadır. 7 günden 14 güne kadar değişen süreler ve esnek tarih seçenekleri 
                  ile programınıza en uygun paketi seçebilirsiniz.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Profesyonel rehber kadromuz, kaliteli otellerimiz ve 7/24 destek hizmetimiz ile 
                  umre yolculuğunuz her açıdan güvende ve konforlu olacaktır.
                </p>
              </div>

              {/* Packages Comparison */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Paket Seçeneklerimiz</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {packages.map((pkg, idx) => (
                    <div 
                      key={idx}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-gray-900 mb-3">{pkg.name}</h3>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Star className="w-4 h-4 text-emerald-600" />
                          <span>{pkg.hotel}</span>
                        </div>
                      </div>
                      <div className="text-emerald-700 mb-3">{pkg.price}</div>
                      <Button 
                        onClick={() => navigate('/umre-paketleri')}
                        size="sm"
                        className="w-full bg-emerald-700 hover:bg-emerald-800"
                      >
                        İncele
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => navigate('/umre-paketleri')}
                    className="bg-emerald-700 hover:bg-emerald-800"
                  >
                    Tüm Paketleri Görüntüle
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Hizmet Özellikleri</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tour Program */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Ziyaret Programı</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {tourProgram.map((section, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-gray-900 mb-4">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                            <span className="text-emerald-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Genel Olarak Pakete Dahil Olanlar</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Gidiş-Dönüş Uçak Bileti',
                    'Vize İşlemleri',
                    'Otel Konaklaması',
                    'Havalimanı Transferleri',
                    'Türkçe Rehberlik',
                    'Seyahat Sigortası',
                    'Ziyaret Turları',
                    '7/24 Destek Hattı'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  * Detaylar paketten pakete değişiklik gösterebilir. Lütfen paket detaylarını inceleyin.
                </p>
              </div>

              {/* Why Choose Us */}
              <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-8 text-white">
                <h2 className="text-white mb-6">Neden Sefernur Umre?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1">Güvenli ve Lisanslı</h4>
                      <p className="text-emerald-100 text-sm">TÜRSAB belgeli, 20+ yıllık tecrübe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1">Esnek Programlar</h4>
                      <p className="text-emerald-100 text-sm">Size uygun tarih ve süre seçenekleri</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Plane className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1">Kaliteli Ulaşım</h4>
                      <p className="text-emerald-100 text-sm">Türk Havayolları ile konforlu yolculuk</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1">Yüksek Memnuniyet</h4>
                      <p className="text-emerald-100 text-sm">4.7/5 müşteri memnuniyeti</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Sıkça Sorulan Sorular</h2>
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-gray-900 mb-2">Umre vizesi nasıl alınır?</h4>
                    <p className="text-gray-600 text-sm">
                      Umre vizesi için gerekli evrakları tarafımıza iletmeniz yeterlidir. 
                      Vize başvuru sürecinizi baştan sona biz yönetiyoruz.
                    </p>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-gray-900 mb-2">Hangi aylar umre için uygundur?</h4>
                    <p className="text-gray-600 text-sm">
                      Yıl boyunca umre yapılabilir. Ancak Ramazan ayı ve özel günler daha fazla 
                      tercih edilmektedir. Fiyatlar mevsimlere göre değişiklik gösterebilir.
                    </p>
                  </div>
                  <div className="pb-4">
                    <h4 className="text-gray-900 mb-2">Tek başıma umreye gidebilir miyim?</h4>
                    <p className="text-gray-600 text-sm">
                      Evet, bireysel umre paketlerimiz mevcuttur. Ayrıca gruplarımıza dahil olarak 
                      da yolculuğunuzu gerçekleştirebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Contact Card */}
                <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-8 text-white">
                  <h3 className="text-white mb-6">Bilgi ve Rezervasyon</h3>
                  
                  <div className="space-y-3 mb-6">
                    <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 h-12">
                      <Phone className="w-5 h-5 mr-2" />
                      +90 (212) 555 0000
                    </Button>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-12">
                      <Mail className="w-5 h-5 mr-2" />
                      Bilgi Talep Et
                    </Button>
                    <Button 
                      onClick={() => navigate('/umre-paketleri')}
                      className="w-full bg-white text-emerald-700 hover:bg-emerald-50 h-12"
                    >
                      Paketleri İncele
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm border-t border-white/20 pt-6">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>TÜRSAB lisanslı</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>7/24 destek hattı</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Ücretsiz danışmanlık</span>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4">Fiyat Aralığı</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Ekonomik</span>
                      <span className="text-emerald-700">₺45,000</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Standart</span>
                      <span className="text-emerald-700">₺65,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Lüks</span>
                      <span className="text-emerald-700">₺95,000+</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">
                    * Fiyatlar kişi başı başlangıç fiyatlarıdır ve değişiklik gösterebilir.
                  </p>
                </div>

                {/* Quick Facts */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                  <h3 className="text-gray-900 mb-4">Hızlı Bilgiler</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Tüm paketlerde vize dahil</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Türk Havayolları güvencesi</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Profesyonel Türkçe rehber</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Seyahat sigortası dahil</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
