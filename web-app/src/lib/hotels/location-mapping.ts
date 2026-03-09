/**
 * Mekke ve Medine bölge isimleri eşleştirme veri yapısı
 * 
 * WebBeds API'den gelen adreslerdeki bölge isimlerini Türkçe ve
 * kullanıcı dostu formatlara dönüştürmek için kullanılır.
 * 
 * @see plans/hotel-address-localization-plan.md
 */

export interface RegionMapping {
  // İngilizce anahtar kelimeler (arama için)
  keywords: string[];
  // Türkçe gösterim (ana)
  displayName: string;
  // Türkçe alternatif gösterim (kısa/yerel)
  displayNameAlt?: string;
  // Şehir kodu
  cityCode: number; // 164=Mekke, 174=Medine
  // Kategori
  category: 'center' | 'aziziyah' | 'suburban' | 'other';
}

/**
 * Mekke bölgeleri - WebBeds 40 otel analizi
 */
export const MAKKAH_REGIONS: RegionMapping[] = [
  // Merkezi Bölgeler (Kabe Yakını)
  {
    keywords: ['ajyad', 'ecyad', 'ajiad'],
    displayName: 'Ajyad',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['jarham', 'cerham'],
    displayName: 'Jarham',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['misfalah', 'al misfalah', 'imsile'],
    displayName: 'Al Misfalah',
    displayNameAlt: 'İmsile',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['rawdah', 'al rawdah', 'ravza'],
    displayName: 'Al Rawdah',
    displayNameAlt: 'Ravza',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['hujoon', 'al hujoon', 'hucun'],
    displayName: 'Al Hujoon',
    displayNameAlt: 'Hucun',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['mansour', 'al mansour'],
    displayName: 'Al Mansour',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['hajlah', 'al hajlah'],
    displayName: 'Al Hajlah',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['reea bakhsh', 'riya bakhsh'],
    displayName: 'Reea Bakhsh',
    displayNameAlt: 'Riya Beş',
    cityCode: 164,
    category: 'center'
  },
  
  // Aziziyah Bölgesi
  {
    keywords: ['alaziziyyah', 'al aziziyah', 'aziziyah', 'aziziye'],
    displayName: 'Alaziziyyah',
    displayNameAlt: 'Aziziye',
    cityCode: 164,
    category: 'aziziyah'
  },
  {
    keywords: ['abdallah khayat', 'sheikh abdallah'],
    displayName: 'Al Sheikh Abdallah Khayat',
    cityCode: 164,
    category: 'aziziyah'
  },
  {
    keywords: ['riyadh taif'],
    displayName: 'Riyadh Taif Road',
    displayNameAlt: 'Riyadh Taif Yolu',
    cityCode: 164,
    category: 'aziziyah'
  },
  
  // Diğer Bölgeler
  {
    keywords: ['mursalat', 'al mursalat', 'mürselat'],
    displayName: 'Al Mursalat',
    displayNameAlt: 'Mürselat',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['naseem', 'al naseem', 'nesim'],
    displayName: 'Al Naseem',
    displayNameAlt: 'Nesim',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['jummayzah', 'al jummayzah', 'cümmeze'],
    displayName: 'Al Jummayzah',
    displayNameAlt: 'Cümmeze',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['sulaymaniyah', 'as sulaymaniyah', 'süleymaniye'],
    displayName: 'As Sulaymaniyah',
    displayNameAlt: 'Süleymaniye',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['khansa', 'al khansa', 'hansa'],
    displayName: 'Al Khansa',
    displayNameAlt: 'Hansa',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['jarwal', 'cervel'],
    displayName: 'Jarwal',
    displayNameAlt: 'Cervel',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['umm al qura', 'ümmül kura'],
    displayName: 'Umm Al Qura',
    displayNameAlt: 'Ümmü\'l-Kura',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['abraj al bait', 'abraj al beyt', 'saat kulesi'],
    displayName: 'Abraj Al Bait',
    displayNameAlt: 'Saat Kulesi',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['jabal omar', 'jebel omer', 'cebel ömer'],
    displayName: 'Jabal Omar',
    displayNameAlt: 'Cebel Ömer',
    cityCode: 164,
    category: 'center'
  },
  {
    keywords: ['aelam', 'al aelam', 'alem'],
    displayName: 'Al Aelam',
    displayNameAlt: 'Alem',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['taef', 'al taef', 'taif'],
    displayName: 'Al Taef',
    displayNameAlt: 'Taif Yolu',
    cityCode: 164,
    category: 'suburban'
  },
  {
    keywords: ['al hajlah'],
    displayName: 'Al Hajlah',
    cityCode: 164,
    category: 'center'
  },
];

/**
 * Medine bölgeleri - WebBeds 13 otel analizi
 */
export const MADINAH_REGIONS: RegionMapping[] = [
  // Merkezi Bölgeler
  {
    keywords: ['bani khidrah', 'bani khidriah', 'banı hidra'],
    displayName: 'Bani Khidrah',
    displayNameAlt: 'Banı Hıdra',
    cityCode: 174,
    category: 'center'
  },
  {
    keywords: ['south central', 'güney merkez'],
    displayName: 'South Central Area',
    displayNameAlt: 'Güney Merkez',
    cityCode: 174,
    category: 'center'
  },
  {
    keywords: ['haram', 'al haram'],
    displayName: 'Al Haram',
    displayNameAlt: 'Harem',
    cityCode: 174,
    category: 'center'
  },
  {
    keywords: ['saad bin abi waqqas', 'saad', 'sa\'d bin ebi vakkas'],
    displayName: 'Saad bin Abi Waqqas',
    displayNameAlt: 'Sa\'d bin Ebi Vakkas',
    cityCode: 174,
    category: 'center'
  },
  {
    keywords: ['khalidiyyah', 'al khalidiyyah', 'halidiye'],
    displayName: 'Al Khalidiyyah',
    displayNameAlt: 'Halidiye',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['salman al farsi', 'selman farisi'],
    displayName: 'Salman Al Farsi',
    displayNameAlt: 'Selman Farisi',
    cityCode: 174,
    category: 'center'
  },
  {
    keywords: ['abdullah bin rawaha', 'abdullah bin revaha'],
    displayName: 'Abdullah Bin Rawaha',
    displayNameAlt: 'Abdullah bin Revaha',
    cityCode: 174,
    category: 'center'
  },
  
  // Diğer Bölgeler
  {
    keywords: ['abdulmajeed', 'prince abdulmajeed', 'abülmecid'],
    displayName: 'Prince Abdulmajeed Road',
    displayNameAlt: 'Abülmecid Caddesi',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['saeed ibn zaid', 'said bin zeyd'],
    displayName: 'Saeed Ibn Zaid Al Qurashi',
    displayNameAlt: 'Said bin Zeyd',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['king abdullah', 'kral abdullah'],
    displayName: 'King Abdullah Road',
    displayNameAlt: 'Kral Abdullah Caddesi',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['asfarin', 'al-asfarin', 'esferin'],
    displayName: 'Al-Asfarin District',
    displayNameAlt: 'Esferin',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['king faisal', 'kral faisal'],
    displayName: 'King Faisal Road',
    displayNameAlt: 'Kral Faysal Caddesi',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['quba', 'kuba'],
    displayName: 'Quba',
    displayNameAlt: 'Kuba',
    cityCode: 174,
    category: 'suburban'
  },
  {
    keywords: ['uhud'],
    displayName: 'Uhud',
    cityCode: 174,
    category: 'suburban'
  },
];

/**
 * Tüm bölgeleri birleştirilmiş liste
 */
export const ALL_REGIONS = [...MAKKAH_REGIONS, ...MADINAH_REGIONS];

/**
 * Şehir koduna göre bölgeleri filtrele
 */
export function getRegionsByCity(cityCode: number): RegionMapping[] {
  return ALL_REGIONS.filter(r => r.cityCode === cityCode);
}

/**
 * Adres metninden bölge eşleştirmesi yap
 */
export function findRegionInAddress(address: string, cityCode: number): RegionMapping | undefined {
  const regions = getRegionsByCity(cityCode);
  const normalizedAddress = address.toLowerCase();
  
  for (const region of regions) {
    for (const keyword of region.keywords) {
      if (normalizedAddress.includes(keyword.toLowerCase())) {
        return region;
      }
    }
  }
  
  return undefined;
}
