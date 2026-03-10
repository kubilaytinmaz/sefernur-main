import { Badge } from "@/components/ui/Badge";
import { getKvkkMetadata } from "@/lib/seo";
import { Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = getKvkkMetadata();

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            KVKK
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">KVKK Aydınlatma Metni</h1>
          <p className="mt-2 text-emerald-100 text-sm">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-emerald-600">
          <h2>1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, Sefernur Turizm Seyahat Acentası
            (&quot;Şirket&quot;) veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında; hukuka ve
            dürüstlük kurallarına uygun, doğru ve gerektiğinde güncel olarak, belirli, açık ve meşru amaçlarla,
            işlendikleri amaçla bağlantılı, sınırlı ve ölçülü olarak, ilgili mevzuatta öngörülen veya işlendikleri amaç
            için gerekli olan süre kadar muhafaza ederek işlemektedir.
          </p>

          <h2>2. İşlenen Kişisel Veri Kategorileri</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Veri Kategorisi</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Kimlik Bilgileri</strong></td>
                  <td>Ad, soyad, T.C. kimlik no, pasaport no, doğum tarihi, cinsiyet</td>
                </tr>
                <tr>
                  <td><strong>İletişim Bilgileri</strong></td>
                  <td>Telefon numarası, e-posta adresi, adres</td>
                </tr>
                <tr>
                  <td><strong>Müşteri İşlem Bilgileri</strong></td>
                  <td>Rezervasyon detayları, sipariş bilgileri, talep ve şikayetler</td>
                </tr>
                <tr>
                  <td><strong>Finansal Bilgiler</strong></td>
                  <td>Fatura bilgileri, ödeme kayıtları</td>
                </tr>
                <tr>
                  <td><strong>Pazarlama Bilgileri</strong></td>
                  <td>Alışveriş geçmişi, anket yanıtları, kampanya tercihleri</td>
                </tr>
                <tr>
                  <td><strong>İşlem Güvenliği</strong></td>
                  <td>IP adresi, log kayıtları, şifre bilgileri (şifreli)</td>
                </tr>
                <tr>
                  <td><strong>Sağlık Bilgileri</strong></td>
                  <td>Aşı belgeleri (yalnızca vize işlemleri, açık rıza ile)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul>
            <li>Umre seyahati paketlerinin hazırlanması, sunulması ve yönetilmesi</li>
            <li>Sözleşme süreçlerinin yürütülmesi</li>
            <li>Vize başvuru işlemlerinin gerçekleştirilmesi</li>
            <li>Otel, transfer ve tur rezervasyonlarının koordinasyonu</li>
            <li>Fatura düzenlenmesi ve ödeme süreçlerinin yönetilmesi</li>
            <li>Müşteri memnuniyeti ölçüm ve iyileştirme çalışmaları</li>
            <li>İletişim faaliyetlerinin yürütülmesi</li>
            <li>Bilgi güvenliği süreçlerinin yönetilmesi</li>
            <li>Denetim ve etik faaliyetlerinin yürütülmesi</li>
            <li>Yetkili kişi, kurum ve kuruluşlara bilgi verilmesi</li>
            <li>Reklam, kampanya ve promosyon süreçlerinin yönetilmesi (açık rıza ile)</li>
          </ul>

          <h2>4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
          <p>Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebepler kapsamında işlenmektedir:</p>
          <ul>
            <li>Kanunlarda açıkça öngörülmesi</li>
            <li>Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
            <li>Hukuki yükümlülüğün yerine getirilmesi</li>
            <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati</li>
            <li>İlgili kişinin açık rızası (özellikle pazarlama faaliyetleri ve sağlık verileri için)</li>
          </ul>

          <h2>5. Kişisel Verilerin Aktarılması</h2>
          <p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda:</p>
          <ul>
            <li><strong>Yurtiçi aktarım:</strong> İş ortaklarımız, tedarikçilerimiz, hizmet sağlayıcılarımız, yetkili kamu kurum ve kuruluşları</li>
            <li><strong>Yurtdışı aktarım:</strong> Suudi Arabistan konsolosluk ve resmi makamları (vize işlemleri), yurtdışı otel ve transfer tedarikçileri, bulut bilişim altyapı sağlayıcıları (Firebase/Google — ABD merkezli, yeterli koruma sağlayan ülkeler kapsamında)</li>
          </ul>

          <h2>6. Veri Saklama Süreleri</h2>
          <ul>
            <li><strong>Sözleşme verileri:</strong> Sözleşme süresince ve sona ermesinden itibaren 10 yıl (Türk Borçlar Kanunu)</li>
            <li><strong>Finansal veriler:</strong> İşlem tarihinden itibaren 10 yıl (Vergi Usul Kanunu)</li>
            <li><strong>Pazarlama verileri:</strong> Açık rıza geri alınana kadar</li>
            <li><strong>Log kayıtları:</strong> 2 yıl (5651 sayılı Kanun)</li>
            <li><strong>Vize başvuru belgeleri:</strong> Seyahat tamamlandıktan sonra 3 yıl</li>
          </ul>

          <h2>7. İlgili Kişinin Hakları (KVKK Madde 11)</h2>
          <p>KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ol>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
            <li>KVKK Madde 7 kapsamında kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme, silme ve yok etme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
          </ol>

          <h2>8. Başvuru Yöntemi</h2>
          <p>
            Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici gerekli bilgiler ile
            talebinizi aşağıdaki yöntemlerden biriyle bize iletebilirsiniz:
          </p>
          <ul>
            <li><strong>E-posta:</strong> kvkk@sefernur.com (kayıtlı e-posta adresinizden)</li>
            <li><strong>Posta:</strong> Fatih Mah. Hac Yolu Cad. No:42, Fatih / İstanbul (ıslak imzalı dilekçe)</li>
            <li><strong>Noter aracılığıyla:</strong> Yukarıdaki adrese noter kanalıyla</li>
          </ul>
          <p>
            Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
            İşlemin ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulu&apos;nca belirlenen
            tarife üzerinden ücret talep edilebilir.
          </p>

          <h2>9. Veri Sorumlusu İletişim Bilgileri</h2>
          <ul>
            <li><strong>Unvan:</strong> Sefernur Turizm Seyahat Acentası</li>
            <li><strong>Adres:</strong> Fatih Mah. Hac Yolu Cad. No:42, Fatih / İstanbul</li>
            <li><strong>E-posta:</strong> kvkk@sefernur.com</li>
            <li><strong>Telefon:</strong> 0850 123 45 67</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
