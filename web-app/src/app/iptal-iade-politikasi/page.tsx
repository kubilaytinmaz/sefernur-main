import { Badge } from "@/components/ui/Badge";
import { getCancellationMetadata } from "@/lib/seo";
import { RotateCcw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = getCancellationMetadata();

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Yasal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">İptal ve İade Politikası</h1>
          <p className="mt-2 text-emerald-100 text-sm">Son güncelleme: 1 Ocak 2026</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-emerald-600">
          <h2>1. Genel İlkeler</h2>
          <p>
            Bu İptal ve İade Politikası, Sefernur Turizm Seyahat Acentası (&quot;Sefernur&quot;) platformu üzerinden
            gerçekleştirilen tüm rezervasyonlara uygulanır. 6502 sayılı Tüketicinin Korunması Hakkında Kanun
            ve Mesafeli Sözleşmeler Yönetmeliği kapsamındaki haklarınız saklıdır.
          </p>
          <p>
            Seyahat hizmetleri, tüketicinin isteği üzerine belirli bir tarihte ifa edilecek hizmetler kapsamında
            olduğundan cayma hakkı istisnaları uygulanabilir. Ancak Sefernur olarak müşteri memnuniyetini esas alan
            esnek bir iade politikası sunmaktayız.
          </p>

          <h2>2. Umre Paketleri İptal Koşulları</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>İptal Zamanı</th>
                  <th>Kesinti Oranı</th>
                  <th>İade Süresi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Kalkıştan 30+ gün önce</td>
                  <td className="text-emerald-700 font-semibold">%0 (Tam iade)</td>
                  <td>7 iş günü</td>
                </tr>
                <tr>
                  <td>Kalkıştan 15-29 gün önce</td>
                  <td>%25 kesinti</td>
                  <td>10 iş günü</td>
                </tr>
                <tr>
                  <td>Kalkıştan 7-14 gün önce</td>
                  <td>%50 kesinti</td>
                  <td>10 iş günü</td>
                </tr>
                <tr>
                  <td>Kalkıştan 3-6 gün önce</td>
                  <td>%75 kesinti</td>
                  <td>14 iş günü</td>
                </tr>
                <tr>
                  <td>Kalkıştan 0-2 gün önce</td>
                  <td className="text-red-600 font-semibold">İade yapılmaz</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            * Vize masrafları, sigorta primleri ve havalimanı vergileri gibi üçüncü taraf bedelleri iade dışı kalabilir.
          </p>

          <h2>3. Otel Rezervasyonları</h2>
          <ul>
            <li><strong>Ücretsiz iptal:</strong> Giriş tarihinden 7+ gün önce yapılan iptallerde tam iade</li>
            <li><strong>Geç iptal:</strong> Giriş tarihinden 3-6 gün önce yapılan iptallerde 1 gecelik konaklama bedeli tutarında kesinti uygulanır</li>
            <li><strong>Son dakika:</strong> Giriş tarihinden 0-2 gün önce yapılan iptallerde iade yapılmaz</li>
            <li><strong>No-show (gelmeme):</strong> Bildirim yapılmadan gelinmemesi durumunda iade yapılmaz</li>
          </ul>
          <p>
            Bazı özel dönem ve kampanyalı rezervasyonlarda farklı iptal koşulları uygulanabilir.
            Bu durumlarda geçerli koşullar rezervasyon anında ayrıca belirtilir.
          </p>

          <h2>4. Transfer Hizmetleri</h2>
          <ul>
            <li>Transferden 24 saat öncesine kadar yapılan iptallerde tam iade</li>
            <li>24 saatten kısa sürede yapılan iptallerde %50 kesinti uygulanır</li>
            <li>Transfer saatinden sonraki iptallerde iade yapılmaz</li>
          </ul>

          <h2>5. Tur ve Rehber Hizmetleri</h2>
          <ul>
            <li>Turdan 48 saat öncesine kadar yapılan iptallerde tam iade</li>
            <li>48-24 saat arası iptallerde %50 kesinti</li>
            <li>24 saatten kısa sürede yapılan iptallerde iade yapılmaz</li>
            <li>Hava koşulları veya resmi kararlar nedeniyle iptal edilen turlar için tam iade yapılır</li>
          </ul>

          <h2>6. Vize İşlemleri</h2>
          <p>
            Vize hizmet bedeli, başvuru işlemi başlatıldıktan sonra iade edilmez.
            Konsolosluk harç bedelleri, konsolosluk iade politikasına tabidir.
            Vize başvurusu henüz yapılmadan iptal edilmesi halinde hizmet bedeli tam olarak iade edilir.
          </p>

          <h2>7. İade Yöntemi</h2>
          <ul>
            <li><strong>Kredi kartı ödemeleri:</strong> İade, ödemenin yapıldığı karta geri yüklenir. Bankanıza göre 1-3 ekstre döneminde hesabınıza yansır.</li>
            <li><strong>Havale/EFT ödemeleri:</strong> Belirttiğiniz banka hesabına iade yapılır.</li>
            <li><strong>Taksitli ödemeler:</strong> İade tutarı taksit sayısına bölünerek her ay karta iade edilir.</li>
          </ul>

          <h2>8. Sefernur Kaynaklı İptaller</h2>
          <p>
            Sefernur tarafından herhangi bir nedenle iptal edilen hizmetlerde tam iade yapılır.
            Ayrıca müşteriye alternatif paket veya hizmet seçeneği sunulur.
            Tedarikçi kaynaklı değişiklikler (otel değişikliği, uçuş saati vb.) durumunda müşteri bilgilendirilir ve
            kabul etmemesi halinde iade süreci başlatılır.
          </p>

          <h2>9. Mücbir Sebepler</h2>
          <p>
            Doğal afet, salgın hastalık, savaş, terör, grev, hükümet kararları gibi mücbir sebepler nedeniyle
            hizmetin ifa edilememesi durumunda:
          </p>
          <ul>
            <li>Kesintisiz tam iade yapılır veya</li>
            <li>Müşterinin tercihine bağlı olarak hizmet ileri bir tarihe ertelenir</li>
          </ul>

          <h2>10. İptal Başvurusu</h2>
          <p>İptal talebinizi aşağıdaki kanallardan iletebilirsiniz:</p>
          <ul>
            <li><strong>Platform:</strong> Hesabınızdaki &quot;Rezervasyonlarım&quot; bölümünden</li>
            <li><strong>E-posta:</strong> iptal@sefernur.com</li>
            <li><strong>Telefon:</strong> 0850 123 45 67</li>
            <li><strong>WhatsApp:</strong> +90 532 123 45 67</li>
          </ul>
          <p>
            İptal talebiniz alındıktan sonra en geç 3 iş günü içinde tarafınıza bilgilendirme yapılır.
          </p>

          <h2>11. Tüketici Hakları</h2>
          <p>
            6502 sayılı Kanun kapsamındaki haklarınız saklıdır. Şikayetleriniz için
            Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri&apos;ne başvurabilirsiniz.
            Ayrıca <a href="https://tuketici.ticaret.gov.tr" target="_blank" rel="noopener noreferrer">tuketici.ticaret.gov.tr</a> üzerinden
            online şikayet oluşturabilirsiniz.
          </p>
        </div>
      </article>
    </div>
  );
}
