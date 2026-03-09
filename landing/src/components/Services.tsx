import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    title: 'Hac Organizasyonu',
    description: 'Eksiksiz Hac paketleri, konaklama, ulaşım ve rehberlik hizmetleri ile manevi yolculuğunuz için her şey hazır.',
    image: 'https://images.unsplash.com/photo-1704104501136-8f35402af395?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYWFiYSUyMG1lY2NhJTIwaXNsYW1pY3xlbnwxfHx8fDE3NjA2MTYzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    highlights: ['Lüks Konaklama', 'Özel Transfer', 'Uzman Rehberlik'],
    link: '/hac-organizasyonu'
  },
  {
    title: 'Umre Seyahatleri',
    description: 'Farklı süre ve bütçe seçenekleri ile size özel Umre paketleri. Konforlu ve huzurlu bir ibadeti deneyimleyin.',
    image: 'https://images.unsplash.com/photo-1759568950656-4d2e3006f837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNsaW0lMjBwcmF5ZXIlMjBzcGlyaXR1YWx8ZW58MXx8fHwxNzYwNjE2MzU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    highlights: ['Ekonomik Paketler', 'Esnek Tarihler', '7/24 Destek'],
    link: '/umre-seyahatleri'
  }
];

export function Services() {
  const navigate = useNavigate();
  
  return (
    <section id="hizmetler" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <span className="text-emerald-700">Hizmetlerimiz</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
            Size Özel Hac & Umre Paketleri
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Her bütçeye ve ihtiyaca uygun, kapsamlı paketlerimizle 
            kutsal topraklara güvenle yolculuk edin.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h3 className="absolute bottom-6 left-6 text-white">{service.title}</h3>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.highlights.map((highlight, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <Button 
                  onClick={() => navigate(service.link)}
                  variant="outline" 
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 group"
                >
                  Detayları İncele
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
