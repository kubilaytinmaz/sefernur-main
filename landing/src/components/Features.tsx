import { Hotel, Car, Users, FileCheck, MapPin, Plane } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const features = [
  {
    icon: Hotel,
    title: 'Otel Rezervasyonu',
    description: 'Mekke ve Medine\'deki seçkin otelleri karşılaştırın ve güvenle rezervasyon yapın.',
    color: 'from-emerald-500 to-emerald-700'
  },
  {
    icon: FileCheck,
    title: 'Online Vize İşlemleri',
    description: '4 basit adımda vize başvurunuzu tamamlayın ve sürecini takip edin.',
    color: 'from-teal-500 to-teal-700'
  },
  {
    icon: Users,
    title: 'Profesyonel Rehberlik',
    description: 'Deneyimli ve sertifikalı rehberlerle manevi yolculuğunuzu tamamlayın.',
    color: 'from-cyan-500 to-cyan-700'
  },
  {
    icon: Car,
    title: 'Transfer & Araç Kiralama',
    description: 'Konforlu transfer hizmetleri ve özel araç kiralama seçenekleri.',
    color: 'from-emerald-600 to-emerald-800'
  },
  {
    icon: Plane,
    title: 'Umre & Hac Paketleri',
    description: 'Farklı süre ve bütçelere uygun hazır tur paketleri.',
    color: 'from-green-500 to-green-700'
  },
  {
    icon: MapPin,
    title: 'Gezilecek Yerler',
    description: 'Kutsal topraklardaki önemli mekanlar için detaylı rehber.',
    color: 'from-lime-600 to-lime-800'
  }
];

export function Features() {
  return (
    <section id="ozellikler" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <span className="text-emerald-700">Özellikler</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
            Her İhtiyacınız İçin Çözüm
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hac ve Umre yolculuğunuz için ihtiyaç duyduğunuz tüm hizmetleri 
            tek platformda toplayan kapsamlı özellikleri keşfedin.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
