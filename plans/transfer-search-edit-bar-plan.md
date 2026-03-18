# Transfer Arama Çubuğu (Edit Bar) Planı

## Amaç
Transfer sonuçları sayfasına otel sonuçları sayfasındaki gibi ayarlanabilir bir arama çubuğu eklemek.

## Mevcut Durum
- Otel sonuçları sayfasında [`HotelSearchEditBar`](web-app/src/components/hotels/HotelSearchEditBar.tsx:1) bileşeni var
- Transfer sonuçları sayfasında sadece statik bir header var
- Kullanıcı arama kriterlerini değiştirmek için geri dönüp yeni arama yapmak zorunda

## Hedef
Transfer sonuçları sayfasında kullanıcıların:
- Nereden lokasyonunu değiştirebileceği
- Nereye lokasyonunu değiştirebileceği
- Tarih seçebileceği
- Saat seçebileceği
- Yolcu sayısını değiştirebileceği
- "Yeni Ara" butonu ile sonuçları güncelleyebileceği

bileşeni oluşturulacak.

## Bileşen Yapısı

### TransferSearchEditBar
```
┌─────────────────────────────────────────────────────────────────┐
│  📍 Nereden    📍 Nereye    📅 Tarih    🕒 Saat    👥 Yolcu    │
│  [Mekke ▼]     [Havalimanı ▼]  [18 Mar ▼]  [09:00 ▼]  [1 Kişi ▼]  │
│                                                                  │
│                                              [🔍 Yeni Ara]       │
└─────────────────────────────────────────────────────────────────┘
```

### Alt Bileşenler
1. **CompactLocationSelector** - Nereden/Nereye seçimi için kompakt dropdown
2. **CompactDatePicker** - Tarih seçimi için kompakt dropdown
3. **CompactTimePicker** - Saat seçimi için kompakt dropdown
4. **CompactPassengerPicker** - Yolcu sayısı için kompakt dropdown

## Uygulama Adımları

### 1. TransferSearchEditBar Bileşeni Oluştur
- Dosya: `web-app/src/components/transfers/TransferSearchEditBar.tsx`
- [`HotelSearchEditBar`](web-app/src/components/hotels/HotelSearchEditBar.tsx:1) yapısına benzer
- Tüm parametreler değiştirilebilir
- Değişiklik olduğunda "Yeni Ara" butonu aktif olur

### 2. Export Ekle
- Dosya: `web-app/src/components/transfers/index.ts`
- `TransferSearchEditBar` bileşenini export et

### 3. Sayfaya Entegre Et
- Dosya: `web-app/src/app/transfer-sonuclar/page.tsx`
- Header'ın altına sticky pozisyonda ekle
- URL parametrelerini bileşene prop olarak geç
- Arama değiştiğinde URL'yi güncelle

### 4. URL Güncelleme Mantığı
- `useSearchParams` ile URL değişikliklerini dinle
- Yeni URL ile sorguyu tetikle
- Sayfa yenilemesi olmadan sonuçları güncelle

## Tasarım Detayları

### Renk Paleti
- Nereden: Yeşil (emerald) - `border-emerald-200`, `from-emerald-50`
- Nereye: Mavi (cyan) - `border-cyan-200`, `from-cyan-50`
- Tarih: Turuncu (amber) - `border-amber-200`, `from-amber-50`
- Saat: Mor (violet) - `border-violet-200`, `from-violet-50`
- Yolcu: Pembe (rose) - `border-rose-200`, `from-rose-50`

### Responsive
- Mobil: Dikey düzen
- Tablet: 2x2 grid
- Desktop: Yan yana

### Sticky Pozisyon
- Header'ın altında sticky
- `top-[73px]` (header yüksekliği)
- `z-20` (üst katman)

## Props Interface

```typescript
export interface TransferSearchEditBarProps {
  fromLocationId: string;
  toLocationId: string;
  date: string;
  time: string;
  passengers: number;
  onSearch: (params: TransferSearchParams) => void;
  loading?: boolean;
  className?: string;
}
```

## URL Parametreleri

```
/transfer-sonuclar/?from=mecca&to=jeddah_airport&date=2026-03-18&time=09:00&passengers=1&routeId=mecca-jeddah-airport
```

## Örnek Kullanım

```tsx
<TransferSearchEditBar
  fromLocationId={fromLocationId}
  toLocationId={toLocationId}
  date={dateStr}
  time={time}
  passengers={passengers}
  onSearch={handleSearchChange}
  loading={transfersQuery.isFetching}
/>
```
