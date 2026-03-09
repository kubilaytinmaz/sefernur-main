import { PlaceModel } from "@/types/place";

/**
 * Statik Places Verileri
 * SEO uyumlu Mekke ve Medine gezilecek yerleri
 * Kaynak: scripts/SEO-PLACES-CONTENT.md
 * Fotoğraflar: Unsplash (Kabe/Mescid-i Haram ve Mescid-i Nebevi odaklı)
 */

export const staticPlaces: PlaceModel[] = [
  // ==================== MEKKE PLACES ====================
  {
    id: "kabe-i-muazzama",
    title: "Kabe-i Muazzama - Müslümanların Kıblesi ve Umre Hac Merkezi",
    shortDescription: "İslam dünyasının kalbi Kabe, umre ve hac ibadetinin en önemli noktasıdır.",
    longDescription: "Kabe-i Muazzama, Mekke'nin merkezinde yer alan ve Müslümanların namaz kılarken yöneldikleri kutsal yapıdır. Hz. İbrahim ve Hz. İsmail tarafından inşa edilmiştir. Umre ve hac ibadeti sırasında Kabe'nin etrafında yedi tur tavaf yapılır. Hacerü'l-Esved (Kara Taş) Kabe'nin doğu köşesinde bulunur ve tavaf buradan başlar.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Kaaba,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "mescid-i-haram",
    title: "Mescid-i Haram - Dünyanın En Büyük ve Kutsal Camii",
    shortDescription: "Kabe'yi çevreleyen Mescid-i Haram, dünyanın en büyük camiidir.",
    longDescription: "Mescid-i Haram (Kutsal Mescit), Kabe-i Muazzama'yı çevreleyen ve dünyanın en kutsal mescidi olan yapıdır. 400,800 metrekare kapalı alanı ve 9 minaresi ile dünyanın en büyük camisi unvanını taşır. Burada kılınan namazın sevabı, diğer yerlere göre 100,000 kat fazladır.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Masjid+al-Haram,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "safa-merve",
    title: "Safa ve Merve Tepeleri - Sa'y İbadeti",
    shortDescription: "Umre ve hacda sa'y ibadeti Safa ve Merve tepeleri arasında yapılır.",
    longDescription: "Safa ve Merve, Mescid-i Haram içinde yer alan ve sa'y ibadeti için kullanılan iki tepedir. Hz. Hacer'in oğlu Hz. İsmail için su ararken bu iki tepe arasında koşması, sa'y ibadetinin temelini oluşturur. Tavafın ardından yapılan sa'y ibadeti, Safa ve Merve arasında 7 kez gidip gelmekten ibarettir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Al-Safa+Al-Marwah,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "arafat-dagi",
    title: "Arafat Dağı - Hac Vakfesi ve Cebel-i Rahme",
    shortDescription: "Haccın en önemli rüknü olan vakfe ibadeti Arafat'ta yapılır.",
    longDescription: "Arafat (Cebel-i Rahme), Mekke'nin 20 km doğusunda yer alan ve hac ibadetinin en önemli rüknünün yerine getirildiği dağdır. Zilhicce ayının 9. günü burada vakfe yapılır. 'El-Hacc-u Arafat' hadisi, Arafat'ın önemini vurgular. Hz. Peygamber'in Veda Hutbesi'nin okunduğu yerdir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Mount+Arafat",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "mina",
    title: "Mina - Çadırlar Şehri ve Şeytan Taşlama",
    shortDescription: "Hac ibadeti sırasında hacıların konakladığı Mina, şeytan taşlama ritüelinin yapıldığı yerdir.",
    longDescription: "Mina, Mekke'nin 5 km doğusunda bulunan ve hac günlerinde milyonlarca hacının konakladığı vadidir. Haccın 3 günü burada geçirilir. Üç cemre (küçük, orta ve büyük Cemre/Akabe) bulunur. Her cemreye 7 taş atılır. 100,000'den fazla klimatize çadır mevcuttur.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Mina,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "muzdelife",
    title: "Müzdelife - Arafat ve Mina Arasında Dinlenme Yeri",
    shortDescription: "Arafat'tan Mina'ya giderken hacıların konakladığı Müzdelife.",
    longDescription: "Müzdelife (Müşerref), Arafat ile Mina arasında yer alan ve hacıların Arafat vakfesinden sonra Mina'ya geçmeden önce konakladıkları vadiidir. Burada akşam ve yatsı namazları birleştirilerek kılınır.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Muzdalifah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "cennetul-mualla",
    title: "Cennetü'l Mualla - Hz. Hatice ve Sahabelerin Kabirleri",
    shortDescription: "Mekke'de bulunan ve Hz. Hatice, Hz. Ebu Bekir, Hz. Ömer ve birçok sahabinin kabirlerinin bulunduğu kutsal kabristanlık.",
    longDescription: "Cennetü'l Mualla (Yüce Cennet), Mekke'de bulunan ve İslam tarihinin önemli şahsiyetlerinin gömülü olduğu kutsal kabristanlıktır. Hz. Peygamber'in eşi Hz. Hatice, ilk halife Hz. Ebu Bekir ve ikinci halife Hz. Ömer burada medfundur. Sabah ve ikindi namazı sonrası ziyarete açıktır.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Jannat+al-Mualla,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "hacerul-esved",
    title: "Hacerü'l-Esved - Kabe'nin Kara Taşı",
    shortDescription: "Kabe'nin doğu köşesinde bulunan Hacerü'l-Esved, tavafın başlangıç noktasıdır.",
    longDescription: "Hacerü'l-Esved, Kabe'nin doğu köşesinde bulunan ve tavafın başlangıç noktası olan kutsal taştır. Hz. İbrahim tarafından Kabe'nin inşası sırasında yerine konmuştur. Cennetin bir parçası olduğuna inanılır. Tavaf ibadeti Hacerü'l-Esved'den başlar.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Kaaba,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "makam-i-ibrahim",
    title: "Makam-ı İbrahim - Hz. İbrahim'in Ayak İzi",
    shortDescription: "Kabe'nin önünde bulunan ve Hz. İbrahim'in Kabe'yi inşa ederken ayak bastığı yer.",
    longDescription: "Makam-ı İbrahim, Kabe'nin yaklaşık 10 metre önünde bulunan ve Hz. İbrahim'in Kabe'yi inşa ederken ayak bastığı yer olarak bilinen kutsal bir taş yapıdır. Üzerinde ayak izleri bulunur. Arkasında iki rekat namaz kılmak sünnettir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Maqam+Ibrahim,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "zemzem-kuyusu",
    title: "Zemzem Kuyusu - Mekke'nin Kutsal Suyu",
    shortDescription: "Hz. İsmail'in ayağının vurduğu yerden fışkıran Zemzem suyu, binlerce yıldır akmaktadır.",
    longDescription: "Zemzem, Mescid-i Haram içinde bulunan ve Hz. İsmail'in ayağının vurduğu yerden fışkıran kutsal bir su kaynağıdır. Bu su, binlerce yıldır akmaktadır ve hiç kurumaz. Hz. Peygamber, Zemzem suyunun hangi niyetle içilirse o niyete fayda vereceğini belirtmiştir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Zamzam+Well,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "multazem",
    title: "Multazem - Duaların Kabul Olduğu Yer",
    shortDescription: "Kabe ile Makam-ı İbrahim arasında bulunan Multazem, duaların kabul olduğu yer olarak bilinir.",
    longDescription: "Multazem, Kabe ile Makam-ı İbrahim arasında bulunan yaklaşık 2 metrelik alandır. Burada yapılan duaların kabul olduğuna inanılır. Hz. Peygamber ve sahabeler sık sık burada dua etmişlerdir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Multazam,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "cirane",
    title: "Cirane - Hz. Hacer ve Hz. İsmail'in Kabri",
    shortDescription: "Mekke'de bulunan ve Hz. Hacer ile Hz. İsmail'in kabirlerinin bulunduğu yerdir.",
    longDescription: "Cirane, Mekke'nin kuzeyinde bulunan ve Hz. Hacer ile oğlu Hz. İsmail'in gömülü olduğu yerdir. Hz. İbrahim'in eşi Hz. Hacer, oğlu Hz. İsmail ile birlikte buraya defnedilmiştir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Hijr+Ismail,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "mescid-i-cin",
    title: "Mescid-i Cin - Cinlerin İbadet Ettiği Yer",
    shortDescription: "Hz. Peygamber'in cinlere hitap ettiği Mescid-i Cin, Mekke'de önemli bir ziyaret noktasıdır.",
    longDescription: "Mescid-i Cin, Mekke'de bulunan ve Hz. Peygamber'in cinlere hitap ettiği yerdir. Kur'an-ı Kerim'de Cin Suresi bu mescitte inmiştir. Cinler burada İslam'ı kabul etmişlerdir.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Masjid+Jinn,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "hatice-camii",
    title: "Hatice Camii - Hz. Hatice'nin Evi",
    shortDescription: "Hz. Peygamber'in eşi Hz. Hatice'nin evi olan ve İslam'ın ilk evi olarak bilinen yerde inşa edilmiştir.",
    longDescription: "Hatice Camii, Hz. Peygamber'in eşi Hz. Hatice'nin evinin bulunduğu yerde inşa edilmiştir. İslam'ın ilk evi olarak kabul edilir. Hz. Peygamber, vahiy aldığı ilk ev burasıdır.",
    city: "mekke",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Khadijah+Mosque,Makkah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // ==================== MEDİNE PLACES ====================
  {
    id: "mescid-i-nebevi",
    title: "Mescid-i Nebevi - Peygamber Camii ve Ravza-i Mutahhara",
    shortDescription: "Hz. Muhammed'in kabr-i şerifi ve Ravza-i Mutahhara'nın bulunduğu Mescid-i Nebevi, İslam'ın ikinci en kutsal mescididir.",
    longDescription: "Mescid-i Nebevi (Peygamber Camii), Hz. Muhammed (s.a.v.) tarafından Medine'ye hicret sonrasında inşa edilen ve içinde Ravza-i Mutahhara'nın bulunduğu İslam'ın ikinci en kutsal mescididir. Yeşil kubbe ile tanınan bu mescit, 1 milyon kişi kapasitelidir. Burada kılınan bir namaz, başka yerlerde kılınan 1,000 namaz sevabındadır.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Al-Masjid+an-Nabawi,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "uhud-dagi",
    title: "Uhud Dağı ve Şehitliği - Hz. Hamza'nın Kabri",
    shortDescription: "Uhud Savaşı'nın yapıldığı yer olan Uhud Dağı, Hz. Hamza ve 70 şehidin kabirlerinin bulunduğu önemli bir ziyaret noktasıdır.",
    longDescription: "Uhud Dağı, Medine'nin 5 km kuzeyinde yer alan ve Uhud Savaşı'nın (625) yaşandığı tarihi dağdır. Hz. Peygamber'in amcası Hz. Hamza 'Allah'ın Aslanı' unvanıyla burada şehit olmuştur. Şehitlikte 70 Uhud şehidinin kabri bulunur.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Mount+Uhud,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "kuba-camii",
    title: "Kuba Camii - İlk Mescit",
    shortDescription: "Hz. Peygamber'in Medine'ye gelişinde inşa ettiği ilk mescit olan Kuba Camii, cumartesi günü ziyaret edilerek umre sevabı kazanılır.",
    longDescription: "Kuba Camii, Hz. Muhammed'in Medine'ye hicret ettiğinde ilk inşa ettiği mescittir. İslam tarihinin ilk mescidi olma özelliğini taşır. Hz. Peygamber, 'Kim evinden abdest alır, Kuba Mescidi'ne gelip orada namaz kılarsa, bir umre sevabı kazanır' buyurmuştur.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Quba+Mosque,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "kibleteyn-camii",
    title: "Kıbleteyn Camii - İki Kıblenin Camii",
    shortDescription: "Kıble yönünün Kudüs'ten Kabe'ye döndüğü namaz sırasında inşa edilen Kıbleteyn Camii, İslam tarihinin önemli dönüm noktalarından birini temsil eder.",
    longDescription: "Kıbleteyn Camii (İki Kıble Camii), Hz. Peygamber'in namaz kılarken vahiy gelmesi üzerine kıbleyi Kudüs'ten Kabe'ye çevirdiği mescittir. Bu olay, İslam tarihinin dönüm noktalarından biridir. Hicretin 2. yılında (624) gerçekleşmiştir.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Masjid+al-Qiblatayn,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "cennetul-baki",
    title: "Cennetü'l Baki Kabristanlığı - Hz. Peygamber'in Ailesi ve Sahabeler",
    shortDescription: "Hz. Peygamber'in eşleri, çocukları ve on binlerce sahabinin kabirlerinin bulunduğu Baki Kabristanlığı, Mescid-i Nebevi'nin hemen yanındadır.",
    longDescription: "Cennetü'l Baki (Baki Mezarlığı), Medine'nin en eski ve en önemli kabristanlığıdır. Hz. Peygamber'in aile fertleri, sahabelerin ileri gelenleri ve on binlerce Müslüman burada metfundur. Hz. Peygamber'in eşlerinden 9'u, Hz. Osman, Hz. Abbas, Hz. Hasan burada yatmaktadır.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Jannat+al-Baqi,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "esref-tepesi",
    title: "Eşref Tepesi - Uhud Savaşı'nın Stratejik Noktası",
    shortDescription: "Uhud Savaşı sırasında Hz. Peygamber'in okçularını yerleştirdiği stratejik tepedir.",
    longDescription: "Eşref Tepesi, Uhud Dağı'nın kuzeyinde yer alan ve Uhud Savaşı'nın önemli bir noktasıdır. Hz. Peygamber, okçularını bu tepeye yerleştirmiş ve savaşın seyrini değiştirmiştir.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Mount+Uhud,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "mescid-i-cuma",
    title: "Mescid-i Cuma - İlk Cuma Namazı",
    shortDescription: "Hz. Peygamber'in hicret sonrasında ilk cuma namazını kıldığı mescittir.",
    longDescription: "Mescid-i Cuma, Medine'de bulunan ve Hz. Peygamber'in hicret sonrasında ilk cuma namazını kıldığı yerdir. İslam'da cuma namazının ilk kıldığı mescit olarak tarihi öneme sahiptir.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Masjid+Jumaa,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "yedi-mescit",
    title: "Yedi Mescit - Medine'nin Tarihi Mescitleri",
    shortDescription: "Hz. Peygamber'in cuma namazını kıldığı Mescid-i Cuma dahil olmak üzere Medine'deki yedi tarihi mescit.",
    longDescription: "Yedi Mescit (Sab'a Masajid), Hz. Peygamber'in cuma namazını kıldığı Mescid-i Cuma dahil olmak üzere Medine'deki yedi tarihi mescidi ifade eder. Bu mescitler İslam tarihinin önemli parçalarıdır.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Seven+Mosques,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "hamza-camii",
    title: "Hamza Camii - Hz. Hamza'nın Kabri",
    shortDescription: "Uhud şehidi Hz. Hamza'nın kabrinin bulunduğu yerde inşa edilmiştir.",
    longDescription: "Hamza Camii, Uhud şehidi Hz. Hamza'nın kabrinin bulunduğu yerde inşa edilmiştir. Hz. Hamza, Hz. Peygamber'in amcasıdır ve 'Allah'ın Aslanı' unvanına sahiptir. Uhud Savaşı'nda şehit düşmüştür.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Sayyid+al-Shuhada,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "fatima-camii",
    title: "Fatıma Camii - Hz. Fatıma'nın Kabri",
    shortDescription: "Hz. Peygamber'in kızı Hz. Fatıma'nın kabrinin bulunduğu yerde inşa edilmiştir.",
    longDescription: "Fatıma Camii, Hz. Peygamber'in kızı Hz. Fatıma'nın kabrinin bulunduğu yerde inşa edilmiştir. Hz. Fatıma, 'Peygamber'in Kızı' unvanına sahiptir ve İslam'da önemli bir yere sahiptir.",
    city: "medine",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582657203986-8cf9c29d0f8c?w=1200&h=800&fit=crop",
    ],
    isActive: true,
    createdBy: "system",
    locationUrl: "https://maps.google.com/?q=Al-Masjid+an-Nabawi,Madinah",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

/**
 * Şehre göre places filtreleme
 */
export function getStaticPlacesByCity(city: "mekke" | "medine"): PlaceModel[] {
  return staticPlaces.filter((place) => place.city === city);
}

/**
 * ID'ye göre place getirme
 */
export function getStaticPlaceById(id: string): PlaceModel | undefined {
  return staticPlaces.find((place) => place.id === id);
}

/**
 * Tüm aktif places getirme
 */
export function getAllStaticPlaces(): PlaceModel[] {
  return staticPlaces.filter((place) => place.isActive);
}

/**
 * SEO anahtar kelimeleri
 */
export const placeSEOKeywords: Record<string, string[]> = {
  mekke: [
    "Umre", "Hac", "Kabe", "Tavaf", "Harem", "Mekke", "İhram", "Safa Merve",
    "Zemzem", "Arafat", "Mina", "Müzdelife", "Hacerü'l-Esved", "Makam-ı İbrahim",
  ],
  medine: [
    "Medine", "Mescid-i Nebevi", "Ravza", "Peygamber", "Uhud", "Kıble", "Ashab",
    "Kuba Camii", "Kıbleteyn", "Cennetü'l Baki", "Hz. Muhammed", "Hicret",
  ],
};
