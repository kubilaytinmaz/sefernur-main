# Popüler Hizmetler - Basitleştirilmiş Plan

## 📋 Kullanıcı İstekleri

1. **Tek bir liste** - Transferler, turlar, rehberler hepsi karışık tek listede
2. **Fiyatlar görünür** - Her kartta fiyat bilgisi gösterilsin
3. **Popüler yerler** - Çok fazla seçenek değil, sadece en popüler olanlar:
   - Mekke gezileri
   - Medine gezileri  
   - Taif gezisi
   - Hurma bahçeleri
   - Melekler Tepesi (Cebeli Nur)
   - Transfer rotaları
4. **Alt kısım her zaman araç kartları** - Seçime göre sadece fiyatlar değişir
5. **Tur/rehber eklemesi** - Ödeme aşamasında yapılacak (şimdilik sadece fiyat gösterimi)

## 🎯 Sistem Davranışı

### Üst Kısım: Popüler Hizmetler

```
┌──────────────────────────────────────────────────────────────┐
│  Popüler Transferler ve Hizmetler                            │
└──────────────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ✈️       │ │ 🕌       │ │ 🕌       │ │ 🏔️       │ │ 🌴       │
│ Cidde →  │ │ Mekke →  │ │ Mekke    │ │ Taif     │ │ Hurma    │
│ Mekke    │ │ Medine   │ │ Şehir    │ │ Gezisi   │ │ Bahçeleri│
│ 75 km    │ │ 450 km   │ │ Turu     │ │ 8 saat   │ │ 3 saat   │
│ 150₺+    │ │ 500₺+    │ │ 200₺/kişi│ │ 280₺/kişi│ │ 150₺/kişi│
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ⛰️       │ │ 🕋       │ │ 🕌       │ │ ⚔️       │ │ 🌊       │
│ Cebeli   │ │ Arafat-  │ │ Medine   │ │ Uhud Dağı│ │ Cidde    │
│ Nur      │ │ Mina-    │ │ Şehir    │ │ Ziyareti │ │ Sahili   │
│ (Hira)   │ │ Müzdelife│ │ Turu     │ │ 2.5 saat │ │ 4 saat   │
│ 200₺/kişi│ │ 200₺/kişi│ │ 220₺/kişi│ │ 120₺/kişi│ │ 180₺/kişi│
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Seçim Sonrası

**Transfer Seçilirse (ör: Cidde → Mekke):**
```
┌────────────────────────────────────────────────────────────┐
│ ✓ SEÇİLİ: Cidde Havalimanı → Mekke (75 km)               │
│   [Seçimi Kaldır]                                          │
└────────────────────────────────────────────────────────────┘

[Araç Kartları - Fiyatlar Rotaya Göre Hesaplandı]
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Sedan       │ │ VIP         │ │ Van         │
│ 4 kişi      │ │ 4 kişi      │ │ 8 kişi      │
│ 150₺        │ │ 300₺        │ │ 240₺        │
│ Rota bazlı  │ │ Rota bazlı  │ │ Rota bazlı  │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Tur/Rehber Seçilirse (ör: Mekke Şehir Turu):**
```
┌────────────────────────────────────────────────────────────┐
│ ✓ SEÇİLİ: Mekke Şehir Turu (200₺/kişi × 4 saat)          │
│   [Seçimi Kaldır]                                          │
└────────────────────────────────────────────────────────────┘

[Araç Kartları - Transfer + Tur Ücreti]
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Sedan       │ │ VIP         │ │ Van         │
│ 4 kişi      │ │ 4 kişi      │ │ 8 kişi      │
│ 50₺ + 200₺  │ │ 100₺ + 200₺ │ │ 80₺ + 200₺  │
│ = 250₺      │ │ = 300₺      │ │ = 280₺      │
│ Transfer+Tur│ │ Transfer+Tur│ │ Transfer+Tur│
└─────────────┘ └─────────────┘ └─────────────┘
```

## 📊 Veri Yapısı

### PopularService Interface

```typescript
export interface PopularService {
  id: string;
  type: 'transfer' | 'tour' | 'guide';
  name: string;
  description: string;
  icon: string;
  
  // Transfer için
  distance?: { km: number; text: string };
  duration: { text: string };
  
  // Fiyat bilgisi
  price: {
    display: string; // "150₺+" veya "200₺/kişi"
    baseAmount: number; // Hesaplamalar için
    type: 'per_km' | 'per_person' | 'fixed';
  };
  
  // Tur/Rehber için ek bilgiler
  tourDetails?: {
    highlights: string[];
    includes: string[];
    minParticipants: number;
  };
  
  isPopular: boolean;
}
```

### Popüler Hizmetler Listesi (10-12 adet)

**Transferler (3 adet):**
1. Cidde Havalimanı → Mekke (150₺+)
2. Mekke → Medine (500₺+)
3. Medine → Cidde Havalimanı (480₺+)

**Mekke Gezileri (3 adet):**
4. Mekke Şehir Turu (200₺/kişi) - Cebeli Nur, Cebeli Sevr, Mina, Arafat
5. Cebeli Nur (Hira Mağarası) Ziyareti (200₺/kişi)
6. Arafat-Mina-Müzdelife Turu (200₺/kişi)

**Medine Gezileri (3 adet):**
7. Medine Şehir Turu (220₺/kişi) - Uhud, Kuba, Kıble Camii
8. Hurma Bahçeleri Gezisi (150₺/kişi)
9. Uhud Dağı ve Şehitleri Ziyareti (120₺/kişi)

**Diğer Geziler (2 adet):**
10. Taif Günübirlik Turu (280₺/kişi) - Gül bahçeleri, Şifa bahçeleri
11. Cidde Kızıldeniz Sahili Turu (180₺/kişi)

## 🏗️ Teknik Uygulama

### 1. Veri Dosyası Güncellemesi

**Dosya:** `lib/transfers/popular-services.ts`

**İşlem:**
- Yeni, basitleştirilmiş `PopularService` interface oluştur
- 10-12 popüler hizmeti tanımla
- Her hizmet için fiyat gösterim formatını belirle

### 2. Bileşen Güncellemesi

**Dosya:** `components/transfers/PopularRoutesSection.tsx`

**Yeni adı:** `PopularServicesSection.tsx` (veya mevcut isim koruyabilir)

**İşlem:**
- Tek bir grid/list içinde tüm hizmetleri göster
- Her kartta:
  - Icon (büyük ve belirgin)
  - Hizmet adı
  - Süre/mesafe bilgisi
  - **Fiyat** (görünür)
  - Seçim durumu
- Seçili kart vurgulama

**Kart Tasarımı:**
```tsx
<Card>
  <Icon /> {/* 🕌 🏔️ 🌴 vb. */}
  <Title>Mekke Şehir Turu</Title>
  <Duration>4 saat</Duration>
  <Price>200₺/kişi</Price>
  {isSelected && <Badge>✓ Seçili</Badge>}
</Card>
```

### 3. Sayfa Güncellemesi

**Dosya:** `app/transfers/page.tsx`

**State Yönetimi:**
```typescript
const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

const selectedService = selectedServiceId 
  ? POPULAR_SERVICES.find(s => s.id === selectedServiceId) 
  : null;
```

**Fiyat Hesaplama Mantığı:**
```typescript
const calculatePrice = (vehicle: TransferModel, service: PopularService | null) => {
  if (!service) {
    return vehicle.basePrice;
  }
  
  if (service.type === 'transfer') {
    // Transfer: Mesafe bazlı hesaplama
    const distanceKm = service.distance?.km || 0;
    return calculateTransferPrice({
      vehicleType: vehicle.vehicleType,
      distanceKm,
      // ... diğer parametreler
    }).total;
  } else {
    // Tur/Rehber: Baz fiyat + tur ücreti
    const baseTransferPrice = 50; // Şehir içi kısa transfer
    const tourPricePerPerson = service.price.baseAmount;
    return baseTransferPrice + tourPricePerPerson;
  }
};
```

**Render Mantığı:**
```tsx
{/* Popüler Hizmetler */}
<PopularServicesSection
  onServiceSelect={setSelectedServiceId}
  selectedServiceId={selectedServiceId}
/>

{/* Seçili Hizmet Bilgisi */}
{selectedService && (
  <div className="selected-service-banner">
    <span>{selectedService.icon} {selectedService.name}</span>
    <span>{selectedService.price.display}</span>
    <button onClick={() => setSelectedServiceId(null)}>Kaldır</button>
  </div>
)}

{/* Araç Kartları - HER ZAMAN GÖRÜNÜR */}
<div className="vehicle-cards">
  {transfers.map(transfer => (
    <TransferCard
      key={transfer.id}
      transfer={transfer}
      selectedService={selectedService}
      displayPrice={calculatePrice(transfer, selectedService)}
    />
  ))}
</div>
```

## 🎨 UI/UX Detayları

### Kart Boyutları
- **Grid:** 2 (mobile) → 4 (tablet) → 6 (desktop) kolonlu
- **Kart Yüksekliği:** Eşit, ~140-160px
- **Padding:** Kompakt ama okunabilir

### Renkler ve Vurgular
- **Transfer kartları:** Mavi tonlar (✈️ 🚗)
- **Tur kartları:** Turuncu/Sarı tonlar (🏔️ 🕋)
- **Rehber kartları:** Mor/Yeşil tonlar (🕌 ⛰️)
- **Seçili:** Cyan ring + hafif scale
- **Hover:** Border renk değişimi + gölge

### Fiyat Gösterimi
- **Transfer:** "150₺+" (başlangıç fiyatı, + işareti)
- **Tur/Rehber:** "200₺/kişi" (kişi başı sabit)
- **Font:** Orta büyüklük, semi-bold

### Seçim Durumu
- **Seçili kart:** Cyan ring, scale(1.02), "✓ Seçili" badge
- **Seçili banner:** Üstte bilgi bandı, "Seçimi Kaldır" butonu

## ✅ Başarı Kriterleri

- [ ] 10-12 popüler hizmet tek listede görünüyor
- [ ] Her kartta fiyat bilgisi var ve net görünüyor
- [ ] Transfer seçildiğinde araç fiyatları mesafeye göre güncelleniyor
- [ ] Tur/rehber seçildiğinde araç fiyatlarına tur ücreti ekleniyor
- [ ] Araç kartları her durumda görünür
- [ ] Seçim durumu açıkça belli
- [ ] Responsive tasarım çalışıyor
- [ ] Hover ve aktif durumlar uygun

## 📝 Notlar

- Tur/rehber detayları (dahil/hariç olanlar) şimdilik kart üzerinde gösterilmeyecek
- Rezervasyon aşamasında kullanıcı tur/rehber ekleyebilecek
- Şimdilik sadece fiyat bilgisi gösteriliyor
- Basit ve anlaşılır tutulmalı
