import { Badge } from "@/components/ui/Badge";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Yasal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Kullanım Koşulları</h1>
          <p className="mt-2 text-emerald-100 text-sm">Son güncelleme: 1 Ocak 2026</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-emerald-600">
          <h2>1. Genel Hükümler</h2>
          <p>
            Bu Kullanım Koşulları, Sefernur Turizm Seyahat Acentası (&quot;Sefernur&quot;) tarafından sunulan web sitesi (sefernur.com),
            mobil uygulama ve tüm dijital hizmetlerin kullanımına ilişkin şartları düzenler. Platformumuzu kullanarak bu koşulları
            kabul etmiş sayılırsınız.
          </p>

          <h2>2. Hizmet Kapsamı</h2>
          <p>Sefernur aşağıdaki hizmetleri sunmaktadır:</p>
          <ul>
            <li>Umre paket organizasyonu ve rezervasyonu</li>
            <li>Otel konaklama hizmetleri (Mekke ve Medine)</li>
            <li>Havalimanı ve şehirlerarası VIP transfer hizmetleri</li>
            <li>Rehberli tur ve ziyaret programları</li>
            <li>Vize başvuru ve takip hizmetleri</li>
            <li>Araç kiralama aracılık hizmetleri</li>
          </ul>
          <p>
            Hizmet kapsamı, tedarikçi koşulları ve dönemsel düzenlemeler doğrultusunda güncellenebilir.
            Güncel hizmet detayları her zaman platform üzerinde belirtilmektedir.
          </p>

          <h2>3. Üyelik ve Hesap Güvenliği</h2>
          <ul>
            <li>Platform hizmetlerinden yararlanmak için üyelik oluşturulması gerekebilir.</li>
            <li>Üyelik bilgilerinizin doğru ve güncel tutulması sizin sorumluluğunuzdadır.</li>
            <li>Hesap şifrenizi gizli tutmalı ve üçüncü kişilerle paylaşmamalısınız.</li>
            <li>Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz.</li>
            <li>Yetkisiz erişim tespit edilmesi durumunda derhal bize bildirmeniz gerekmektedir.</li>
          </ul>

          <h2>4. Rezervasyon ve Ödeme Koşulları</h2>
          <h3>4.1 Rezervasyon</h3>
          <ul>
            <li>Rezervasyonlar, ödemenin tamamlanması veya ön ödemenin alınması ile kesinleşir.</li>
            <li>Paket içeriği ve fiyatlandırma, rezervasyon anındaki bilgilere göre belirlenir.</li>
            <li>Tedarikçi kaynaklı değişiklikler (otel değişikliği, uçuş saati vb.) tarafımızdan size bildirilir.</li>
          </ul>
          <h3>4.2 Ödeme</h3>
          <ul>
            <li>Ödemeler Türk Lirası (TL) üzerinden yapılır.</li>
            <li>Kredi kartı, banka havalesi/EFT ve kapıda ödeme seçenekleri mevcuttur.</li>
            <li>Taksitli ödeme imkânları banka ve kart tipine göre değişir.</li>
            <li>Fatura, ödeme sonrası kayıtlı e-posta adresinize gönderilir.</li>
          </ul>

          <h2>5. İptal ve İade</h2>
          <p>
            İptal ve iade koşulları ayrı bir politika dokümanında detaylandırılmıştır.
            Lütfen <a href="/cancellation">İptal ve İade Politikası</a> sayfamızı inceleyiniz.
          </p>

          <h2>6. Kullanıcı Sorumlulukları</h2>
          <p>Platformumuzu kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
          <ul>
            <li>Doğru ve güncel bilgiler vermek (özellikle pasaport ve kimlik bilgileri)</li>
            <li>Platformu yalnızca kişisel, ticari olmayan amaçlarla kullanmak</li>
            <li>Üçüncü kişilerin haklarını ihlal edecek davranışlardan kaçınmak</li>
            <li>Platformun teknik altyapısına zarar verecek girişimlerde bulunmamak</li>
            <li>Otomatik veri toplama araçları (bot, scraper vb.) kullanmamak</li>
            <li>Yanıltıcı, sahte veya hukuka aykırı içerik paylaşmamak</li>
          </ul>

          <h2>7. Fikri Mülkiyet</h2>
          <p>
            Platform üzerindeki tüm içerikler (metin, görsel, logo, tasarım, yazılım) Sefernur&apos;un fikri mülkiyetindedir.
            Bu içerikler yazılı izin alınmadan kopyalanamaz, çoğaltılamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
          </p>

          <h2>8. Sorumluluk Sınırları</h2>
          <ul>
            <li>Sefernur, tedarikçi kaynaklı aksaklıklardan (uçuş iptali, otel değişikliği vb.) doğrudan sorumlu değildir ancak çözüm için azami çaba gösterir.</li>
            <li>Mücbir sebepler (doğal afet, salgın, savaş, grev vb.) nedeniyle hizmet aksamalarında sorumluluk kabul edilmez.</li>
            <li>Platform üzerindeki fiyat ve bilgilerde maddi hata durumunda düzeltme hakkımız saklıdır.</li>
            <li>Üçüncü taraf web sitelerine verilen bağlantıların içeriğinden sorumlu değiliz.</li>
          </ul>

          <h2>9. Anlaşmazlık Çözümü</h2>
          <p>
            Bu koşullardan doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır.
            Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            Tüketici hakları kapsamındaki başvurular için Tüketici Hakem Heyetleri&apos;ne de başvurulabilir.
          </p>

          <h2>10. Değişiklikler</h2>
          <p>
            Bu Kullanım Koşulları gerektiğinde güncellenebilir. Değişiklikler web sitemizde yayınlandığı anda
            yürürlüğe girer. Platformu kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.
          </p>

          <h2>11. İletişim</h2>
          <p>Kullanım koşullarına ilişkin sorularınız için:</p>
          <ul>
            <li><strong>E-posta:</strong> hukuk@sefernur.com</li>
            <li><strong>Telefon:</strong> 0850 123 45 67</li>
            <li><strong>Adres:</strong> Fatih Mah. Hac Yolu Cad. No:42, Fatih / İstanbul</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
