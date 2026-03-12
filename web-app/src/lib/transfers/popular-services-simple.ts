// Basitleştirilmiş Popüler Hizmetler - Transfer, Tur ve Rehberler
// Tek liste, fiyatlar görünür, çoklu seçim destekli
// Fiyatlar SAR'dan TL'ye çevrilmiş (1 SAR = 9.5 TL)

export type ServiceType = 'transfer' | 'tour' | 'guide';

export interface PopularService {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
  
  // Transfer için mesafe bilgisi
  distance?: {
    km: number;
    text: string;
  };
  
  // Süre bilgisi
  duration: {
    text: string;
    hours: number; // Toplam hesaplama için
  };
  
  // Fiyat gösterimi
  price: {
    display: string; // "1.425₺+" veya "800₺"
    baseAmount: number; // Hesaplamalar için
    type: 'per_km' | 'per_person' | 'fixed';
  };
  
  // Güzergah bilgisi (araç kartlarında gösterilecek)
  route?: {
    from: string;
    to: string;
    stops?: string[]; // Ara duraklar
  };
  
  // Tur/Rehber için ek bilgiler (opsiyonel)
  tourDetails?: {
    highlights: string[]; // Ziyaret edilecek yerler
    includes: string[]; // Fiyata dahil olanlar
    minParticipants: number;
    maxParticipants: number;
    fullDescription?: string; // Tur hakkında detaylı açıklama
    stopsDescription?: { stopName: string; description: string }[]; // Her durak hakkında detaylı bilgi
  };
  
  isPopular: boolean;
}

export const POPULAR_SERVICES: PopularService[] = [
  // ══════════════════════════════════════════════════════
  // MEKKE GEZİLERİ (3 adet)
  // ══════════════════════════════════════════════════════
  {
    id: 'tour-mecca-city',
    type: 'tour',
    name: 'Mekke Şehir Turu',
    description: 'Mekke\'nin kutsal yerlerini rehberli keşfedin',
    icon: '🕌',
    duration: { text: '4 saat', hours: 4 },
    distance: { km: 45, text: '45 km' },
    price: {
      display: '800₺',
      baseAmount: 800,
      type: 'fixed',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Mekke Şehir Merkezi',
      stops: ['Cebeli Nur', 'Cebeli Sevr', 'Mina', 'Arafat', 'Müzdelife'],
    },
    tourDetails: {
      highlights: [
        'Cebeli Nur (Hira Mağarası)',
        'Cebeli Sevr',
        'Mina, Arafat, Müzdelife',
        'Cehennem Vadisi',
        'Şeytan Taşlama Yeri',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 4,
      maxParticipants: 40,
      fullDescription: 'Mekke\'nin en kutsal ve tarihi yerlerini kapsayan bu turda, İslam tarihinin önemli dönüm noktalarını ziyaret edeceksiniz. Peygamber Efendimiz\'in (s.a.v.) ilk vahyi aldığı Hira Mağarası\'ndan, hac ibadetinin yapıldığı Arafat, Mina ve Müzdelife\'ye kadar tüm kutsal mekanları rehber eşliğinde keşfedin.',
      stopsDescription: [
        { stopName: 'Cebeli Nur (Hira Mağarası)', description: 'Peygamber Efendimiz\'in (s.a.v.) ilk vahyi aldığı kutsal mağara. 610 metre yükseklikteki bu dağa tırmanarak manzarayı izleyebilir, ilk vahiy anının önemini rehberinizden dinleyebilirsiniz.' },
        { stopName: 'Cebeli Sevr', description: 'Hicret sırasında Peygamber Efendimiz\'in (s.a.v.) saklandığı mağara. İslam tarihinin en önemli dönüm noktalarından biridir.' },
        { stopName: 'Mina Çadır Kenti', description: 'Hac ibadeti sırasında hacıların konakladığı yer. Şeytan taşlama alanını ve cemre yerlerini görerek hac ibadetinin nasıl yapıldığını öğrenebilirsiniz.' },
        { stopName: 'Arafat Vakfesi Yeri', description: 'Hacın farz olduğu Arafat meydanı. Arafat gününde milyonlarca hacının toplandığı bu kutsal topraklarda vakfe yapmanın önemini öğreneceksiniz.' },
        { stopName: 'Müzdelife', description: 'Arafat ile Mina arasında bulunan, hacıların Arafat\'tan sonra toplu dua ettikleri ve taş topladıkları kutsal bölge.' },
      ],
    },
    isPopular: true,
  },
  {
    id: 'guide-cebeli-nur',
    type: 'guide',
    name: 'Cebeli Nur (Hira Mağarası)',
    description: 'İlk vahyin indiği kutsal mağarayı ziyaret edin',
    icon: '⛰️',
    duration: { text: '3 saat', hours: 3 },
    distance: { km: 15, text: '15 km' },
    price: {
      display: '600₺',
      baseAmount: 600,
      type: 'fixed',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Cebeli Nur',
      stops: ['Hira Mağarası', 'Manzara noktaları'],
    },
    tourDetails: {
      highlights: [
        'Hira Mağarası ziyareti',
        'Cebeli Nur tırmanışı',
        'Mekke manzarası',
        'Tarihi anlatımlar',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı'],
      minParticipants: 4,
      maxParticipants: 30,
      fullDescription: 'İlk vahyin indiği kutsal topraklarda manevi bir yolculuğa çıkın. Cebeli Nur Dağı\'na tırmanarak Hira Mağarası\'nı ziyaret edecek, Peygamber Efendimiz\'in (s.a.v.) hicret öncesi burada nasıl ibadet ettiğini öğreneceksiniz. Mekke\'nin eşsiz manzarasını seyrederken İslam tarihinin en önemli anları hakkında detaylı bilgi alacaksınız.',
      stopsDescription: [
        { stopName: 'Hira Mağarası', description: '610 metre yükseklikteki Cebeli Nur Dağı\'nda, Peygamber Efendimiz\'in (s.a.v.) ilk vahyi aldığı kutsal mağara. Mağaraya girerek vahiy anının atmosferini hissedebilirsiniz.' },
        { stopName: 'Cebeli Nur Zirvesi', description: 'Mekke\'nin panoramik manzarasını izleyebileceğiniz en iyi nokta. Kabe\'yi uzaktan görme fırsatı ve fotoğraf molası.' },
        { stopName: 'Manzara Noktaları', description: 'Mekke şehrinin modern siluetini ve tarihi dokusunu aynı anda görebileceğiniz özel manzara terasları.' },
      ],
    },
    isPopular: true,
  },
  {
    id: 'tour-arafat-mina',
    type: 'tour',
    name: 'Arafat-Mina-Müzdelife',
    description: 'Hac ibadetinin yapıldığı kutsal yerleri gezin',
    icon: '🕋',
    duration: { text: '5 saat', hours: 5 },
    distance: { km: 60, text: '60 km' },
    price: {
      display: '850₺',
      baseAmount: 850,
      type: 'fixed',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Müzdelife',
      stops: ['Arafat Vakfesi', 'Mina Çadır Kenti', 'Cemre'],
    },
    tourDetails: {
      highlights: [
        'Arafat Vakfesi Yeri',
        'Mina Çadır Kenti',
        'Müzdelife',
        'Cemre (Şeytan Taşlama)',
        'Hac ibadeti anlatımı',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Öğle yemeği', 'Su ikramı'],
      minParticipants: 6,
      maxParticipants: 40,
      fullDescription: 'Hac ibadetinin yapıldığı kutsal mekanları kapsayan bu turda, İslam\'ın beş şartından biri olan hacın nasıl yerine getirildiğini yerinde öğrenme fırsatı bulacaksınız. Arafat\'ta vakfenin önemini, Mina\'da şeytan taşlamayı ve Müzdelife\'de toplanma heyecanını deneyimleyin.',
      stopsDescription: [
        { stopName: 'Arafat Vakfesi Yeri', description: 'Hacın farz olduğu Arafat meydanı. "Arafat günü"nde milyonlarca hacının burada toplandığını ve vakfe yaptığını öğrenin. Rahmet kapılarının ardına kadar açıldığı bu mukaddes topraklarda dua edin.' },
        { stopName: 'Mina Çadır Kenti', description: 'Hac ibadeti sırasında hacıların konakladığı dev çadır kenti. Şeytan taşlama alanını ve üç cemre yerini görerek, bu ibadetin nasıl yapıldığını yerinde öğrenin.' },
        { stopName: 'Cemre (Şeytan Taşlama) Yeri', description: 'İbrahim Peygamber\'in şeytanla karşılaştığı ve taşladığı yer. Hacın en önemli ritüellerinden biri olan şeytan taşlama alanını ziyaret edin.' },
        { stopName: 'Müzdelife', description: 'Arafat ile Mina arasında bulunan kutsal bölge. Hacıların Arafat\'tan sonra burada toplu dua ettiğini ve taş topladığını öğrenin.' },
      ],
    },
    isPopular: true,
  },

  // ══════════════════════════════════════════════════════
  // MEDİNE GEZİLERİ (3 adet)
  // ══════════════════════════════════════════════════════
  {
    id: 'tour-medina-city',
    type: 'tour',
    name: 'Medine Şehir Turu',
    description: 'Medine\'nin kutsal yerlerini rehberli gezin',
    icon: '🕌',
    duration: { text: '5 saat', hours: 5 },
    distance: { km: 55, text: '55 km' },
    price: {
      display: '900₺',
      baseAmount: 900,
      type: 'fixed',
    },
    route: {
      from: 'Medine Otel',
      to: 'Medine Şehir Merkezi',
      stops: ['Uhud Dağı', 'Kıble Camii', 'Kuba Camii', 'Seb\'a Mescitleri', 'Bedir'],
    },
    tourDetails: {
      highlights: [
        'Uhud Dağı ve Şehitleri',
        'Kıble Camii',
        'Kuba Camii',
        'Seb\'a Mescitleri',
        'Bedir Savaş Alanı',
        'Hendek Savaşı',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 4,
      maxParticipants: 40,
      fullDescription: 'Medine\'nin kutsal topraklarında İslam tarihinin en önemli savaş alanlarını ve mescitlerini ziyaret edin. Uhud Savaşı\'nın şehitlerini yad edecek, Kıble değişikliğinin yapıldığı Kıble Camii\'ni ve ilk mescit olan Kuba Camii\'ni göreceksiniz.',
      stopsDescription: [
        { stopName: 'Uhud Dağı', description: 'Uhud Savaşı\'nın yapıldığı tarihi dağ. Savaş alanını gezerken Uhud Savaşı\'nın detaylarını ve şehitlerin hikayelerini rehberinizden dinleyin.' },
        { stopName: 'Şehitler Mezarlığı', description: 'Uhud Savaşı\'nda şehit düşen sahabelerin mezarlığı. Hz. Hamza\'nın (r.a.) da bulunduğu bu mukaddes mezarlığı ziyaret ederek şehitleri anın.' },
        { stopName: 'Kıble Camii', description: 'Kıble yönünün Kudüs\'ten Mekke\'ye çevrildiği ilk mescit. Peygamber Efendimiz\'in (s.a.v.) burada namaz kıldığı sırada vahiy gelerek kıble değişikliğinin yapıldığı yer.' },
        { stopName: 'Kuba Camii', description: 'İslam tarihinin ilk mescidi. Peygamber Efendimiz\'in (s.a.v.) Medine\'ye hicret ederken burada cuma namazı kıldığı için "Kuba Cuma" olarak da bilinir.' },
        { stopName: 'Seb\'a Mescitleri', description: 'Peygamber Efendimiz\'in (s.a.v.) hicret yolunda konakladığı yedi mescitten kalanlar. Her birinin farklı bir hikayesi vardır.' },
        { stopName: 'Bedir Savaş Alanı', description: 'İslam tarihinin ilk büyük savaşı olan Bedir Savaşı\'nın yapıldığı yer. 3 müslüman şehidin defnedildiği alanı ziyaret edin.' },
      ],
    },
    isPopular: true,
  },
  {
    id: 'tour-date-gardens',
    type: 'tour',
    name: 'Hurma Bahçeleri Gezisi',
    description: 'Medine\'nin meşhur hurma bahçelerini gezin',
    icon: '🌴',
    duration: { text: '3 saat', hours: 3 },
    distance: { km: 25, text: '25 km' },
    price: {
      display: '500₺',
      baseAmount: 500,
      type: 'fixed',
    },
    route: {
      from: 'Medine Otel',
      to: 'Hurma Bahçeleri',
      stops: ['Hurma üretim çiftlikleri', 'Tadım istasyonları'],
    },
    tourDetails: {
      highlights: [
        'Medine hurma bahçeleri',
        'Hurma çeşitleri tanıtımı',
        'Hurma tatımı',
        'Yerel üretici ziyareti',
        'Hurma alışverişi',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Hurma tatımı', 'Su ikramı'],
      minParticipants: 4,
      maxParticipants: 30,
      fullDescription: 'Medine\'nin meşhur hurma bahçelerinde doğal bir keşif turuna çıkın. Binlerce hurma ağacının arasında yürürken, Medine hurmasının neden bu kadar özel olduğunu öğreneceksiniz. Yerel üreticilerle tanışacak, farklı hurma çeşitlerini tadacak ve en taze hurmaları satın alma fırsatı bulacaksınız.',
      stopsDescription: [
        { stopName: 'Hurma Üretim Çiftlikleri', description: 'Modern tarım teknikleriyle yetiştirilen hurma ağaçlarını göreceğiniz dev çiftlikler. Hurma yetiştiriciliği hakkında detaylı bilgi alın.' },
        { stopName: 'Tadım İstasyonları', description: 'Ajva, Medine, Safavi gibi farklı hurma çeşitlerini tadabileceğiniz özel istasyonlar. Her birinin lezzetini ve özelliklerini öğrenin.' },
        { stopName: 'Yerel Üretici Ziyareti', description: 'Kuşaklar boyu hurma üretimi yapan ailelerle tanışma fırsatı. Geleneksel üretim yöntemlerini ve hurmanın İslam kültüründeki önemini dinleyin.' },
        { stopName: 'Hurma Alışveriş Merkezi', description: 'En taze ve kaliteli hurmaları uygun fiyatlarla satın alabileceğiniz satış noktaları. Hediyelik paketler ve toptan alım imkanı.' },
      ],
    },
    isPopular: true,
  },
  {
    id: 'guide-uhud-mountain',
    type: 'guide',
    name: 'Uhud Dağı ve Şehitleri',
    description: 'Uhud Savaşı\'nın geçtiği tarihi yerleri ziyaret edin',
    icon: '⛰️',
    duration: { text: '2.5 saat', hours: 2.5 },
    distance: { km: 20, text: '20 km' },
    price: {
      display: '450₺',
      baseAmount: 450,
      type: 'fixed',
    },
    route: {
      from: 'Medine Otel',
      to: 'Uhud Dağı',
      stops: ['Şehitler Mezarlığı', 'Hz. Hamza Kabri'],
    },
    tourDetails: {
      highlights: [
        'Uhud Dağı',
        'Şehitler Mezarlığı',
        'Hz. Hamza Kabri',
        'Uhud Savaşı anlatımı',
        'Peygamber Efendimiz\'in yaralandığı yer',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Tarihi anlatım', 'Su ikramı'],
      minParticipants: 4,
      maxParticipants: 30,
      fullDescription: 'Uhud Savaşı\'nın yapıldığı kutsal topraklarda tarihi bir yolculuğa çıkın. Uhud Dağı\'na tırmanarak savaş alanını kuşbakışı izleyecek, şehitler mezarlığını ziyaret ederek İslam tarihinin en önemli savaşlarından birini yerinde öğreneceksiniz.',
      stopsDescription: [
        { stopName: 'Uhud Dağı', description: 'Uhud Savaşı\'nın yapıldığı tarihi dağ. Dağın zirvesine tırmanarak savaş alanını panoramik olarak görün ve savaşın stratejik detaylarını öğrenin.' },
        { stopName: 'Şehitler Mezarlığı', description: 'Uhud Savaşı\'nda şehit düşen 70 sahabe için yapılmış olan mukaddes mezarlık. Hz. Hamza\'nın (r.a.) mezarını ziyaret edin ve şehitlerin hikayelerini dinleyin.' },
        { stopName: 'Hz. Hamza Kabri', description: 'Peygamber Efendimiz\'in (s.a.v.) amcası ve "Allah\'ın Aslanı" olarak bilinen Hz. Hamza\'nın (r.a.) mezarı. Özel bir ziyaret alanı olarak ayrılmıştır.' },
        { stopName: 'Savaş Anlatım Alanı', description: 'Uhud Savaşı\'nın detaylı anlatıldığı ve görsellerle desteklendiği eğitim alanı. Savaşın nedenleri, gelişimi ve sonuçları hakkında kapsamlı bilgi alın.' },
      ],
    },
    isPopular: true,
  },

  // ══════════════════════════════════════════════════════
  // MEKKE VE MEDİNE'DE (2 adet)
  // ══════════════════════════════════════════════════════
  {
    id: 'tour-taif',
    type: 'tour',
    name: 'Taif Günübirlik Turu',
    description: 'Taif\'in tarihi ve doğal güzelliklerini keşfedin',
    icon: '🏔️',
    duration: { text: 'Tam gün (8 saat)', hours: 8 },
    distance: { km: 180, text: '180 km' },
    price: {
      display: '1.200₺',
      baseAmount: 1200,
      type: 'fixed',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Taif',
      stops: ['Gül Bahçeleri', 'Şifa Bahçeleri', 'Taif Kalesi', 'Yerel Pazar'],
    },
    tourDetails: {
      highlights: [
        'Taif Gül Bahçeleri',
        'Şifa Bahçeleri',
        'Taif Kalesi',
        'Abdullah ibn Abbas Türbesi',
        'Yerel pazar ziyareti',
        'Hurma ve bal alışverişi',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Öğle yemeği', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 6,
      maxParticipants: 40,
      fullDescription: 'Mekke\'nin 180 km güneydoğusunda, 2000 metre yükseklikteki Taif şehrinde gün boyunca doğal ve tarihi bir keşif turuna çıkın. "Hicaz\'ın gülü" olarak bilinen Taif\'in serin ikliminde gül bahçelerini gezecek, tarihi kaleyi ziyaret edecek ve yerel pazarlarda alışveriş yapacaksınız.',
      stopsDescription: [
        { stopName: 'Taif Gül Bahçeleri', description: 'Yılda milyonlarca gül üretimi yapılan ve dünyaca ünlü Taif gülünün yetiştiği bahçeler. Gül hasadı döneminde gül toplama deneyimi yaşayabilirsiniz.' },
        { stopName: 'Şifa Bahçeleri', description: 'Kur\'an\'da adı geçen Şifa vadisindeki tarihi bahçeler. Peygamber Efendimiz\'in (s.a.v.) Taif\'e gelişinde burada konakladığı rivayet edilir.' },
        { stopName: 'Taif Kalesi', description: '6. yüzyılda inşa edilen tarihi kale. Şehrin panoramik manzarasını izleyebileceğiniz en iyi nokta. Osmanlı döneminden kalma mimari özellikleri görün.' },
        { stopName: 'Abdullah ibn Abbas Türbesi', description: 'Peygamber Efendimiz\'in (s.a.v.) amcası oğlu ve tefsir ilminin öncülerinden Abdullah ibn Abbas\'ın (r.a.) türbesi. Ziyaret alanı olarak düzenlenmiştir.' },
        { stopName: 'Yerel Pazar', description: 'Taif\'in meşhur gül suyu, hurması ve balını satın alabileceğiniz geleneksel pazar. El sanatları ve hediyelik eşyalar da bulunur.' },
      ],
    },
    isPopular: true,
  },
  {
    id: 'tour-jeddah-coast',
    type: 'tour',
    name: 'Cidde Kızıldeniz Sahili',
    description: 'Kızıldeniz sahilinde gün batımı ve modern Cidde',
    icon: '🌊',
    duration: { text: '4 saat', hours: 4 },
    distance: { km: 160, text: '160 km' },
    price: {
      display: '750₺',
      baseAmount: 750,
      type: 'fixed',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Cidde',
      stops: ['Kızıldeniz Sahili', 'Cidde Çeşmesi', 'Corniche', 'Al-Balad'],
    },
    tourDetails: {
      highlights: [
        'Kızıldeniz sahili',
        'Cidde Çeşmesi',
        'Corniche gezisi',
        'Gün batımı manzarası',
        'Modern alışveriş merkezleri',
        'Al-Balad (Tarihi Cidde)',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 6,
      maxParticipants: 40,
      fullDescription: 'Suudi Arabistan\'ın modern yüzü Cidde\'de Kızıldeniz sahilinden tarihi Al-Balad mahallesine kadar kapsamlı bir tur. Dünyanın en yüksek çeşmesi olan Cidde Çeşmesi\'ni, UNESCO mirası olan tarihi evleri ve modern alışveriş merkezlerini ziyaret edin.',
      stopsDescription: [
        { stopName: 'Kızıldeniz Sahili', description: 'Cidde\'nin 30 km uzunluğundaki sahil şeridi. Yürüyüş yapabilir, deniz manzarasının tadını çıkarabilirsiniz.' },
        { stopName: 'Cidde Çeşmesi', description: 'Dünyanın en yüksek çeşmesi (312 metre). Özellikle geç ışık gösterileriyle harika bir görüntü sunar. Fotoğraf molası verilir.' },
        { stopName: 'Corniche', description: 'Kızıldeniz kıyısındaki ünlü caddesi. Palmiyeler, parklar ve kafelerle süslü bu caddede yürüyüş yapabilirsiniz.' },
        { stopName: 'Gün Batımı Manzarası', description: 'Kızıldeniz\'in üzerindeki gün batımını izleyebileceğiniz en iyi noktalar. Fotoğraf tutkunları için ideal.' },
        { stopName: 'Al-Balad (Tarihi Cidde)', description: 'UNESCO Dünya Mirası listesindeki tarihi mahalle. 7. yüzyıldan kalma evler, dar sokaklar ve geleneksel mimari. "Roshan" denilen ahşap balkonları görün.' },
        { stopName: 'Modern Alışveriş Merkezleri', description: 'Cidde\'nin lüks alışveriş merkezleri. Uluslararası markalar ve yerel butikler bulunur. Alışveriş molası verilir.' },
      ],
    },
    isPopular: true,
  },
];

// Yardımcı fonksiyonlar

export function getServiceById(id: string): PopularService | undefined {
  return POPULAR_SERVICES.find(service => service.id === id);
}

export function getServicesByType(type: ServiceType): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.type === type);
}

export function getPopularServices(): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.isPopular);
}

export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    transfer: 'Transfer',
    guide: 'Rehber',
    tour: 'Tur',
  };
  return labels[type];
}

export function getServiceTypeColor(type: ServiceType): string {
  const colors: Record<ServiceType, string> = {
    transfer: 'blue', // Mavi tonlar
    tour: 'orange', // Turuncu tonlar
    guide: 'purple', // Mor tonlar
  };
  return colors[type];
}
