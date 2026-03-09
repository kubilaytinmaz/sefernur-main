import { Download, Search, CreditCard, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Download,
    number: '01',
    title: 'Uygulamayı İndirin',
    description: 'App Store veya Google Play\'den Sefernur\'u ücretsiz indirin ve hesabınızı oluşturun.'
  },
  {
    icon: Search,
    number: '02',
    title: 'İhtiyaçlarınızı Seçin',
    description: 'Otel, transfer, rehber veya hazır tur paketlerini inceleyin ve karşılaştırın.'
  },
  {
    icon: CreditCard,
    number: '03',
    title: 'Güvenle Rezervasyon Yapın',
    description: 'Tercih ettiğiniz hizmetleri seçin ve güvenli ödeme sistemi ile rezervasyonunuzu tamamlayın.'
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Yolculuğunuzun Keyfini Çıkarın',
    description: 'Tüm detaylar sizin için hazır. Sadece manevi yolculuğunuza odaklanın.'
  }
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <span className="text-emerald-700">Nasıl Çalışır</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
            4 Basit Adımda Başlayın
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sefernur ile kutsal topraklara yolculuğunuzu planlamak ve 
            rezervasyon yapmak çok kolay ve güvenli.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Behind all steps */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-300 via-emerald-300 to-emerald-300">
            <div className="absolute inset-0 left-[12.5%] right-[12.5%]"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 text-center">
                {/* Icon Circle */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full mb-4 shadow-lg">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                
                {/* Step Number */}
                <div className="text-emerald-200 mb-2 opacity-50">{step.number}</div>
                
                {/* Content */}
                <h3 className="text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
