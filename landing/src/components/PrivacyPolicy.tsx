import { Shield, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center mb-4 text-white text-4xl md:text-5xl">
            Gizlilik Politikası
          </h1>
          <p className="text-center text-emerald-100 text-lg max-w-2xl mx-auto">
            Sefernur olarak kişisel verilerinizin güvenliğini en yüksek öncelik olarak görüyoruz. Bu sayfada hangi verileri topladığımızı, nasıl işlediğimizi ve haklarınızı sade ve anlaşılır şekilde bulabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm text-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Son güncelleme: 14 Kasım 2025</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-emerald-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:kvkk@sefernur.com" className="hover:text-white transition-colors">
                kvkk@sefernur.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Giriş */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">Giriş</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu politika, Sefernur mobil uygulamasında işlenen tüm kişisel veriler için geçerlidir. Uygulamayı kullanarak; bu sayfada açıklanan esaslara uygun veri işleme faaliyetlerini kabul etmiş olursunuz.
            </p>
          </div>

          {/* Toplanan Veriler */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">Toplanan Veriler</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Uygulamayı kullanırken aşağıdaki kategorilerde veri işleyebiliriz:
            </p>
            <div className="space-y-4">
              <DataItem
                title="Kimlik bilgileri"
                description="Ad, soyad, doğum tarihi, T.C. kimlik numarası (vize işlemleri için)."
              />
              <DataItem
                title="İletişim bilgileri"
                description="E-posta, telefon numarası, adres bilgileri."
              />
              <DataItem
                title="Finansal veriler"
                description="Ödeme işlemlerine ilişkin sınırlı bilgiler (ödeme sağlayıcıları üzerinden)."
              />
              <DataItem
                title="Kullanım verileri"
                description="Uygulama içi hareketleriniz, tercih ve ayarlarınız."
              />
              <DataItem
                title="Cihaz bilgileri"
                description="IP adresi, cihaz modeli, işletim sistemi, uygulama sürümü."
              />
            </div>
          </div>

          {/* Verilerin Kullanım Amaçları */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">Verilerin Kullanım Amaçları</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Toplanan veriler aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="space-y-3">
              <PurposeItem text="Hac ve Umre rezervasyonlarını oluşturmak, yönetmek ve size bildirim göndermek." />
              <PurposeItem text="Vize süreçlerinizi yürütmek ve gerekli resmi bilgileri sağlamak." />
              <PurposeItem text="Ödeme ve faturalama işlemlerini gerçekleştirmek." />
              <PurposeItem text="Müşteri destek taleplerinizi yanıtlamak." />
              <PurposeItem text="Uygulama performansını ve kullanıcı deneyimini iyileştirmek." />
            </ul>
          </div>

          {/* Veri Güvenliği */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">Veri Güvenliği</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Verilerinizin güvenliği için teknik ve idari tedbirler alıyoruz:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <SecurityFeature
                title="SSL/TLS Şifreleme"
                description="İletim sırasında SSL/TLS ile şifreleme."
              />
              <SecurityFeature
                title="Firebase Güvenlik"
                description="Firebase kimlik doğrulama ve güvenlik kuralları."
              />
              <SecurityFeature
                title="Erişim Kontrolü"
                description="Yetkisiz erişime karşı roller ve erişim kontrolleri."
              />
              <SecurityFeature
                title="Güvenli Ödeme"
                description="Ödeme bilgilerinin yalnızca lisanslı ödeme kuruluşları üzerinden işlenmesi."
              />
            </div>
          </div>

          {/* Kullanıcı Hakları */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">Kullanıcı Haklarınız (KVKK)</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-3">
              <RightItem text="Kişisel verilerinizin işlenip işlenmediğini öğrenme ve bilgi talep etme." />
              <RightItem text="Eksik veya hatalı işlenen verilerin düzeltilmesini isteme." />
              <RightItem text="Verilerinizin silinmesini veya anonim hale getirilmesini talep etme." />
              <RightItem text="Otomatik işleme sonuçlarına itiraz etme." />
            </div>
          </div>

          {/* Veri Sorumlusu ve İletişim */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-6 text-3xl">Veri Sorumlusu ve İletişim</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Kişisel verilerinizle ilgili her türlü talep ve sorunuz için bizimle aşağıdaki kanallardan iletişime geçebilirsiniz:
            </p>
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <ContactInfo
                  icon={<Mail className="w-6 h-6" />}
                  label="E-posta"
                  value="kvkk@sefernur.com"
                  href="mailto:kvkk@sefernur.com"
                />
                <ContactInfo
                  icon={<Phone className="w-6 h-6" />}
                  label="Telefon"
                  value="+90 (212) 555 0000"
                  href="tel:+902125550000"
                />
                <ContactInfo
                  icon={<MapPin className="w-6 h-6" />}
                  label="Adres"
                  value="İstanbul, Türkiye"
                />
              </div>
              <div className="mt-6 pt-6 border-t border-emerald-600">
                <p className="text-emerald-100 text-sm">
                  Başvurularınız KVKK kapsamında en geç 30 gün içinde yanıtlanacaktır.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center pt-8">
            <Button
              onClick={() => navigate('/')}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function DataItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-shrink-0 w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
      <div>
        <h4 className="text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}

function PurposeItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-gray-700">
      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}

function SecurityFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-emerald-600" />
        <h4 className="text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function RightItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
      <p className="text-emerald-900">{text}</p>
    </div>
  );
}

function ContactInfo({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-emerald-200 text-sm mb-1">{label}</div>
      <div className="text-white">{value}</div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
