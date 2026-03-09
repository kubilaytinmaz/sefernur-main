import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowLeft, Check, Star, Calendar, Users, Plane, Hotel, 
  Bus, Shield, Clock, Phone, Mail, MapPin, Award
} from 'lucide-react';

export function HajjDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    'Lüks 5 Yıldızlı Otel Konaklaması',
    'Business Class Uçak Bileti Seçeneği',
    'Profesyonel Türkçe Rehberlik',
    'VIP Transfer Hizmetleri',
    'Her Şey Dahil Konsept',
    'Premium Sigorta Paketi',
    'Özel Hac Eğitimi',
    'Kurbanlık Organizasyonu',
    'Arafat Günü Özel Program',
    'Mina Çadır Hizmeti',
    'Sağlık Hizmetleri 7/24',
    'Ziyaret Turları'
  ];

  const included = [
    'Gidiş-Dönüş Uçak Bileti',
    'Vize İşlemleri',
    'Otel Konaklaması (Mekke & Medine)',
    'Çadır Hizmeti (Mina)',
    'Tüm Transferler',
    'Türkçe Rehberlik',
    'Öğün Planları',
    'Seyahat Sigortası',
    'Kurban Organizasyonu',
    'Hac Eğitimi'
  ];

  const itinerary = [
    {
      day: '1-3',
      title: 'Türkiye - Medine - İlk Ziyaretler',
      description: 'İstanbul\'dan hareket, Medine\'ye varış, otel yerleşimi ve Mescid-i Nebevi ziyareti.'
    },
    {
      day: '4-6',
      title: 'Medine Ziyaretleri',
      description: 'Ravza-i Mutahhara, Uhud, Kuba Mescidi ve diğer tarihi mekanların ziyareti.'
    },
    {
      day: '7-8',
      title: 'Mekke\'ye Hareket ve İhram',
      description: 'Medine\'den Mekke\'ye hareket, otel yerleşimi, ihrama giriş hazırlıkları.'
    },
    {
      day: '9',
      title: 'Arafat Vakfesi',
      description: 'Haccın en önemli günü. Arafat\'ta vakfe, Müzdelife\'ye hareket.'
    },
    {
      day: '10',
      title: 'Kurban Bayramı - Şeytan Taşlama',
      description: 'Mina\'da şeytan taşlama, kurban kesimi, ihramdan çıkış.'
    },
    {
      day: '11-13',
      title: 'Teşrik Günleri',
      description: 'Mina\'da konaklama, şeytan taşlama, tavaf ve ibadetler.'
    },
    {
      day: '14-16',
      title: 'Mekke\'de İbadet',
      description: 'Kabe ziyaretleri, ibadetler, son tavaf ve alışveriş.'
    },
    {
      day: '17',
      title: 'Dönüş',
      description: 'Veda tavafı ve Türkiye\'ye dönüş.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1704104501136-8f35402af395?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Hac Organizasyonu"
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
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full">
                Premium Hizmet
              </span>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">4.9</span>
                <span className="text-white/70">(456 değerlendirme)</span>
              </div>
            </div>
            <h1 className="text-white mb-4 text-4xl md:text-5xl">Hac Organizasyonu</h1>
            <p className="text-emerald-100 text-lg max-w-2xl">
              Hayatınızın en önemli manevi yolculuğu için eksiksiz hizmet ve konfor
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
                <h2 className="text-gray-900 mb-4">Hizmet Hakkında</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sefernur olarak, müslümanların hayatında bir kez gerçekleştirmesi farz olan Hac ibadeti için 
                  en kaliteli ve konforlu hizmeti sunuyoruz. Yılların deneyimi ve profesyonel kadromuz ile 
                  hac yolculuğunuzu unutulmaz bir deneyime dönüştürüyoruz.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Hac paketlerimiz, uçak biletinden konaklama, transferlerden rehberlik hizmetlerine kadar 
                  tüm detayları kapsayan komple bir çözüm sunmaktadır. Hacc süresince yanınızda olan 
                  deneyimli rehberlerimiz, ibadetlerinizi eksiksiz yapmanız için size destek olacaktır.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Diyanet onaylı programlarımız, lüks konaklama seçenekleri ve özel hizmetlerimiz ile 
                  manevi yolculuğunuz her açıdan eksiksiz olacaktır.
                </p>
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

              {/* Accommodation */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Konaklama Detayları</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Hotel className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-2">Mekke Konaklaması</h3>
                        <p className="text-gray-600 mb-2">5 Yıldızlı Lüks Otel - Hareme 150m mesafede</p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Harem manzaralı odalar</li>
                          <li>• Klimalı ve konforlu odalar</li>
                          <li>• Kahvaltı büfesi</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Hotel className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-2">Medine Konaklaması</h3>
                        <p className="text-gray-600 mb-2">5 Yıldızlı Lüks Otel - Mescid-i Nebeviye 200m</p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Mescid manzaralı odalar</li>
                          <li>• Modern otel imkanları</li>
                          <li>• Tam donanımlı odalar</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-2">Mina Çadır Hizmeti</h3>
                        <p className="text-gray-600 mb-2">VIP Kategori Çadır - Klimalı ve Tam Donanımlı</p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Klimatik sistem</li>
                          <li>• Rahat ranzalar</li>
                          <li>• Ücretsiz yemek servisi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Pakete Dahil Olanlar</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {included.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Program Akışı</h2>
                <div className="space-y-4">
                  {itinerary.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0 text-sm">
                          {item.day}
                        </div>
                        {idx !== itinerary.length - 1 && (
                          <div className="w-0.5 h-full bg-emerald-200 mt-2"></div>
                        )}
                      </div>
                      <div className={idx !== itinerary.length - 1 ? 'pb-6' : ''}>
                        <h4 className="text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8">
                <h2 className="text-gray-900 mb-4">Önemli Notlar</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Hac vizesi için başvurular Diyanet İşleri Başkanlığı üzerinden yapılmaktadır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Kontenjanlar sınırlı olduğundan erken rezervasyon önerilir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Hac öncesi eğitim programlarımıza katılım zorunludur.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Sağlık kontrolü ve aşı belgeleri gereklidir.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Price Card */}
                <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-8 text-white">
                  <div className="text-center mb-6">
                    <div className="text-emerald-200 mb-2">Başlangıç Fiyatı</div>
                    <div className="text-4xl mb-2">₺120,000</div>
                    <p className="text-emerald-100 text-sm">
                      Kişi başı - Taksit imkanı mevcut
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 h-12">
                      <Phone className="w-5 h-5 mr-2" />
                      +90 (212) 555 0000
                    </Button>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-12">
                      <Mail className="w-5 h-5 mr-2" />
                      Bilgi Talep Et
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Diyanet onaylı program</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>20+ yıl tecrübe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>TÜRSAB lisanslı</span>
                    </div>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4">Hizmet Bilgileri</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-gray-900 mb-1">Süre</div>
                        <div className="text-gray-600">17 Gün / 16 Gece</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-gray-900 mb-1">Kalkış</div>
                        <div className="text-gray-600">İstanbul, Ankara, İzmir</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-gray-900 mb-1">Grup</div>
                        <div className="text-gray-600">Min 30 - Max 50 kişi</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                  <h3 className="text-gray-900 mb-4">Neden Sefernur?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">20+ yıllık tecrübe</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">Profesyonel rehber kadrosu</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">5 yıldızlı otel garantisi</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">7/24 destek hizmeti</span>
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
