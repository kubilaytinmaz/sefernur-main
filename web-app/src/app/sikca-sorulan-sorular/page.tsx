"use client";

import { Badge } from "@/components/ui/Badge";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Rezervasyon & Paketler",
    items: [
      {
        q: "Umre paketi nasıl rezerve edebilirim?",
        a: 'Sefernur web sitesi veya mobil uygulamamız üzerinden istediğiniz paketi seçip "Rezervasyon Yap" butonuna tıklayarak kolayca rezervasyon oluşturabilirsiniz. Alternatif olarak 0850 123 45 67 numaralı telefonumuzdan veya WhatsApp hattımızdan da destek alabilirsiniz.',
      },
      {
        q: "Rezervasyonumu iptal edebilir miyim?",
        a: "Evet, kalkış tarihinden 15 gün öncesine kadar ücretsiz iptal hakkınız bulunmaktadır. 15 günden kısa sürede yapılan iptallerde koşullara göre kesinti uygulanabilir. Detaylı iade politikamız için sözleşme koşullarını inceleyebilirsiniz.",
      },
      {
        q: "Paket fiyatlarına neler dahildir?",
        a: "Standart paketlerimize uçak bileti, otel konaklaması, havalimanı transferi ve vize işlemleri dahildir. Tur ve rehber hizmetleri seçilen pakete göre değişebilir. Her paketin detay sayfasında dahil olan hizmetler açıkça belirtilmektedir.",
      },
      {
        q: "Grup rezervasyonu yapabilir miyim?",
        a: "Evet, 10 ve üzeri kişilik gruplar için özel fiyatlandırma ve düzenleme yapılmaktadır. Grup rezervasyonları için iletişim sayfamız üzerinden bizimle iletişime geçebilirsiniz.",
      },
    ],
  },
  {
    title: "Ödeme & Fiyatlandırma",
    items: [
      {
        q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        a: "Kredi kartı (Visa, Mastercard, Troy), banka havalesi/EFT ve kapıda ödeme seçeneklerimiz mevcuttur. Kredi kartına taksit imkânı da sunulmaktadır.",
      },
      {
        q: "Taksitle ödeme yapabilir miyim?",
        a: "Evet, anlaşmalı bankalar üzerinden 3, 6 ve 9 taksit seçenekleri sunulmaktadır. Taksit oranları banka ve kart tipine göre değişebilir.",
      },
      {
        q: "Fiyatlar Türk Lirası mı, Dolar mı?",
        a: "Paket fiyatlarımız hem TL hem USD olarak gösterilmektedir. Ödemelerinizi Türk Lirası üzerinden yapabilirsiniz; USD karşılığı bilgilendirme amaçlıdır.",
      },
    ],
  },
  {
    title: "Vize & Pasaport",
    items: [
      {
        q: "Umre vizesi için hangi belgeler gerekli?",
        a: "Geçerli pasaport (en az 6 ay süreli), 2 adet biyometrik fotoğraf, menenjit aşı belgesi ve doldurulmuş vize başvuru formu gerekmektedir. Kadın adaylar için ek olarak mahrem refakatçi bilgisi istenmektedir.",
      },
      {
        q: "Vize işlemlerini siz mi yapıyorsunuz?",
        a: "Evet, paketlerimize vize işlemleri dahildir. Gerekli belgeleri bize ilettikten sonra vize sürecinizi biz takip ediyoruz. Ortalama vize süresi 5-7 iş günüdür.",
      },
      {
        q: "Pasaportumun süresi ne kadar olmalı?",
        a: "Pasaportunuzun seyahat tarihinizden itibaren en az 6 ay geçerli olması gerekmektedir. Süresi dolmak üzere olan pasaportlar için yenileme işlemini önceden yapmanızı tavsiye ederiz.",
      },
    ],
  },
  {
    title: "Ulaşım & Transfer",
    items: [
      {
        q: "Havalimanı transferi dahil mi?",
        a: "Evet, standart paketlerimizde Cidde ya da Medine havalimanından otelinize VIP transfer dahildir. İsterseniz ek olarak şehirlerarası transfer hizmeti de alabilirsiniz.",
      },
      {
        q: "Mekke-Medine arası ulaşım nasıl sağlanıyor?",
        a: "Klimalı ve konforlu VIP araçlarla Mekke-Medine arası transfer yapılmaktadır. Yaklaşık 4-4.5 saatlik yolculuk sırasında mola verilmektedir.",
      },
    ],
  },
  {
    title: "Konaklama & Oteller",
    items: [
      {
        q: "Oteller Harem'e ne kadar uzaklıkta?",
        a: "Paket tipine göre otellerimiz Harem-i Şerif'e yürüme mesafesinde (100-500m) ya da ücretsiz servis güzergâhında yer almaktadır. Premium paketlerde Harem manzaralı odalar sunulmaktadır.",
      },
      {
        q: "Otel değişikliği yapabilir miyim?",
        a: "Müsaitlik durumuna göre otel yükseltmesi veya değişikliği yapılabilir. Fark tutarı oluşması durumunda ek ücret talep edilebilir.",
      },
      {
        q: "Otellerde kahvaltı var mı?",
        a: "Paketlerimizin büyük çoğunluğunda açık büfe kahvaltı dahildir. Yarım pansiyon ve tam pansiyon seçenekleri de mevcuttur.",
      },
    ],
  },
  {
    title: "Sağlık & Hazırlık",
    items: [
      {
        q: "Umre için hangi aşılar gerekli?",
        a: "Menenjit (meningokok) aşısı zorunludur ve seyahatten en az 10 gün önce yaptırılmalıdır. Ayrıca mevsimsel grip aşısı önerilmektedir. Aşı belgesi vize başvurusu için gereklidir.",
      },
      {
        q: "Yanıma ne almalıyım?",
        a: "İhram (erkekler için), rahat yürüyüş ayakkabısı, güneş kremi, şapka/şemsiye, kişisel ilaçlar ve küçük boy seccade önerilir. Detaylı hazırlık listemiz için mobil uygulamamızdaki rehber bölümünü inceleyebilirsiniz.",
      },
    ],
  },
];

function Accordion({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-4 px-1 group"
      >
        <span className="font-medium text-slate-800 text-sm pr-4 group-hover:text-emerald-700 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 px-1 text-sm text-slate-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search.trim()) return FAQ_SECTIONS;
    const term = search.toLowerCase();
    return FAQ_SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter(
        (it) =>
          it.q.toLowerCase().includes(term) ||
          it.a.toLowerCase().includes(term)
      ),
    })).filter((s) => s.items.length > 0);
  }, [search]);

  function toggleItem(key: string) {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            Yardım Merkezi
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight">
            Sık Sorulan Sorular
          </h1>
          <p className="mt-3 text-emerald-100 max-w-xl text-lg">
            Umre yolculuğunuz hakkında en çok merak edilen soruları yanıtladık.
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Soru ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-emerald-200 text-sm focus:ring-2 focus:ring-white/30 focus:border-white/30 outline-none"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              &quot;{search}&quot; ile eşleşen soru bulunamadı
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-sm text-emerald-600 hover:underline"
            >
              Aramayı temizle
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSections.map((section, si) => (
              <div key={si}>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
                  {section.title}
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 px-5 divide-y divide-slate-100">
                  {section.items.map((item, qi) => {
                    const key = `${si}-${qi}`;
                    return (
                      <Accordion
                        key={key}
                        q={item.q}
                        a={item.a}
                        isOpen={!!openMap[key]}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="font-semibold text-emerald-900 text-lg">
            Sorunuz burada yok mu?
          </h3>
          <p className="text-sm text-emerald-700 mt-2 max-w-md mx-auto">
            İletişim sayfamız üzerinden bize yazabilir veya WhatsApp hattımızdan
            anında destek alabilirsiniz.
          </p>
          <a
            href="/iletisim"
            className="mt-4 inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Bize Ulaşın
          </a>
        </div>
      </section>
    </div>
  );
}
