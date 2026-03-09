import { FileText, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function TermsOfService() {
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
              <FileText className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center mb-4 text-white text-4xl md:text-5xl">
            Kullanım Koşulları
          </h1>
          <p className="text-center text-emerald-100 text-lg max-w-2xl mx-auto">
            Sefernur mobil uygulamasını kullanmadan önce lütfen bu kullanım koşullarını dikkatlice okuyunuz. Uygulamayı kullanarak bu koşulları kabul etmiş sayılırsınız.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm text-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Son güncelleme: 14 Kasım 2025</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-emerald-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:info@sefernur.com" className="hover:text-white transition-colors">
                info@sefernur.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Genel Hükümler */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">1. Genel Hükümler</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sefernur, Hac ve Umre seyahatleri için kapsamlı hizmetler sunan bir mobil uygulamadır. Uygulama üzerinden otel rezervasyonu, araç kiralama, transfer hizmetleri, rehberlik, vize işlemleri ve daha fazla hizmete erişebilirsiniz.
              </p>
              <p>
                Bu kullanım koşulları, Sefernur uygulamasını kullanan tüm bireyler için bağlayıcıdır. Uygulamayı indirerek, kayıt olarak veya kullanarak bu koşulları kabul etmiş sayılırsınız.
              </p>
            </div>
          </div>

          {/* Üyelik ve Hesap Güvenliği */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">2. Üyelik ve Hesap Güvenliği</h2>
            <div className="space-y-4">
              <InfoBox
                title="Hesap Oluşturma"
                items={[
                  "18 yaşından büyük olmanız gerekmektedir.",
                  "Kayıt sırasında doğru ve güncel bilgiler vermelisiniz.",
                  "Hesabınız şahsınıza özeldir, başkalarıyla paylaşmamalısınız."
                ]}
              />
              <InfoBox
                title="Güvenlik Sorumlulukları"
                items={[
                  "Şifrenizin gizliliğinden siz sorumlusunuz.",
                  "Hesabınızda yetkisiz kullanım fark ederseniz derhal bildiriniz.",
                  "Hesabınızdan yapılan tüm işlemlerden siz sorumlusunuz."
                ]}
              />
            </div>
          </div>

          {/* Hizmetler ve Rezervasyonlar */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">3. Hizmetler ve Rezervasyonlar</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sefernur, aracı bir platform olarak çeşitli hizmet sağlayıcıları ile işbirliği yapmaktadır. Rezervasyonlarınız için:
              </p>
              <ul className="space-y-3">
                <ListItem text="Tüm rezervasyonlar, ilgili hizmet sağlayıcısının kendi koşullarına tabidir." />
                <ListItem text="Fiyatlar, müsaitlik durumu ve hizmet detayları değişiklik gösterebilir." />
                <ListItem text="Rezervasyon onayı, ödeme işleminin başarıyla tamamlanmasından sonra e-posta ile gönderilir." />
                <ListItem text="İptal ve değişiklik koşulları, her rezervasyon için farklılık gösterebilir." />
                <ListItem text="Vize işlemleri için gerekli belgeler eksiksiz ve doğru şekilde sunulmalıdır." />
              </ul>
            </div>
          </div>

          {/* Ödeme ve Faturalama */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">4. Ödeme ve Faturalama</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4 text-gray-700">
              <p>
                <strong className="text-gray-900">Ödeme Yöntemleri:</strong> Kredi kartı, banka kartı ve diğer güvenli ödeme yöntemlerini kabul ediyoruz.
              </p>
              <p>
                <strong className="text-gray-900">Güvenlik:</strong> Tüm ödeme işlemleri SSL sertifikası ile şifrelenir ve PCI-DSS standartlarına uygun şekilde işlenir.
              </p>
              <p>
                <strong className="text-gray-900">Faturalar:</strong> Elektronik fatura, kayıtlı e-posta adresinize gönderilir.
              </p>
              <p>
                <strong className="text-gray-900">İadeler:</strong> İptal koşullarına uygun iadeler, orijinal ödeme yöntemine 10-14 iş günü içinde yapılır.
              </p>
            </div>
          </div>

          {/* İptal ve İade Politikası */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">5. İptal ve İade Politikası</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                İptal ve iade koşulları, hizmet türüne ve sağlayıcıya göre değişiklik gösterir:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <CancellationCard
                  title="Otel Rezervasyonları"
                  items={[
                    "Ücretsiz iptal süresi otel politikasına bağlıdır",
                    "Geç iptallerde ceza uygulanabilir",
                    "No-show durumunda tam ücret tahsil edilir"
                  ]}
                />
                <CancellationCard
                  title="Transfer ve Araç Kiralama"
                  items={[
                    "24 saat öncesine kadar ücretsiz iptal",
                    "Geç iptallerde %50 ücret kesilir",
                    "Kullanılmayan hizmetler iade edilmez"
                  ]}
                />
                <CancellationCard
                  title="Tur Paketleri"
                  items={[
                    "İptal koşulları paket detaylarında belirtilir",
                    "Erken iptallerde kısmi iade yapılabilir",
                    "Turu kaçırma durumunda iade yapılmaz"
                  ]}
                />
                <CancellationCard
                  title="Vize İşlemleri"
                  items={[
                    "Vize başvurusu sonrası iptal edilemez",
                    "Red durumunda işlem ücreti iade edilmez",
                    "Belge eksikliği nedeniyle red'de sorumluluk kullanıcıya aittir"
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Kullanıcı Sorumlulukları */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">6. Kullanıcı Sorumlulukları</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
                <h3 className="text-yellow-900">Yasak Faaliyetler</h3>
              </div>
              <ul className="space-y-2 text-yellow-900">
                <ProhibitedItem text="Yanlış veya yanıltıcı bilgi vermek" />
                <ProhibitedItem text="Başkası adına veya yetkisiz işlem yapmak" />
                <ProhibitedItem text="Uygulamanın güvenliğini tehdit edecek faaliyetlerde bulunmak" />
                <ProhibitedItem text="Fikri mülkiyet haklarını ihlal etmek" />
                <ProhibitedItem text="Spam veya otomatik sistemler kullanmak" />
                <ProhibitedItem text="Diğer kullanıcıları rahatsız etmek veya taciz etmek" />
              </ul>
            </div>
          </div>

          {/* Sorumluluk Sınırlamaları */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">7. Sorumluluk Sınırlamaları</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sefernur, aracı bir platform olarak hizmet vermektedir. Bu nedenle:
              </p>
              <ul className="space-y-3">
                <ListItem text="Üçüncü taraf hizmet sağlayıcıların eylemlerinden sorumlu değiliz." />
                <ListItem text="Hizmet kesintileri, teknik sorunlar veya veri kaybı durumlarında dolaylı zararlardan sorumlu tutulamayız." />
                <ListItem text="Seyahat sırasında yaşanabilecek kaza, hastalık veya diğer olaylardan sorumlu değiliz." />
                <ListItem text="Vize red durumları veya ülke giriş/çıkış kurallarından kaynaklı sorunlardan sorumlu tutulamayız." />
              </ul>
            </div>
          </div>

          {/* Fikri Mülkiyet */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">8. Fikri Mülkiyet Hakları</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sefernur uygulamasındaki tüm içerik, tasarım, logo, yazılım ve diğer materyaller Sefernur'un fikri mülkiyetidir ve telif hakkı yasalarıyla korunmaktadır.
              </p>
              <p>
                İzinsiz kopyalama, dağıtma, değiştirme veya ticari amaçla kullanma kesinlikle yasaktır.
              </p>
            </div>
          </div>

          {/* Değişiklikler */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">9. Koşullarda Değişiklik</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-900">
              <p className="mb-3">
                Sefernur, bu kullanım koşullarını herhangi bir zamanda değiştirme hakkını saklı tutar. Önemli değişiklikler:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Uygulama içi bildirimle duyurulur</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>E-posta ile bilgilendirilirsiniz</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Değişikliklerden sonra uygulamayı kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir</span>
                </li>
              </ul>
            </div>
          </div>

          {/* İletişim */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">10. İletişim</h2>
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-8">
              <p className="text-emerald-100 mb-4">
                Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="space-y-2">
                <p><strong>E-posta:</strong> info@sefernur.com</p>
                <p><strong>Telefon:</strong> +90 (212) 555 0000</p>
                <p><strong>Adres:</strong> İstanbul, Türkiye</p>
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
function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h4 className="text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3">
      <div className="flex-shrink-0 w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
      <span>{text}</span>
    </li>
  );
}

function CancellationCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-gray-600 text-sm">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2"></div>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProhibitedItem({ text }: { text: string }) {
  return (
    <li className="flex gap-2">
      <span className="text-yellow-700">✗</span>
      <span>{text}</span>
    </li>
  );
}
