import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = `Sefernur İletişim - ${formData.subject || 'Genel Bilgi'}`;
    const body = `
İsim: ${formData.name}
E-posta: ${formData.email}
Telefon: ${formData.phone || 'Belirtilmedi'}
Konu: ${formData.subject || 'Genel Bilgi'}

Mesaj:
${formData.message}

---
Bu mesaj Sefernur web sitesi iletişim formundan gönderilmiştir.
Tarih: ${new Date().toLocaleDateString('tr-TR')}
    `.trim();

    const mailtoLink = `mailto:info@sefernur.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center mb-4 text-white text-4xl md:text-5xl">
            İletişim
          </h1>
          <p className="text-center text-emerald-100 text-lg max-w-2xl mx-auto">
            Hac ve Umre yolculuğunuz için sorularınızı yanıtlamaktan ve size yardımcı olmaktan mutluluk duyarız. Bize her zaman ulaşabilirsiniz.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-emerald-800 mb-6 text-3xl">Bize Ulaşın</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Formu doldurarak bizimle iletişime geçebilirsiniz. En kısa sürede size geri dönüş yapacağız.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Ad Soyad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Adınız ve soyadınız"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-posta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@email.com"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 (555) 123 45 67"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Konu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mesajınızın konusu"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Mesajınız <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mesajınızı buraya yazın..."
                    className="bg-white border-gray-300 min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Mesaj Gönder
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-emerald-800 mb-6 text-3xl">İletişim Bilgileri</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Aşağıdaki kanallardan da bize ulaşabilirsiniz. Müşteri hizmetlerimiz size yardımcı olmak için hazır.
              </p>

              <div className="space-y-6">
                {/* Phone */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">Telefon</h3>
                      <a href="tel:+902125550000" className="text-emerald-700 hover:text-emerald-800 transition-colors block mb-1">
                        +90 (212) 555 0000
                      </a>
                      <a href="tel:+908505550000" className="text-emerald-700 hover:text-emerald-800 transition-colors block">
                        +90 (850) 555 0000 (Ücretsiz)
                      </a>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">WhatsApp</h3>
                      <a href="https://wa.me/905335550000" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 transition-colors">
                        +90 (533) 555 0000
                      </a>
                      <p className="text-gray-600 text-sm mt-1">7/24 destek hattı</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">E-posta</h3>
                      <a href="mailto:info@sefernur.com" className="text-emerald-700 hover:text-emerald-800 transition-colors block mb-1">
                        info@sefernur.com
                      </a>
                      <a href="mailto:destek@sefernur.com" className="text-emerald-700 hover:text-emerald-800 transition-colors block">
                        destek@sefernur.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">Adres</h3>
                      <p className="text-gray-700">
                        Sefernur Teknoloji A.Ş.<br />
                        Fatih Sultan Mehmet Mah.<br />
                        Balkan Cad. No: 62<br />
                        Ümraniye / İstanbul
                      </p>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">Çalışma Saatleri</h3>
                      <p className="text-gray-700">
                        Pazartesi - Cuma: 09:00 - 18:00<br />
                        Cumartesi: 10:00 - 16:00<br />
                        Pazar: Kapalı
                      </p>
                      <p className="text-emerald-700 text-sm mt-2">
                        WhatsApp desteği 7/24 aktif
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-emerald-800 mb-6 text-3xl text-center">Ofisimizi Ziyaret Edin</h2>
            <div className="bg-gray-100 rounded-2xl overflow-hidden h-96 flex items-center justify-center border border-gray-200">
              <div className="text-center p-8">
                <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">
                  Ümraniye, İstanbul
                </p>
                <p className="text-gray-600 text-sm">
                  Detaylı harita için Google Maps'i kullanabilirsiniz
                </p>
              </div>
            </div>
          </div>

          {/* FAQ CTA */}
          <div className="mt-16 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-white mb-4 text-3xl">Sıkça Sorulan Sorular</h2>
            <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
              Aradığınız cevabı SSS bölümümüzde bulabilirsiniz. Hac ve Umre seyahatleri hakkında en çok merak edilen konuları derledik.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-white text-emerald-700 hover:bg-emerald-50"
            >
              SSS'ye Git
            </Button>
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center pt-12">
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
