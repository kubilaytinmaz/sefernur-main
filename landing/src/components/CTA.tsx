import { Button } from './ui/button';
import { Download, Smartphone } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-8">
            <Smartphone className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-6">
            Kutsal Yolculuğunuza Bugün Başlayın
          </h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Sefernur uygulamasını ücretsiz indirin ve Hac & Umre seyahatinizi 
            planlamaya hemen başlayın. Tüm ihtiyaçlarınız artık cebinizde!
          </p>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              className="bg-white text-emerald-800 hover:bg-emerald-50 h-14 px-8"
            >
              <Download className="w-5 h-5 mr-2" />
              App Store'dan İndir
            </Button>
            <Button 
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-800 h-14 px-8 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Google Play'den İndir
            </Button>
          </div>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-6 text-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
              <span>Ücretsiz İndirme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
              <span>Kolay Kullanım</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
              <span>7/24 Destek</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
