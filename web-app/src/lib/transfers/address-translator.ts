/**
 * Arapça → Türkçe Adres Çevirisi
 * Suudi Arabistan'daki şehir ve mekan isimlerinin Türkçe karşılıkları
 */

/**
 * Arapça şehir isimlerini Türkçe'ye çevirir
 */
export function translateArabicToTurkish(text: string): string {
  if (!text) return text;

  // Metni normalize et (boşlukları temizle, küçük harfe çevir)
  const normalized = text.trim().toLowerCase();

  // Şehir isimleri çevirisi
  const cityTranslations: Record<string, string> = {
    // Mekke
    "مكة المكرمة": "Mekke",
    "مكة": "Mekke",
    "makkah": "Mekke",
    "mecca": "Mekke",
    "makkah al mukarramah": "Mekke",

    // Medine
    "المدينة المنورة": "Medine",
    "المدينة": "Medine",
    "al madinah": "Medine",
    "medina": "Medine",
    "al madinah al munawwarah": "Medine",

    // Cidde
    "جدة": "Cidde",
    "jeddah": "Cidde",
    "jiddah": "Cidde",
    "jidda": "Cidde",

    // Taif
    "الطائف": "Taif",
    "taif": "Taif",
    "ta'if": "Taif",

    // Yanbu
    "ينبع": "Yenbu",
    "yanbu": "Yenbu",
    "yanbu al bahr": "Yenbu",

    // Rabigh
    "رابغ": "Rabig",
    "rabigh": "Rabig",
    "rābigh": "Rabig",

    // Havalimanları
    "مطار الملك عبدالعزيز الدولي": "Kral Abdulaziz Havalimanı",
    "king abdulaziz international airport": "Kral Abdulaziz Havalimanı",
    "jed": "Kral Abdulaziz Havalimanı",
    "jeddah airport": "Kral Abdulaziz Havalimanı",

    "مطار الأمير محمد بن عبدالعزيز الدولي": "Prens Muhammed Havalimanı",
    "prince mohammed bin abdulaziz international airport": "Prens Muhammed Havalimanı",
    "med": "Prens Muhammed Havalimanı",
    "medina airport": "Prens Muhammed Havalimanı",

    // Kutsal mekanlar
    "المسجد الحرام": "Mescid-i Haram",
    "al masjid al haram": "Mescid-i Haram",
    "grand mosque": "Mescid-i Haram",
    "haram": "Mescid-i Haram",

    "المسجد النبوي": "Mescid-i Nebevi",
    "al masjid an nabawi": "Mescid-i Nebevi",
    "prophet's mosque": "Mescid-i Nebevi",
    "nabawi": "Mescid-i Nebevi",

    "جبل النور": "Cebeli Nur",
    "jabal al nur": "Cebeli Nur",
    "mount of light": "Cebeli Nur",
    "hira cave": "Hira Mağarası",
    "غار حراء": "Hira Mağarası",

    "جبل عرفة": "Arafat Dağı",
    "jabal ar rahmah": "Arafat Dağı",
    "mount arafat": "Arafat Dağı",
    "arafat": "Arafat",

    "منى": "Mina",
    "mina": "Mina",

    "مزدلفة": "Müzdelife",
    "muzdalifah": "Müzdelife",

    "جبل الثور": "Sevr Dağı",
    "jabal thawr": "Sevr Dağı",
    "mount thawr": "Sevr Dağı",

    "غار ثور": "Sevr Mağarası",
    "cave of thawr": "Sevr Mağarası",

    // Oteller ve bölgeler
    "فندق": "Otel",
    "hotel": "Otel",

    "البركة": "El-Berke",
    "al barakah": "El-Berke",

    "العزيزية": "El-Aziziye",
    "al aziziyah": "El-Aziziye",

    "الشيشاء": "El-Şişe",
    "al shisha": "El-Şişe",

    "الراجحي": "El-Raci",
    "al rajhi": "El-Raci",

    "السلام": "Salam",
    "as salam": "Salam",

    "الخالدية": "El-Halidiye",
    "al khalidiyyah": "El-Halidiye",

    "النوارية": "El-Nevaviye",
    "al nawariyyah": "El-Nevaviye",

    "المنصورة": "El-Mansura",
    "al mansurah": "El-Mansura",

    "الروضة": "El-Ravza",
    "ar rawdah": "El-Ravza",

    "الزهراء": "El-Zehra",
    "az zahra": "El-Zehra",

    // Yön ve konum belirteçleri
    "شارع": "Cadde",
    "street": "Cadde",

    "طريق": "Yol",
    "road": "Yol",

    "قرب": "yakınında",
    "near": "yakınında",

    "أمام": "karşısında",
    "in front of": "karşısında",

    "خلف": "arkasında",
    "behind": "arkasında",
  };

  // Tam eşleşme ara
  if (cityTranslations[normalized]) {
    return cityTranslations[normalized];
  }

  // Kısmi eşleşme ara (metin içinde geçiyorsa)
  for (const [arabic, turkish] of Object.entries(cityTranslations)) {
    if (normalized.includes(arabic)) {
      return text.replace(new RegExp(arabic, "gi"), turkish);
    }
  }

  // Çeviri bulunamazsa orijinal metni döndür
  return text;
}

/**
 * Adres string'indeki Arapça kısımları Türkçe'ye çevirir
 * Virgülle ayrılmış adres bileşenlerini tek tek çevirir
 */
export function translateAddress(address: string): string {
  if (!address) return address;

  // Adresi parçalara ayır (virgül, tire, veya tire ile ayrılmış olabilir)
  const parts = address.split(/[,\-–—]/);

  // Her parçayı çevir
  const translatedParts = parts.map((part) => {
    const trimmed = part.trim();
    const translated = translateArabicToTurkish(trimmed);
    return translated;
  });

  // Parçaları tekrar birleştir
  return translatedParts.join(", ");
}

/**
 * Şehir ismini Türkçe'ye çevirir (kısa versiyon)
 */
export function translateCity(city: string): string {
  if (!city) return city;
  return translateArabicToTurkish(city);
}
