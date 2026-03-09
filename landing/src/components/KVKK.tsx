import { Scale, CheckCircle, Mail, Phone, MapPin, FileText, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function KVKK() {
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
              <Scale className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center mb-4 text-white text-4xl md:text-5xl">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-center text-emerald-100 text-lg max-w-2xl mx-auto">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin işlenmesi hakkında sizi bilgilendirme yükümlülüğümüz bulunmaktadır.
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
          
          {/* Veri Sorumlusu */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">1. Veri Sorumlusu</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu olarak Sefernur tarafından aşağıda açıklanan kapsamda işlenebilecektir.
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong className="text-gray-900">Unvan:</strong> Sefernur Teknoloji A.Ş.</p>
                <p><strong className="text-gray-900">Adres:</strong> İstanbul, Türkiye</p>
                <p><strong className="text-gray-900">E-posta:</strong> kvkk@sefernur.com</p>
                <p><strong className="text-gray-900">Telefon:</strong> +90 (212) 555 0000</p>
              </div>
            </div>
          </div>

          {/* İşlenen Kişisel Veriler */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">2. İşlenen Kişisel Veriler</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Sefernur mobil uygulamasını kullanırken aşağıdaki kategorilerde kişisel verileriniz işlenmektedir:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <DataCategory
                title="Kimlik Bilgileri"
                items={[
                  "Ad, soyad",
                  "T.C. kimlik numarası",
                  "Doğum tarihi ve yeri",
                  "Pasaport bilgileri"
                ]}
                icon={<UserCheck className="w-5 h-5" />}
              />
              <DataCategory
                title="İletişim Bilgileri"
                items={[
                  "E-posta adresi",
                  "Telefon numarası",
                  "Adres bilgileri",
                  "İkamet bilgileri"
                ]}
                icon={<Phone className="w-5 h-5" />}
              />
              <DataCategory
                title="Finansal Bilgiler"
                items={[
                  "Ödeme bilgileri (kısmi)",
                  "Fatura bilgileri",
                  "İşlem geçmişi",
                  "Banka bilgileri (IBAN)"
                ]}
                icon={<FileText className="w-5 h-5" />}
              />
              <DataCategory
                title="Diğer Bilgiler"
                items={[
                  "IP adresi",
                  "Çerez verileri",
                  "Uygulama kullanım verileri",
                  "Konum bilgileri (izinli)"
                ]}
                icon={<CheckCircle className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Kişisel Verilerin İşlenme Amaçları */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <div className="space-y-4">
              <PurposeCard
                title="Hizmet Sunumu"
                description="Hac ve Umre rezervasyonlarınızın oluşturulması, yönetilmesi ve takibi"
              />
              <PurposeCard
                title="Sözleşme Yükümlülükleri"
                description="Hizmet sözleşmelerinin kurulması ve ifası, ödemelerin işlenmesi"
              />
              <PurposeCard
                title="Yasal Yükümlülükler"
                description="Vergi, denetim ve benzeri yasal gerekliliklerin yerine getirilmesi"
              />
              <PurposeCard
                title="Müşteri İlişkileri"
                description="Müşteri memnuniyeti, destek ve iletişim faaliyetleri"
              />
              <PurposeCard
                title="Güvenlik"
                description="Uygulama güvenliğinin sağlanması ve dolandırıcılık önleme"
              />
              <PurposeCard
                title="İyileştirme"
                description="Hizmet kalitesinin artırılması ve kullanıcı deneyiminin geliştirilmesi"
              />
            </div>
          </div>

          {/* Kişisel Verilerin Aktarılması */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">4. Kişisel Verilerin Aktarılması</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak aşağıdaki taraflara aktarılabilmektedir:
            </p>
            <div className="space-y-3">
              <TransferItem
                title="Hizmet Sağlayıcılar"
                description="Oteller, havayolu şirketleri, araç kiralama firmaları, tur operatörleri"
              />
              <TransferItem
                title="Resmi Kurumlar"
                description="Vize işlemleri için konsolosluklar, Dışişleri Bakanlığı ve ilgili kamu kurumları"
              />
              <TransferItem
                title="Ödeme Kuruluşları"
                description="Banka ve ödeme hizmeti sağlayıcıları (PCI-DSS uyumlu)"
              />
              <TransferItem
                title="Teknoloji Sağlayıcıları"
                description="Bulut sunucu, SMS, e-posta ve analitik hizmet sağlayıcıları"
              />
              <TransferItem
                title="Hukuki Gereklilikler"
                description="Mahkeme, savcılık, polis ve diğer yetkili merciler (yasal talep halinde)"
              />
            </div>
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-900 text-sm">
                Yurt dışına veri aktarımı yapılan durumlarda, ilgili ülkenin yeterli koruma düzeyine sahip olması veya yazılı taahhüt alınması sağlanmaktadır.
              </p>
            </div>
          </div>

          {/* Kişisel Verilerin Toplanma Yöntemi */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">5. Kişisel Verilerin Toplanma Yöntemi</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <CollectionMethod
                title="Doğrudan Toplama"
                items={[
                  "Mobil uygulama kayıt formu",
                  "Rezervasyon ve sipariş formları",
                  "Müşteri destek talepleri",
                  "Vize başvuru formları"
                ]}
              />
              <CollectionMethod
                title="Otomatik Toplama"
                items={[
                  "Uygulama kullanım verileri",
                  "Çerezler ve benzeri teknolojiler",
                  "Log kayıtları",
                  "Analitik araçlar"
                ]}
              />
            </div>
          </div>

          {/* KVKK Kapsamındaki Haklarınız */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">6. KVKK Kapsamındaki Haklarınız</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              KVKK'nın 11. maddesi uyarınca, veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:
            </p>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 space-y-4">
              <RightItem text="Kişisel verilerinizin işlenip işlenmediğini öğrenme" />
              <RightItem text="Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme" />
              <RightItem text="Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme" />
              <RightItem text="Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme" />
              <RightItem text="Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme" />
              <RightItem text="KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme" />
              <RightItem text="Düzeltme, silme veya yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme" />
              <RightItem text="İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme" />
              <RightItem text="Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme" />
            </div>
          </div>

          {/* Başvuru Yöntemi */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">7. Başvuru Yöntemi ve Süreç</h2>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 mb-4">Başvuru Kanalları</h4>
                <div className="space-y-3 text-gray-700">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900">E-posta:</p>
                      <p>kvkk@sefernur.com adresine başvurunuzu iletebilirsiniz</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Posta:</p>
                      <p>İstanbul, Türkiye adresine ıslak imzalı dilekçe gönderebilirsiniz</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Mobil Uygulama:</p>
                      <p>Ayarlar &gt; KVKK &gt; Başvuru Yap bölümünden talepte bulunabilirsiniz</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="text-yellow-900 mb-3">Başvuruda Bulunması Gerekenler</h4>
                <ul className="space-y-2 text-yellow-900">
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Ad, soyad ve başvuru yazılı ise imza</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>T.C. kimlik numarası (varsa)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Tebligata esas yerleşim yeri veya iş yeri adresi</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>E-posta adresi, telefon veya faks numarası</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Talep konusu</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h4 className="text-emerald-900 mb-3">Cevaplama Süresi</h4>
                <p className="text-emerald-900">
                  Başvurularınız, talebin niteliğine göre <strong>en geç 30 gün içinde</strong> ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
                </p>
              </div>
            </div>
          </div>

          {/* Veri Güvenliği */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">8. Veri Güvenliği Önlemleri</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirleri almaktayız:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <SecurityMeasure
                title="Teknik Önlemler"
                items={[
                  "SSL/TLS şifreleme",
                  "Güvenlik duvarı koruması",
                  "Düzenli güvenlik denetimleri",
                  "Veri yedekleme sistemleri"
                ]}
              />
              <SecurityMeasure
                title="İdari Önlemler"
                items={[
                  "Erişim yetkilendirme sistemi",
                  "Personel gizlilik sözleşmeleri",
                  "KVKK eğitimleri",
                  "Veri işleme envanteri"
                ]}
              />
            </div>
          </div>

          {/* İletişim */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">9. İletişim Bilgileri</h2>
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-8">
              <p className="text-emerald-100 mb-6">
                KVKK ve kişisel verilerinizle ilgili tüm sorularınız için:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <ContactInfo
                  icon={<Mail className="w-6 h-6" />}
                  label="E-posta"
                  value="kvkk@sefernur.com"
                />
                <ContactInfo
                  icon={<Phone className="w-6 h-6" />}
                  label="Telefon"
                  value="+90 (212) 555 0000"
                />
                <ContactInfo
                  icon={<MapPin className="w-6 h-6" />}
                  label="Adres"
                  value="İstanbul, Türkiye"
                />
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
function DataCategory({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-emerald-600">{icon}</div>
        <h4 className="text-gray-900">{title}</h4>
      </div>
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

function PurposeCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}

function TransferItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function CollectionMethod({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-gray-600 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
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

function SecurityMeasure({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h4 className="text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-gray-600 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-emerald-200 text-sm mb-1">{label}</div>
      <div className="text-white text-sm">{value}</div>
    </div>
  );
}
