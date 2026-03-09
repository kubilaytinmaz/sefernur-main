import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, Users, Star, ArrowRight, Plane, Hotel, Utensils, Bus } from 'lucide-react';

export const umrahPackages = [
  {
    id: 'ekonomik-umre',
    name: 'Ekonomik Umre Paketi',
    duration: '7 Gün',
    price: '₺45,000',
    rating: 4.5,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Ekonomik',
    description: 'Bütçe dostu fiyatlarla manevi yolculuğunuzu gerçekleştirin.',
    features: [
      '3* Otel Konaklaması',
      'Türk Havayolları ile Uçak Bileti',
      'Havalimanı Transferleri',
      'Türkçe Rehberlik Hizmeti',
      'Yarım Pansiyon Konaklama',
      'Vize İşlemleri Dahil'
    ],
    hotels: {
      mecca: '3* Otel - Hareme 800m',
      medina: '3* Otel - Mescidi Nebeviye 1km'
    },
    included: ['Uçak Bileti', 'Vize', 'Transfer', 'Otel', 'Rehber'],
    notIncluded: ['Öğle ve Akşam Yemekleri', 'Kişisel Harcamalar', 'Sigorta']
  },
  {
    id: 'standart-umre',
    name: 'Standart Umre Paketi',
    duration: '10 Gün',
    price: '₺65,000',
    rating: 4.7,
    reviewCount: 489,
    image: 'https://images.unsplash.com/photo-1564769610726-5c4c90f99c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Standart',
    description: 'Konfor ve ekonominin dengeli birleşimi ile ideal bir umre deneyimi.',
    features: [
      '4* Otel Konaklaması',
      'Türk Havayolları ile Uçak Bileti',
      'VIP Havalimanı Transferleri',
      'Profesyonel Türkçe Rehberlik',
      'Tam Pansiyon Konaklama',
      'Vize + Sigorta Dahil',
      'Ziyaret Turları'
    ],
    hotels: {
      mecca: '4* Otel - Hareme 500m',
      medina: '4* Otel - Mescidi Nebeviye 600m'
    },
    included: ['Uçak Bileti', 'Vize', 'Transfer', 'Otel', 'Rehber', 'Yemekler', 'Sigorta', 'Turlar'],
    notIncluded: ['Kişisel Harcamalar', 'Ekstra Turlar']
  },
  {
    id: 'lux-umre',
    name: 'Lüks Umre Paketi',
    duration: '14 Gün',
    price: '₺95,000',
    rating: 4.9,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Lüks',
    description: 'En üst düzey konfor ve hizmet kalitesiyle unutulmaz bir manevi yolculuk.',
    features: [
      '5* Lüks Otel Konaklaması',
      'Business Class Uçak Bileti',
      'Özel VIP Transfer Araçları',
      'Kişisel Rehber Hizmeti',
      'Ultra Her Şey Dahil',
      'Premium Sigorta Paketi',
      'Özel Ziyaret Programı',
      'SPA & Wellness'
    ],
    hotels: {
      mecca: '5* Lüks Otel - Harem Manzaralı - Hareme 200m',
      medina: '5* Lüks Otel - Mescid Manzaralı - Mescidi Nebeviye 300m'
    },
    included: ['Business Class Uçak', 'Vize', 'VIP Transfer', 'Lüks Otel', 'Kişisel Rehber', 'Her Şey Dahil', 'Premium Sigorta', 'Özel Turlar', 'SPA'],
    notIncluded: ['Kişisel Harcamalar']
  },
  {
    id: 'ramazan-umre',
    name: 'Ramazan Umresi Özel',
    duration: '15 Gün',
    price: '₺85,000',
    rating: 4.8,
    reviewCount: 567,
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Özel',
    description: 'Ramazan ayının bereketinde, iftar ve sahur dahil özel umre programı.',
    features: [
      '4* Otel Konaklaması',
      'Türk Havayolları ile Uçak Bileti',
      'Özel İftar & Sahur Menüleri',
      'Teravih Namazı Programı',
      'Mukabele Dinleme İmkanı',
      'Ramazan Özel Ziyaretler',
      'Vize + Sigorta Dahil'
    ],
    hotels: {
      mecca: '4* Otel - Hareme 400m',
      medina: '4* Otel - Mescidi Nebeviye 500m'
    },
    included: ['Uçak Bileti', 'Vize', 'Transfer', 'Otel', 'Rehber', 'İftar & Sahur', 'Sigorta', 'Özel Program'],
    notIncluded: ['Kişisel Harcamalar']
  },
  {
    id: 'aileler-umre',
    name: 'Aileler İçin Umre',
    duration: '12 Gün',
    price: '₺55,000',
    rating: 4.6,
    reviewCount: 428,
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Aile',
    description: 'Çocuklu aileler için özel düzenlenmiş, rahat ve konforlu umre paketi.',
    features: [
      '4* Aile Odaları',
      'Çocuk Dostu Otel',
      'Oyun Alanları',
      'Çocuk Menüleri',
      'Esnek Program',
      'Bebek Bakım İmkanları',
      'Aile Rehberi'
    ],
    hotels: {
      mecca: '4* Aile Oteli - Hareme 600m',
      medina: '4* Aile Oteli - Mescidi Nebeviye 700m'
    },
    included: ['Uçak Bileti', 'Vize', 'Transfer', 'Otel', 'Rehber', 'Yemekler', 'Sigorta', 'Çocuk Hizmetleri'],
    notIncluded: ['Kişisel Harcamalar', 'Ek Çocuk Aktiviteleri']
  },
  {
    id: 'express-umre',
    name: 'Express Umre',
    duration: '5 Gün',
    price: '₺38,000',
    rating: 4.4,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1678466808189-451f989f340b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Hızlı',
    description: 'Yoğun iş temposunda olanlar için kısa süreli, yoğun program umre paketi.',
    features: [
      '3* Otel Konaklaması',
      'Direkt Uçuşlar',
      'Hızlı Check-in',
      'Yoğunlaştırılmış Program',
      'Express Transfer',
      'Temel Ziyaretler'
    ],
    hotels: {
      mecca: '3* Otel - Hareme 500m',
      medina: '3* Otel - Mescidi Nebeviye 600m'
    },
    included: ['Uçak Bileti', 'Vize', 'Express Transfer', 'Otel', 'Rehber'],
    notIncluded: ['Yemekler', 'Sigorta', 'Ekstra Turlar', 'Kişisel Harcamalar']
  }
];

export function UmrahPackages() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Plane className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center mb-4 text-white text-4xl md:text-5xl">
            Umre Paketlerimiz
          </h1>
          <p className="text-center text-emerald-100 text-lg max-w-2xl mx-auto">
            İhtiyacınıza ve bütçenize uygun umre paketlerimiz ile manevi yolculuğunuza başlayın. Her paket, deneyimli rehberlik ve konforlu konaklama ile hazırlanmıştır.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {umrahPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full">
                    {pkg.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-gray-900 mb-2">{pkg.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-700 ml-1">{pkg.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({pkg.reviewCount} değerlendirme)</span>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">{pkg.description}</p>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Kişi Başı</span>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="mb-4 space-y-2">
                    {pkg.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-gray-500 text-sm">Başlangıç fiyatı</div>
                        <div className="text-emerald-700">{pkg.price}</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/umre-paketleri/${pkg.id}`)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800"
                    >
                      Detayları İncele
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-gray-900 mb-2">Güvenli Ulaşım</h4>
              <p className="text-gray-600 text-sm">Türk Havayolları ile konforlu yolculuk</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-gray-900 mb-2">Konforlu Konaklama</h4>
              <p className="text-gray-600 text-sm">Hareme yakın kaliteli oteller</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-gray-900 mb-2">Lezzetli Yemekler</h4>
              <p className="text-gray-600 text-sm">Türk damak tadına uygun menüler</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-gray-900 mb-2">Transfer Hizmeti</h4>
              <p className="text-gray-600 text-sm">Havalimanı ve otel transferleri</p>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center pt-12">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
