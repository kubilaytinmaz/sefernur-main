# Popüler Hizmetler - Araç Bazlı Fiyatlandırma Planı

## 📋 Mevcut Durum

### Araç Tipleri
```typescript
type VehicleType = "sedan" | "van" | "bus" | "vip" | "jeep" | "coster";
```

### Mevcut Fiyat Yapısı
```typescript
// PopularServiceModel
price: {
  display: string;      // "800₺"
  baseAmount: number;   // 800
  type: "fixed" | "per_km" | "per_person";
}
```

### Mevcut VehicleTourMatrixTab
- Firebase'den `VehiclePricingModel` veri çekiyor
- Her araç tipi için her tura özel fiyat saklıyor
- `vehiclePricing[vehicleType].tourPrices[tourId]` formatında

---

## 🎯 Hedef

1. **Admin Panel**: Her tur düzenlerken tüm araç tipleri için fiyat belirleme
2. **Public Sayfalar**: Tur kartlarında "başlayan fiyat" olarak en ucuz aracın fiyatını göster
3. **Local Veri**: Tüm fiyat bilgileri JSON'da sakla

---

## 📝 Uygulama Adımları

### Adım 1: Veri Modelini Güncelle

**Dosya**: [`web-app/src/types/popular-service.ts`](web-app/src/types/popular-service.ts:1)

```typescript
export interface PopularServiceModel {
  // ... mevcut alanlar
  
  // YENİ: Araç bazlı fiyatlar
  vehiclePrices?: {
    sedan?: number;
    van?: number;
    bus?: number;
    vip?: number;
    jeep?: number;
    coster?: number;
  };
}
```

### Adım 2: JSON Veri Yapısını Güncelle

**Dosya**: [`web-app/src/data/popular-services.json`](web-app/src/data/popular-services.json:1)

Her servise `vehiclePrices` alanı ekle:

```json
{
  "id": "tour-mecca-city",
  "vehiclePrices": {
    "sedan": 600,
    "van": 800,
    "bus": 1200,
    "vip": 1500,
    "jeep": 1000,
    "coster": 1000
  }
}
```

### Adım 3: Admin Panel Formuna Araç Fiyat Matrisi Ekle

**Dosya**: [`web-app/src/app/admin/transfers/popular-services/page.tsx`](web-app/src/app/admin/transfers/popular-services/page.tsx:1)

`ServiceForm` component'ine yeni bölüm ekle:

```tsx
{/* Araç Bazlı Fiyatlandırma */}
<div className="col-span-full border-t pt-6">
  <h3 className="text-lg font-semibold mb-4">Araç Bazlı Fiyatlar</h3>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {vehiclePricingOrder.map((vt) => (
      <div key={vt}>
        <label className="mb-1 text-sm font-medium">
          {vehicleTypeLabels[vt]}
        </label>
        <input
          type="number"
          value={formData.vehiclePrices?.[vt] || ""}
          onChange={(e) => setFormData({
            ...formData,
            vehiclePrices: {
              ...formData.vehiclePrices,
              [vt]: Number(e.target.value)
            }
          })}
          placeholder="0"
          min="0"
        />
      </div>
    ))}
  </div>
</div>
```

### Adım 4: API Endpoint Güncelle

**Dosya**: [`web-app/src/app/api/admin/popular-services/route.ts`](web-app/src/app/api/admin/popular-services/route.ts:1)

`vehiclePrices` alanını destekle

### Adım 5: En Ucuz Fiyat Hesaplama Fonksiyonu

**Dosya**: [`web-app/src/lib/data/popular-services.ts`](web-app/src/lib/data/popular-services.ts:1)

```typescript
export function getMinPriceForService(
  service: PopularServiceModel
): number {
  if (service.vehiclePrices) {
    const prices = Object.values(service.vehiclePrices).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : service.price.baseAmount;
  }
  return service.price.baseAmount;
}
```

### Adım 6: PopularServicesSection Güncelle

**Dosya**: [`web-app/src/components/transfers/PopularServicesSection.tsx`](web-app/src/components/transfers/PopularServicesSection.tsx:1)

```typescript
const getStartingPrice = useCallback((service: PopularServiceModel): string => {
  const minPrice = getMinPriceForService(service);
  return `${minPrice}₺'den başlayan`;
}, []);
```

### Adım 7: Transfer Rezervasyon Güncelle

**Dosya**: [`web-app/src/app/transfer-rezervasyon/[slug]/[tourSlug]/_client.tsx`](web-app/src/app/transfer-rezervasyon/[slug]/[tourSlug]/_client.tsx:1)

Seçilen araç tipine göre fiyat göster

---

## 🔄 Veri Akışı

### Admin Panel
```
Form → vehiclePrices objesi → API → JSON
```

### Public Sayfalar
```
JSON → getMinPriceForService() → "600₺'den başlayan"
```

---

## 📊 Örnek Veri Yapısı

```json
{
  "id": "tour-mecca-city",
  "name": "Mekke Şehir Turu",
  "price": {
    "display": "800₺",
    "baseAmount": 800,
    "type": "fixed"
  },
  "vehiclePrices": {
    "sedan": 600,
    "van": 800,
    "bus": 1200,
    "vip": 1500,
    "jeep": 1000,
    "coster": 1000
  }
}
```

Kartta gösterilecek: **"600₺'den başlayan"**

---

## 🚀 Implementasyon Sırası

1. ✅ Veri modelini güncelle
2. ⏳ JSON dosyasına örnek vehiclePrices ekle
3. ⏳ Admin panel formuna araç fiyat matrisi ekle
4. ⏳ API endpoint güncelle
5. ⏳ En ucuz fiyat hesaplama fonksiyonu
6. ⏳ PopularServicesSection güncelle
7. ⏳ Test ve doğrulama
