import { Badge } from "@/components/ui/Badge";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Yasal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Gizlilik Politikası</h1>
          <p className="mt-2 text-emerald-100 text-sm">Son güncelleme: 1 Ocak 2026</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-emerald-600">
          <h2>1. Giriş</h2>
          <p>
            Sefernur Turizm Seyahat Acentası (&quot;Sefernur&quot;, &quot;biz&quot;, &quot;şirket&quot;) olarak kişisel verilerinizin gizliliğine büyük önem veriyoruz.
            Bu Gizlilik Politikası, web sitemiz (sefernur.com), mobil uygulamamız ve tüm dijital hizmetlerimiz aracılığıyla topladığımız kişisel verilerin
            nasıl işlendiğini, korunduğunu ve haklarınızı açıklamaktadır.
          </p>

          <h2>2. Toplanan Kişisel Veriler</h2>
          <p>Hizmetlerimizi sunabilmek için aşağıdaki kişisel verileri toplayabiliriz:</p>
          <ul>
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası, pasaport bilgileri, doğum tarihi</li>
            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
            <li><strong>Finansal Bilgiler:</strong> Ödeme ve fatura bilgileri (kredi kartı bilgileri doğrudan tarafımızca saklanmaz)</li>
            <li><strong>Seyahat Bilgileri:</strong> Rezervasyon detayları, uçuş bilgileri, otel tercihleri, vize başvuru bilgileri</li>
            <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgisi, çerez verileri</li>
            <li><strong>Sağlık Bilgileri:</strong> Aşı belgeleri (yalnızca vize işlemleri kapsamında, açık rıza ile)</li>
          </ul>

          <h2>3. Verilerin İşlenme Amaçları</h2>
          <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
          <ul>
            <li>Umre paket rezervasyonlarının oluşturulması ve yönetilmesi</li>
            <li>Vize başvuru süreçlerinin yürütülmesi</li>
            <li>Otel, transfer ve tur hizmetlerinin koordinasyonu</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Müşteri destek taleplerinin yanıtlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hizmet kalitesinin artırılması ve analiz</li>
            <li>Kampanya ve bilgilendirme iletişimi (onayınız dahilinde)</li>
          </ul>

          <h2>4. Verilerin Paylaşılması</h2>
          <p>Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
          <ul>
            <li><strong>Hizmet Sağlayıcılar:</strong> Otel, havayolu, transfer şirketleri gibi seyahat hizmeti tedarikçileri (hizmet ifası için zorunlu bilgiler)</li>
            <li><strong>Resmi Kurumlar:</strong> Suudi Arabistan Büyükelçiliği ve konsoloslukları (vize işlemleri kapsamında)</li>
            <li><strong>Ödeme Kuruluşları:</strong> Banka ve ödeme altyapı sağlayıcıları (ödeme işlemleri için)</li>
            <li><strong>Yasal Zorunluluklar:</strong> Mahkeme kararı veya yasal düzenleme gereği yetkili kurumlara</li>
          </ul>

          <h2>5. Verilerin Saklanması ve Güvenliği</h2>
          <p>
            Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerine uygun olarak muhafaza edilir.
            Verilerinizin güvenliği için SSL/TLS şifreleme, güvenlik duvarları, erişim kontrolü ve düzenli güvenlik denetimleri gibi
            teknik ve idari tedbirler uygulanmaktadır.
          </p>
          <p>
            Ödeme bilgileriniz PCI DSS standartlarına uygun şekilde ödeme altyapı sağlayıcılarımız tarafından işlenir ve tarafımızca saklanmaz.
          </p>

          <h2>6. Haklarınız</h2>
          <p>6698 sayılı KVKK ve ilgili mevzuat kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmiş ise buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
            <li>Verilerin silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
          </ul>

          <h2>7. Çerezler</h2>
          <p>
            Web sitemizde çerezler kullanılmaktadır. Çerez kullanımımıza ilişkin detaylı bilgi için{" "}
            <a href="/cookies">Çerez Politikamızı</a> inceleyebilirsiniz.
          </p>

          <h2>8. Değişiklikler</h2>
          <p>
            Bu Gizlilik Politikası, yasal düzenlemeler ve hizmet değişiklikleri doğrultusunda güncellenebilir.
            Güncellemeler web sitemizde yayınlandığı tarihte yürürlüğe girer. Önemli değişiklikler hakkında sizi
            e-posta veya uygulama bildirimi ile bilgilendiririz.
          </p>

          <h2>9. İletişim</h2>
          <p>
            Gizlilik politikamıza ilişkin sorularınız için aşağıdaki kanallardan bize ulaşabilirsiniz:
          </p>
          <ul>
            <li><strong>E-posta:</strong> kvkk@sefernur.com</li>
            <li><strong>Telefon:</strong> 0850 123 45 67</li>
            <li><strong>Adres:</strong> Fatih Mah. Hac Yolu Cad. No:42, Fatih / İstanbul</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
