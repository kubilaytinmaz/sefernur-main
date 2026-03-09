import { Button } from './ui/button';
import { Check, Download, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();
  
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-800 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full border border-emerald-200">
              <Star className="w-4 h-4 text-emerald-700 fill-emerald-700" />
              <span className="text-emerald-800">Türkiye'nin En Güvenilir Hac & Umre Platformu</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900">
                Kutsal Yolculuğunuz
                <span className="block text-emerald-700">Artık Daha Kolay</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                Hac ve Umre seyahatinizi planlamak için ihtiyacınız olan her şey tek bir uygulamada. 
                Otel rezervasyonundan vize başvurusuna kadar tüm süreç yanınızdayız.
              </p>
            </div>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Güvenilir Otel Rezervasyonu',
                'Online Vize Başvurusu',
                'Profesyonel Rehber Hizmeti',
                'Transfer & Araç Kiralama'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-emerald-700 hover:bg-emerald-800 h-12 px-8">
                <Download className="w-5 h-5 mr-2" />
                Ücretsiz İndirin
              </Button>
              <Button 
                onClick={() => navigate('/umre-paketleri')}
                variant="outline" 
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-12 px-8"
              >
                Umre Paketlerini İnceleyin
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-emerald-700">10,000+</div>
                <div className="text-gray-600">Mutlu Misafir</div>
              </div>
              <div>
                <div className="text-emerald-700">4.8/5</div>
                <div className="text-gray-600">Kullanıcı Puanı</div>
              </div>
              <div>
                <div className="text-emerald-700">50+</div>
                <div className="text-gray-600">Partner Otel</div>
              </div>
            </div>
          </div>

          {/* Right Content - App Mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Floating Cards */}
              <div className="absolute -top-8 -left-8 bg-white p-4 rounded-2xl shadow-xl z-10 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    🕌
                  </div>
                  <div>
                    <div className="text-gray-900">Mekke Otelleri</div>
                    <div className="text-gray-500">200+ Seçenek</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 bg-white p-4 rounded-2xl shadow-xl z-10 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    ✅
                  </div>
                  <div>
                    <div className="text-gray-900">Kolay Vize</div>
                    <div className="text-gray-500">4 Adımda Tamamla</div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1644794472051-36d154dfe487?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBwaG9uZSUyMG1vY2t1cHxlbnwxfHx8fDE3NjA1OTgzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Sefernur Uygulaması"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </section>
  );
}
