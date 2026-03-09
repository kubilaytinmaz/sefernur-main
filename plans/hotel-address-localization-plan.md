# Otel Adresi Yerelleştirme Planı

## 📋 Genel Bakış

Otel sayfasında gösterilen adres bilgilerini daha kullanıcı dostu ve Türkçe hale getirmek için bir yerelleştirme sistemi oluşturuyoruz.

### Mevcut Durum
- API'den gelen adresler: "Ajyad, Makkah 24231, Saudi Arabia", "MAKKAH", "Alaziziyyah"
- Kullanıcılar için karmaşık ve anlaşılması zor

### Hedef Durum (Kullanıcı Tercihi)
- "Ajyad Mekke" (virgülsüz, basit format)
- "Alaziziyyah Mekke"
- "Mescid-i Haram Cd. Alaziziyyah" (Türkçe çevirilerle)
- Kullanıcıların tanıdığı bölge isimleri

---

## 🗺️ Bölge Haritalama Analizi

### Mekke Bölgeleri (WebBeds Verilerinden)

**Merkezi Bölgeler (Kabe Yakını)**
- **Ajyad** (Ecyad) - Kabe'ye 500m-2km
- **Jarham** (Cerham) - Kabe'ye 600m-2.5km
- **Al Misfalah** (İmsile) - Kabe'ye ~1km
- **Al Rawdah** (Ravza) - Kabe'ye 2-3km
- **Al Hujoon** (Hucun) - Kabe'ye ~2km
- **Reea Bakhsh** (Riya Beş) - Merkezi bölge
- **Al Mansour** - Kuzey merkezi
- **Al Hajlah** - Tarihi bölge

**Aziziyah Bölgesi**
- **Alaziziyyah** (Aziziye) - Kabe'ye 3-4km
- **Al Aziziyah** - Ana bölge
- **Al Sheikh Abdallah Khayat** - Aziziye alt bölgesi
- **Riyadh Taif Road** - Aziziye ana yol

**Diğer Önemli Bölgeler**
- **Ibrahim Al Khalil Road** (İbrahim Halil Caddesi) - Ana yol
- **Al Masjid Al Haram Road** (Mescid-i Haram Caddesi) - Kutsal alan
- **Al Mursalat** (Mürselat) - Kabe'ye 5-6km
- **Al Naseem** (Nesim) - Kabe'ye 6-7km
- **Bani Khidrah** (Banı Hıdra) - Merkezi alan
- **Al Jummayzah** (Cümmeze) - Güney bölgesi
- **As Sulaymaniyah** (Süleymaniye) - Tarihi bölge
- **Al Khansa** (Hansa) - Doğu bölgesi
- **Jarwal** (Cervel) - Kuzey bölgesi
- **Umm Al Qura** (Ümmü'l-Kura) - Üniversite bölgesi
- **Abraj Al Bait** (Abraj Al Beyt) - Saat kulesi kompleksi
- **Jabal Omar** (Cebel Ömer) - Ömer dağı bölgesi
- **Al Aelam** (Alem) - Bayrak bölgesi
- **Al Taef** (Taif yolu) - Taif yolu bölgesi

### Medine Bölgeleri (WebBeds Verilerinden)

**Merkezi Bölgeler (Mescid-i Nebevi Yakını)**
- **Bani Khidrah** (Banı Hıdra) - Nebevi'ye 300-700m
- **South Central Area** (Güney Merkez) - Nebevi'ye ~1km
- **Al Haram** (Harem) - Kutsal alan çevresi
- **Saad bin Abi Waqqas** (Sa'd bin Ebi Vakkas) - Merkezi bölge
- **Al Khalidiyyah** (Halidiye) - Nebevi'ye 4km
- **Salman Al Farsi** (Selman Farisi) - Merkezi cadde
- **Abdullah Bin Rawaha** (Abdullah bin Revaha) - Merkezi cadde

**Diğer Önemli Bölgeler**
- **Prince Abdulmajeed Road** (Abülmecid Caddesi) - Ana cadde
- **Saeed Ibn Zaid Al Qurashi** (Said bin Zeyd) - Merkezi cadde
- **King Abdullah Road** (Kral Abdullah Caddesi) - Modern cadde
- **Al-Asfarin District** (Esferin) - Nebevi'ye 3km
- **King Faisal Road** (Kral Faysal Caddesi) - Ana yol
- **Quba** (Kuba) - Kuba camii bölgesi
- **Uhud** (Uhud) - Uhud dağı bölgesi

---

## 🛠️ Teknik Uygulama Planı

### 1. Bölge İsimleri Veri Yapısı

**Dosya:** `web-app/src/lib/hotels/location-mapping.ts`

```typescript
// Mekke ve Medine bölge isimleri eşleştirme tablosu
interface RegionMapping {
  // İngilizce anahtar kelimeler
  keywords: string[];
  // Türkçe gösterim
  displayName: string;
  // Türkçe alternatif gösterim (kısa/yerel)
  displayNameAlt?: string;
  // Şehir kodu
  cityCode: number; // 164=Mekke, 174=Medine
  // Kategori
  category: 'center' | 'aziziyah' | 'suburban' | 'other';
}

const MAKKAH_REGIONS: RegionMapping[] = [
  // Merkezi Bölgeler
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
];

const MADINAH_REGIONS: RegionMapping[] = [
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
    keywords: ['uhud', 'uhud'],
    displayName: 'Uhud',
    cityCode: 174,
    category: 'suburban'
  },
];

```

### 2. Adres Formatlama Fonksiyonu

**Dosya:** `web-app/src/lib/hotels/address-formatter.ts`

```typescript
export interface FormattedAddress {
  // Gösterilecek kısa adres
  displayAddress: string;
  // Bölge adı (varsa)
  region?: string;
  // Şehir adı Türkçe
  city: string;
  // Tam adres (tooltip için)
  fullAddress: string;
}

/**
 * API'den gelen adresi kullanıcı dostu formata çevirir
 *
 * @example
 * formatHotelAddress("Ajyad, Makkah 24231, Saudi Arabia", 164)
 * // { displayAddress: "Ajyad Mekke", region: "Ajyad", city: "Mekke", ... }
 *
 * @example
 * formatHotelAddress("Al Masjid Al Haram Rd. Al Aziziah, Makkah", 164)
 * // { displayAddress: "Mescid-i Haram Cd. Alaziziyyah", ... }
 */
export function formatHotelAddress(
  rawAddress: string,
  cityCode: number
): FormattedAddress {
  // 1. Adresi temizle ve normalize et
  // 2. Bölge eşleştirmesi yap (keywords ile)
  // 3. Şehir adını Türkçeleştir (Mekke/Medine)
  // 4. Gereksiz bilgileri kaldır (posta kodu, ülke)
  // 5. Cadde/sokak isimlerini Türkçeleştir ve kısalt
  // 6. Format: "Bölge Şehir" veya "Cadde Bölge Şehir"
}
```

### 3. Şehir İsimleri Türkçeleştirme

**Dosya:** `web-app/src/lib/hotels/city-names.ts`

```typescript
export const CITY_NAMES_TR: Record<number, string> = {
  164: 'Mekke',
  174: 'Medine',
  // Diğer şehirler için de genişletilebilir
};

export const CITY_NAMES_EN: Record<number, string> = {
  164: 'Makkah',
  174: 'Madinah',
};

export function getCityName(cityCode: number, locale: 'tr' | 'en' = 'tr'): string {
  const map = locale === 'tr' ? CITY_NAMES_TR : CITY_NAMES_EN;
  return map[cityCode] || 'Bilinmeyen Şehir';
}
```

### 4. HotelCard Bileşeni Güncellemesi

**Dosya:** `web-app/src/components/hotels/HotelCard.tsx`

```typescript
// Değişiklikler:
// 1. formatHotelAddress fonksiyonunu import et
// 2. hotel.address yerine formatHotelAddress kullan
// 3. Bölge bilgisini badge olarak göster (opsiyonel)

import { formatHotelAddress } from '@/lib/hotels/address-formatter';

function GridCard({ hotel, cityCode, ... }) {
  const formattedAddress = formatHotelAddress(hotel.address, cityCode);
  
  return (
    <Card>
      {/* ... */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
        <MapPin className="w-3 h-3" />
        <span className="line-clamp-1" title={formattedAddress.fullAddress}>
          {formattedAddress.displayAddress}
        </span>
      </div>
      {/* ... */}
    </Card>
  );
}
```

### 5. hotels/page.tsx Güncellemesi

**Dosya:** `web-app/src/app/hotels/page.tsx`

```typescript
// hotelAddress fonksiyonunu güncelle
function hotelAddress(hotel: WebBedsHotelItem, cityCode: number): string {
  const rawAddress = hotel["@_Address"] || hotel.address || "";
  const cityName = hotel["@_CityName"] || hotel["@_cityname"] || "";
  
  // Eğer sadece şehir adı varsa, onu döndür
  if (!rawAddress && cityName) {
    return formatCityName(cityName);
  }
  
  // Adres varsa formatla
  if (rawAddress) {
    return formatHotelAddress(rawAddress, cityCode).displayAddress;
  }
  
  return "Adres bilgisi bulunamadı";
}
```

---

## 📊 Adres Formatlama Kuralları

### Temizleme Kuralları

1. **Posta Kodu Kaldırma:** `24231`, `24243` gibi kodları kaldır
2. **Ülke Adı Kaldırma:** "Saudi Arabia" kaldır
3. **Şehir Adı Türkçeleştirme:** "Makkah" → "Mekke", "Madinah" → "Medine"
4. **Tekrar Eden Şehir Adı:** Adres içinde şehir adı varsa sonuna tekrar ekleme

### Türkçe Çeviri ve Kısaltma Kuralları

```typescript
// Türkçe bölge isimleri
const REGION_TRANSLATIONS: Record<string, string> = {
  'Al Masjid Al Haram': 'Mescid-i Haram',
  'Ibrahim Al Khalil': 'İbrahim Halil',
  'Abraj Al Bait': 'Saat Kulesi',
  'Jabal Omar': 'Cebel Ömer',
  'Bani Khidrah': 'Banı Hıdra',
  'Al Khalidiyyah': 'Halidiye',
  'Salman Al Farsi': 'Selman Farisi',
  'Abdullah Bin Rawaha': 'Abdullah bin Revaha',
  'Prince Abdulmajeed': 'Abülmecid',
  'Saeed Ibn Zaid': 'Said bin Zeyd',
  'King Abdullah': 'Kral Abdullah',
  'King Faisal': 'Kral Faysal',
};

// Kısaltmalar
const ABBREVIATIONS: Record<string, string> = {
  'Road': 'Cd.',
  'Rd.': 'Cd.',
  'Rd': 'Cd.',
  'Street': 'Sk.',
  'St.': 'Sk.',
  'St': 'Sk.',
  'District': 'Blg.',
  'Dist.': 'Blg.',
};
```

### Öncelik Sırası (Kullanıcı Tercihi: Virgülsüz Format)

1. **Bölge + Şehir:** "Ajyad Mekke" (en basit ve anlaşılır)
2. **Cadde + Bölge + Şehir:** "Mescid-i Haram Cd. Alaziziyyah Mekke"
3. **Cadde + Bölge:** "İbrahim Halil Sk. Jarham" (şehir badge'de gösteriliyorsa)
4. **Sadece Şehir:** "Mekke" (sadece şehir bilgisi varsa)
5. **Fallback:** Ham adres (temizlenmiş)

---

## 🎯 Örnekler

### Dönüşüm Örnekleri

| Girdi (API) | Çıktı (Ekran) |
|-------------|---------------|
| `Ajyad, Makkah 24231, Saudi Arabia` | `Ajyad Mekke` |
| `Alaziziyyah, Makkah, Saudi Arabia` | `Alaziziyyah Mekke` |
| `Al Masjid Al Haram Rd. Al Aziziah, Makkah` | `Mescid-i Haram Cd. Alaziziyyah Mekke` |
| `Ibrahim Al Khalil Street, Jarham` | `İbrahim Halil Sk. Jarham Mekke` |
| `8324 Masjid Ash Shaikh Bin Baz Makkah` | `Masjid Ash Shaikh Bin Baz Mekke` |
| `MAKKAH` | `Mekke` |
| `Bani Khidrah, Al Madinah` | `Banı Hıdra Medine` |
| `Salman Al Farsi Street Al Hram` | `Selman Farisi Sk. Harem Medine` |
| `Abraj Al Bait Complex` | `Saat Kulesi Mekke` |
| `Jabal Omar Ibrahim Al Khalil Street` | `Cebel Ömer Mekke` |

---

## ✅ Test Senaryoları

### Birim Testler

```typescript
describe('formatHotelAddress', () => {
  it('basit bölge adresini formatlamalı', () => {
    const result = formatHotelAddress('Ajyad, Makkah 24231, Saudi Arabia', 164);
    expect(result.displayAddress).toBe('Ajyad Mekke');
  });
  
  it('cadde + bölge + şehir formatlamalı', () => {
    const result = formatHotelAddress('Al Masjid Al Haram Rd. Al Aziziah, Makkah', 164);
    expect(result.displayAddress).toBe('Mescid-i Haram Cd. Alaziziyyah Mekke');
  });
  
  it('türkçe bölge ismi kullanmalı', () => {
    const result = formatHotelAddress('Bani Khidrah, Al Madinah', 174);
    expect(result.displayAddress).toBe('Banı Hıdra Medine');
  });
  
  it('sadece şehir adını Türkçeleştirmeli', () => {
    const result = formatHotelAddress('MAKKAH', 164);
    expect(result.displayAddress).toBe('Mekke');
  });
});
```

### Manuel Test Adımları

1. Otel listesini aç (http://localhost:3001/hotels/)
2. Farklı otellerin adreslerini kontrol et
3. Tooltip ile tam adresi gör
4. Mekke ve Medine filtrelerini test et
5. Detay sayfasında adresleri kontrol et

---

## 🚀 Uygulama Sırası

### Adım 1: Veri Yapıları
- [ ] `location-mapping.ts` oluştur
- [ ] Mekke bölgelerini tanımla (40 otel analizi)
- [ ] Medine bölgelerini tanımla (13 otel analizi)
- [ ] `city-names.ts` oluştur

### Adım 2: Formatlama Fonksiyonları
- [ ] `address-formatter.ts` oluştur
- [ ] `formatHotelAddress` fonksiyonunu yaz
- [ ] Bölge eşleştirme algoritması
- [ ] Temizleme ve kısaltma kuralları

### Adım 3: Bileşen Entegrasyonu
- [ ] `HotelCard.tsx` güncelle
- [ ] `hotels/page.tsx` güncelle
- [ ] Tooltip desteği ekle
- [ ] Badge gösterimini ayarla

### Adım 4: Test ve İyileştirme
- [ ] Birim testler yaz
- [ ] Manuel testler yap
- [ ] Edge case'leri kontrol et
- [ ] Performans optimizasyonu

---

## 🎨 UI/UX İyileştirmeleri

### Adres Gösterimi (Kullanıcı Tercihi: Basit Format)

```tsx
// Öneri 1: Basit format (tercih edilen)
<div className="flex items-center gap-1.5">
  <MapPin className="w-3 h-3 text-emerald-500" />
  <span>Ajyad Mekke</span>
</div>

// Öneri 2: Tooltip ile detay
<span title="Tam Adres: Ajyad, Makkah 24231, Saudi Arabia">
  Ajyad Mekke
</span>

// Öneri 3: Badge ile bölge vurgulama (opsiyonel)
<div className="flex items-center gap-2">
  <Badge className="bg-amber-50 text-amber-700 border-amber-200">Ajyad</Badge>
  <span className="text-slate-600">Mekke</span>
</div>
```

### Filtreleme İyileştirmesi

```tsx
// HotelFilters.tsx - Bölge filtresi ekleme
<div className="space-y-2">
  <label className="text-sm font-medium">Bölge</label>
  <Select value={regionFilter} onChange={setRegionFilter}>
    <option value="">Tüm Bölgeler</option>
    <optgroup label="Merkezi Bölgeler">
      <option value="ajyad">Ajyad</option>
      <option value="jarham">Jarham</option>
    </optgroup>
    <optgroup label="Aziziyah">
      <option value="alaziziyyah">Alaziziyyah</option>
    </optgroup>
  </Select>
</div>
```

---

## 📈 Beklenen Faydalar

1. **Kullanıcı Deneyimi:** Daha anlaşılır ve Türkçe adresler
2. **Tanıdık İsimler:** Kullanıcıların bildiği bölge adları (Ajyad, Aziziye, vb.)
3. **Temiz Görünüm:** Gereksiz bilgiler (posta kodu, ülke) kaldırıldı
4. **Tutarlılık:** Tüm adreslerde standart format (virgülsüz)
5. **Yerelleştirme:** Türkçe bölge ve cadde isimleri (Mescid-i Haram, İbrahim Halil, vb.)

---

## 🔄 Gelecek İyileştirmeler

1. **Dinamik Yerelleştirme:** Dil seçimine göre adres formatı (TR/EN/AR)
2. **Harita Entegrasyonu:** Bölge bazlı harita gösterimi
3. **Akıllı Arama:** Bölge adıyla otel arama (Ajyad yazınca Ajyad otelleri)
4. **Popüler Bölgeler:** En çok tercih edilen bölgeleri öne çıkar
5. **Mesafe Hesaplama:** Bölge merkezi bazlı mesafe gösterimi
6. **Alternatif İsimler:** Bölge için hem "Ajyad" hem "Ecyad" gibi alternatifleri destekle

---

## 📝 Notlar

- WebBeds API'sinden gelen adresler çok değişken formatta
- Bazı otellerde sadece "MAKKAH" gibi minimal bilgi var
- fullAddress objesi daha yapılandırılmış veri içeriyor
- Google Places API ile zenginleştirme yapılabilir (gelecekte)
- Bazı bölge isimleri hem Arapça hem İngilizce kullanılıyor
- Türkçe hac ve umre terminolojisi kullanılmalı (Harem, Ravza, vb.)

---

**Plan Oluşturma Tarihi:** 09.03.2026
**Son Güncelleme:** 09.03.2026 (Kullanıcı tercihleri eklendi)
**Tahmini Süre:** 3-4 saat
**Öncelik:** Yüksek
**Bağımlılıklar:** Yok

**Kullanıcı Tercihleri:**
- Format: "Ajyad Mekke" (virgülsüz, basit)
- Türkçe çeviriler: Evet (Mescid-i Haram, İbrahim Halil, vb.)
- Bölge isimleri: Genişletildi (alternatif Türkçe isimler eklendi)
