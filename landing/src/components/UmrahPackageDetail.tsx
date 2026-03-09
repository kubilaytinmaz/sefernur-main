import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { umrahPackages } from './UmrahPackages';
import { 
  Calendar, Users, Star, ArrowLeft, Check, X, 
  Plane, Hotel, Bus, Utensils, MapPin, Shield,
  Clock, Phone, Mail
} from 'lucide-react';

export function UmrahPackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = umrahPackages.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-4">Paket bulunamadı</h2>
          <Button onClick={() => navigate('/umre-paketleri')}>
            Paketlere Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Button
              onClick={() => navigate('/umre-paketleri')}
              variant="outline"
              className="mb-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Paketlere Dön
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full">
                {pkg.category}
              </span>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{pkg.rating}</span>
                <span className="text-white/70">({pkg.reviewCount} değerlendirme)</span>
              </div>
            </div>
            <h1 className="text-white mb-4 text-4xl md:text-5xl">{pkg.name}</h1>
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{pkg.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Kişi Başı {pkg.price}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-4">Paket Hakkında</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{pkg.description}</p>
                <p className="text-gray-600 leading-relaxed">
                  Bu paket, manevi yolculuğunuzu en iyi şekilde deneyimlemeniz için özenle hazırlanmıştır. 
                  Konforlu konaklama, güvenli ulaşım ve profesyonel rehberlik hizmetleri ile unutulmaz bir 
                  umre deneyimi yaşayacaksınız.
                </p>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Paket Özellikleri</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotels */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Konaklama Detayları</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Hotel className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">Mekke Konaklaması</h3>
                      <p className="text-gray-600">{pkg.hotels.mecca}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Hotel className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">Medine Konaklaması</h3>
                      <p className="text-gray-600">{pkg.hotels.medina}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Pakete Dahil Olanlar</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {pkg.included.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Not Included */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Pakete Dahil Olmayanlar</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {pkg.notIncluded.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Itinerary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-gray-900 mb-6">Örnek Program</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        1
                      </div>
                      <div className="w-0.5 h-full bg-emerald-200 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h4 className="text-gray-900 mb-2">Gün 1-2: Türkiye - Medine</h4>
                      <p className="text-gray-600">Havalimanı buluşma, uçuş ve Medine'ye varış. Otel yerleşimi ve dinlenme.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        2
                      </div>
                      <div className="w-0.5 h-full bg-emerald-200 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h4 className="text-gray-900 mb-2">Gün 3-5: Medine Ziyaretleri</h4>
                      <p className="text-gray-600">Mescid-i Nebevi ziyareti, Ravza-i Mutahhara ziyareti, tarihi mekanlar turu.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        3
                      </div>
                      <div className="w-0.5 h-full bg-emerald-200 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h4 className="text-gray-900 mb-2">Gün 6-8: Mekke ve Umre İbadeti</h4>
                      <p className="text-gray-600">Mekke'ye hareket, umre ibadeti, Kabe ziyareti ve ibadet vakitleri.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        4
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-2">Son Gün: Dönüş</h4>
                      <p className="text-gray-600">Son ziyaretler, alışveriş ve Türkiye'ye dönüş.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Price Card */}
                <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-8 text-white">
                  <div className="text-center mb-6">
                    <div className="text-emerald-200 mb-2">Kişi Başı Fiyat</div>
                    <div className="text-4xl mb-4">{pkg.price}</div>
                    <p className="text-emerald-100 text-sm">
                      Taksit seçenekleri mevcuttur
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 h-12">
                      <Phone className="w-5 h-5 mr-2" />
                      Hemen Ara
                    </Button>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-12">
                      <Mail className="w-5 h-5 mr-2" />
                      Bilgi Al
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Güvenli ödeme</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>24 saat içinde onay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>7/24 destek hattı</span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4">Önemli Bilgiler</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-gray-900 mb-1">Kalkış Noktası</div>
                        <div className="text-gray-600">İstanbul, Ankara, İzmir</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-gray-900 mb-1">Uygun Tarihler</div>
                        <div className="text-gray-600">Yıl boyunca düzenli kalkışlar</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-gray-900 mb-1">Grup Büyüklüğü</div>
                        <div className="text-gray-600">Min 20 - Max 45 kişi</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                  <h3 className="text-gray-900 mb-4">İletişim</h3>
                  <div className="space-y-3 text-sm">
                    <a href="tel:+902125550000" className="flex items-center gap-3 text-gray-700 hover:text-emerald-700">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>+90 (212) 555 0000</span>
                    </a>
                    <a href="https://wa.me/905335550000" className="flex items-center gap-3 text-gray-700 hover:text-emerald-700">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Destek</span>
                    </a>
                    <a href="mailto:info@sefernur.com" className="flex items-center gap-3 text-gray-700 hover:text-emerald-700">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>info@sefernur.com</span>
                    </a>
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
