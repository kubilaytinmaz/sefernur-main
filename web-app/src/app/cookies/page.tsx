import { Badge } from "@/components/ui/Badge";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <Cookie className="w-3.5 h-3.5 mr-1.5" />
            Yasal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Çerez Politikası</h1>
          <p className="mt-2 text-emerald-100 text-sm">Son güncelleme: 1 Ocak 2026</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-emerald-600">
          <h2>1. Çerez Nedir?</h2>
          <p>
            Çerezler (cookies), web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük
            metin dosyalarıdır. Çerezler, web sitemizin düzgün çalışması, deneyiminizin iyileştirilmesi ve size
            kişiselleştirilmiş içerik sunulması amacıyla kullanılmaktadır.
          </p>

          <h2>2. Kullandığımız Çerez Türleri</h2>

          <h3>2.1 Zorunlu Çerezler</h3>
          <p>
            Web sitemizin temel fonksiyonlarının çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan
            oturum açma, rezervasyon yapma ve sayfa gezinme gibi işlemler gerçekleştirilemez.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Çerez Adı</th>
                  <th>Amaç</th>
                  <th>Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Oturum yönetimi</td>
                  <td>Oturum süresi</td>
                </tr>
                <tr>
                  <td>csrf_token</td>
                  <td>Güvenlik (CSRF koruması)</td>
                  <td>Oturum süresi</td>
                </tr>
                <tr>
                  <td>cookie_consent</td>
                  <td>Çerez tercihlerinizin saklanması</td>
                  <td>1 yıl</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.2 İşlevsel Çerezler</h3>
          <p>
            Dil tercihi, para birimi seçimi ve arayüz ayarları gibi tercihlerinizi hatırlamak için kullanılır.
            Bu çerezler olmadan her ziyarette tercihlerinizi yeniden ayarlamanız gerekir.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Çerez Adı</th>
                  <th>Amaç</th>
                  <th>Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>lang</td>
                  <td>Dil tercihi</td>
                  <td>1 yıl</td>
                </tr>
                <tr>
                  <td>currency</td>
                  <td>Para birimi tercihi</td>
                  <td>30 gün</td>
                </tr>
                <tr>
                  <td>theme</td>
                  <td>Tema tercihi (açık/koyu mod)</td>
                  <td>1 yıl</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.3 Performans ve Analitik Çerezleri</h3>
          <p>
            Web sitemizin performansını ölçmek, ziyaretçi istatistiklerini analiz etmek ve hizmetlerimizi
            geliştirmek amacıyla kullanılır. Bu çerezler sizin kimliğinizi tespit etmez.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Çerez Adı</th>
                  <th>Sağlayıcı</th>
                  <th>Amaç</th>
                  <th>Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>Google Analytics</td>
                  <td>Ziyaretçi istatistikleri</td>
                  <td>2 yıl</td>
                </tr>
                <tr>
                  <td>_ga_*</td>
                  <td>Google Analytics</td>
                  <td>Oturum durumu</td>
                  <td>2 yıl</td>
                </tr>
                <tr>
                  <td>_gid</td>
                  <td>Google Analytics</td>
                  <td>Günlük ziyaretçi ayrımı</td>
                  <td>24 saat</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.4 Pazarlama Çerezleri</h3>
          <p>
            Size ilgi alanlarınıza uygun reklamlar göstermek ve reklam kampanyalarının etkinliğini ölçmek için
            kullanılır. Bu çerezler yalnızca açık rızanız ile aktif hale gelir.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Çerez Adı</th>
                  <th>Sağlayıcı</th>
                  <th>Amaç</th>
                  <th>Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_fbp</td>
                  <td>Meta (Facebook)</td>
                  <td>Reklam hedefleme</td>
                  <td>3 ay</td>
                </tr>
                <tr>
                  <td>_gcl_au</td>
                  <td>Google Ads</td>
                  <td>Dönüşüm takibi</td>
                  <td>3 ay</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Üçüncü Taraf Çerezleri</h2>
          <p>Web sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmakta olup, bu hizmetler kendi çerez politikalarına sahiptir:</p>
          <ul>
            <li><strong>Google Analytics:</strong> Web sitesi trafik analizi — <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Gizlilik Politikası</a></li>
            <li><strong>Firebase:</strong> Kimlik doğrulama ve veritabanı hizmetleri — <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase Gizlilik</a></li>
            <li><strong>OpenStreetMap:</strong> Harita gösterimi — <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">OSM Gizlilik Politikası</a></li>
          </ul>

          <h2>4. Çerez Tercihlerinizi Yönetme</h2>
          <p>
            Çerez tercihlerinizi aşağıdaki yöntemlerle yönetebilirsiniz:
          </p>
          <h3>Tarayıcı Ayarları</h3>
          <p>Tüm modern tarayıcılar, çerezleri yönetmenize olanak tanır:</p>
          <ul>
            <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</li>
            <li><strong>Firefox:</strong> Seçenekler → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
            <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri ve web sitesi verilerini yönet</li>
            <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
          </ul>
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <strong>Uyarı:</strong> Zorunlu çerezlerin devre dışı bırakılması web sitemizin düzgün çalışmasını engelleyebilir.
            Oturum açma, rezervasyon yapma ve ödeme gibi temel işlevler kullanılamaz hale gelebilir.
          </p>

          <h3>Google Analytics Devre Dışı Bırakma</h3>
          <p>
            Google Analytics tarafından veri toplanmasını istemiyorsanız{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics Opt-out Eklentisi
            </a>
            &apos;ni tarayıcınıza yükleyebilirsiniz.
          </p>

          <h2>5. Hukuki Dayanak</h2>
          <p>
            Çerez kullanımımız, 6698 sayılı KVKK, 5809 sayılı Elektronik Haberleşme Kanunu ve
            Avrupa Birliği ePrivacy Direktifi ilkeleri doğrultusunda gerçekleştirilmektedir.
            Zorunlu çerezler dışındaki çerezler yalnızca açık rızanız ile aktif hale getirilmektedir.
          </p>

          <h2>6. Politika Güncellemeleri</h2>
          <p>
            Bu Çerez Politikası, yasal değişiklikler ve hizmet güncellemeleri doğrultusunda değiştirilebilir.
            Güncellemeler web sitemizde yayınlandığı tarihte yürürlüğe girer.
          </p>

          <h2>7. İletişim</h2>
          <p>Çerez politikamıza ilişkin sorularınız için:</p>
          <ul>
            <li><strong>E-posta:</strong> kvkk@sefernur.com</li>
            <li><strong>Telefon:</strong> 0850 123 45 67</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
