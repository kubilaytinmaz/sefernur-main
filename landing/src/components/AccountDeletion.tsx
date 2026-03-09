import { Trash2, Mail, Phone, MessageCircle, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AccountDeletion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountId: '',
    notes: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = 'Sefernur - Hesap Silme Talebi';
    const body = `
Hesap Silme Talebi

Ad Soyad: ${formData.fullName}
E-posta: ${formData.email}
Telefon: ${formData.phone || 'Belirtilmedi'}
Hesap ID / Kullanıcı Adı: ${formData.accountId}

Ek Notlar:
${formData.notes || 'Yok'}

---
Bu talep Sefernur web sitesi üzerinden gönderilmiştir.
Tarih: ${new Date().toLocaleDateString('tr-TR')}
    `.trim();

    const mailtoLink = `mailto:kvkk@sefernur.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Trash2 className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center mb-4 text-white text-4xl md:text-5xl">
            Hesap Silme ve Veri Yönetimi
          </h1>
          <p className="text-center text-emerald-100 text-lg max-w-2xl mx-auto">
            Google Play politikalarına uygun olarak Sefernur hesabınızı kalıcı olarak silebilmeniz için aşağıdaki adımları izleyebilirsiniz. Talebiniz KVKK kapsamında değerlendirilir.
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
          {/* Hesap Silme Adımları */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-6 text-3xl">Hesap Silme Adımları</h2>
            <div className="space-y-4">
              <StepCard
                number={1}
                title="Talep Oluşturma"
                description="Uygulamada Ayarlar &gt; Hesap &gt; Hesabı Sil adımlarını izleyin veya bu sayfadaki formu doldurun."
                icon={<Mail className="w-5 h-5" />}
              />
              <StepCard
                number={2}
                title="Kimlik Doğrulama"
                description="Ekibimiz, hesabın size ait olduğunu doğrulamak için kayıtlı e-posta veya telefon üzerinden sizinle iletişime geçer."
                icon={<Shield className="w-5 h-5" />}
              />
              <StepCard
                number={3}
                title="Silme İşlemi"
                description="Onayınız sonrası hesabınız önce pasifleştirilir, ardından yasal süreler dikkate alınarak kalıcı olarak silinir."
                icon={<Clock className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Silinen ve Saklanan Veriler */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-6 text-3xl">Silinen ve Saklanan Veriler</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Hesabınızı sildiğinizde verileriniz aşağıdaki şekilde işlenir:
            </p>
            <div className="space-y-4">
              <DataRetentionCard
                title="Profil ve kimlik bilgileri"
                description="30 gün içinde kalıcı olarak silinir. Bu süre kötüye kullanım incelemeleri için tutulur."
                period="30 gün"
                color="green"
              />
              <DataRetentionCard
                title="Rezervasyon ve sözleşme kayıtları"
                description="Hesabınızla ilişiği kesilir, ancak vergi ve denetim yükümlülükleri nedeniyle yasal süre boyunca saklanır."
                period="Yasal süre"
                color="yellow"
              />
              <DataRetentionCard
                title="Finansal işlemler"
                description="Bankacılık mevzuatı gereği ilgili kuruluşlar nezdinde saklanır, Sefernur içerisinde yalnızca sınırlı erişimle tutulur."
                period="Yasal süre"
                color="yellow"
              />
              <DataRetentionCard
                title="Destek ve iletişim kayıtları"
                description="Kimlik bilgilerinizden ayrıştırılmış şekilde belirli bir süre daha saklanabilir."
                period="Değişken"
                color="blue"
              />
            </div>
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-900 text-sm">
                Saklama süresi dolan veriler periyodik olarak silinir veya anonim hale getirilir.
              </p>
            </div>
          </div>

          {/* Hesap Silme Talep Formu */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-4 text-3xl">Hesap Silme Talep Formu</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Bu formu doldurduğunuzda, cihazınızın varsayılan e-posta uygulaması üzerinden <strong>kvkk@sefernur.com</strong> adresine önceden hazırlanmış bir e-posta açılır. E-postayı göndererek talebinizi tamamlayabilirsiniz.
            </p>
            
            <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Ad Soyad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Adınız ve soyadınız"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-posta Adresi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefon (opsiyonel)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+90 (555) 123 45 67"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountId">
                  Hesap ID / Kullanıcı Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountId"
                  type="text"
                  required
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="Uygulamadaki kullanıcı adınız veya ID"
                  className="bg-white"
                />
                <p className="text-sm text-gray-500">
                  Uygulamadaki profil bölümünden görebilirsiniz
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Ek Not (opsiyonel)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Örneğin: Yanlış hesap, veri silme talebi vb."
                  className="bg-white min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800"
              >
                <Mail className="w-5 h-5 mr-2" />
                Talep E-postası Oluştur
              </Button>
            </form>
          </div>

          {/* Destek */}
          <div className="mb-12">
            <h2 className="text-emerald-800 mb-6 text-3xl">Destek</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Hesap silme süreciyle ilgili sorularınız için destek ekibimizle iletişime geçebilirsiniz.
            </p>
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <SupportContact
                  icon={<Mail className="w-6 h-6" />}
                  label="E-posta"
                  value="destek@sefernur.com"
                  href="mailto:destek@sefernur.com"
                />
                <SupportContact
                  icon={<Phone className="w-6 h-6" />}
                  label="Telefon"
                  value="+90 (850) 555 00 00"
                  href="tel:+908505550000"
                />
                <SupportContact
                  icon={<MessageCircle className="w-6 h-6" />}
                  label="WhatsApp"
                  value="+90 (533) 555 00 00"
                  href="https://wa.me/905335550000"
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
function StepCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl flex items-center justify-center">
          <span>{number}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-emerald-700">{icon}</div>
          <h3 className="text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function DataRetentionCard({ title, description, period, color }: { title: string; description: string; period: string; color: 'green' | 'yellow' | 'blue' }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
        <h4 className="text-gray-900">{title}</h4>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${colorClasses[color]} self-start`}>
          <Clock className="w-3.5 h-3.5" />
          {period}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function SupportContact({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
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
