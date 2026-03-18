# Transfer Fiyat Güncelleme - Nihai Uygulama Planı

## Kararlar
- **Van fiyatı**: Staria (8 kişi) fiyatı kullanılacak
- **Jeep fiyatı**: VIP fiyatı ile aynı olacak
- **Fiyat artışları**: Onaylandı
- **Yeni turlar**: Eklenecek
- **SAR→USD kuru**: 1 SAR = 0.2666 USD (3.75 SAR = 1 USD)

---

## Nihai USD Fiyat Tablosu

### Transfer Rotaları (popular-transfer-routes-data.ts)

| # | Rota | sedan | van | coster | bus | vip | jeep |
|---|------|-------|-----|--------|-----|-----|------|
| 1 | Cidde Airport → Mekke | 67 | 93 | 120 | 267 | 133 | 133 |
| 2 | Mekke → Cidde Airport | 53 | 80 | 107 | 213 | 120 | 120 |
| 3 | Mekke → Medine | 120 | 160 | 187 | 347 | 227 | 227 |
| 4 | Medine → Mekke | 120 | 160 | 187 | 347 | 227 | 227 |
| 5 | Cidde Airport → Medine | 120 | 160 | 187 | 347 | 227 | 227 |
| 6 | Medine → Cidde Airport | 120 | 160 | 187 | 347 | 227 | 227 |
| 7 | Medine Airport → Medine | 21 | 32 | 53 | 147 | 53 | 53 |
| 8 | Medine → Medine Airport | 21 | 32 | 53 | 147 | 53 | 53 |
| 9 | Medine Airport → Mekke | 141 | 192 | 240 | 494 | 280 | 280 |
| 10 | Mekke → Medine Airport | 141 | 192 | 240 | 494 | 280 | 280 |
| 11 | Mekke → Taif | 93 | 107 | 133 | 267 | 213 | 213 |
| **YENİ** | | | | | | | |
| 12 | Mekke → Bedir → Medine | 147 | 173 | 213 | 400 | 267 | 267 |
| 13 | Mekke → Hudeybiye | 40 | 48 | 67 | 187 | 107 | 107 |
| 14 | Mekke → Cirane | 40 | 48 | 67 | 187 | 107 | 107 |
| 15 | Mekke → Aişe Tenim | 19 | 32 | 53 | 133 | 80 | 80 |
| 16 | Mekke → Tren İstasyonu | 21 | 27 | 40 | 107 | 53 | 53 |
| 17 | Medine → Tren İstasyonu | 21 | 27 | 40 | 107 | 53 | 53 |

**Not - #9 ve #10 (Medine Airport ↔ Mekke):** Tabloda doğrudan bu rota yok ama Medine Otel→Mekke (450/600/700/850/1300) + Medine Otel→Airport (80/120/200/200/550) toplamından hesaplanabilir. Ya da mevcut Mekke-Medine fiyatlarına %15-20 eklenebilir. Mevcut hesaplamayı koruyalım: Mekke-Medine + Medine-Airport fiyatları yaklaşık. 

### Tur Hizmetleri (popular-services-data.ts)

| # | Tur | sedan | van | coster | bus | vip | jeep |
|---|-----|-------|-----|--------|-----|-----|------|
| 1 | Mekke Şehir/Çevre Ziyareti | 67 | 75 | 120 | 200 | 107 | 107 |
| 2 | Medine Şehir/Çevre Ziyareti | 61 | 67 | 107 | 187 | 93 | 93 |
| 3 | Taif Günübirlik Turu | 93 | 107 | 133 | 267 | 213 | 213 |
| 4 | Cidde Şehir Turu | 93 | 107 | 147 | 267 | 213 | 213 |
| 5 | Hac/Umre Rehberliği (1 gün) | 120 | 160 | 187 | 347 | 227 | 227 |

---

## Güncellenecek Dosyalar

### Dosya 1: `web-app/src/lib/data/popular-transfer-routes-data.ts`

**Mevcut rotaların fiyat güncellemesi (11 rota)** + **7 yeni rota ekleme**

Mevcut rota ID'leri ve yeni fiyatlar:

```
route-jeddah-airport-to-mecca:
  prices: { sedan: 67, van: 93, coster: 120, bus: 267, vip: 133, jeep: 133 }

route-medina-airport-to-medina:  
  prices: { sedan: 21, van: 32, coster: 53, bus: 147, vip: 53, jeep: 53 }

route-mecca-to-medina:
  prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }

route-medina-to-mecca:
  prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }

route-mecca-to-jeddah-airport:
  prices: { sedan: 53, van: 80, coster: 107, bus: 213, vip: 120, jeep: 120 }

route-medina-to-medina-airport:
  prices: { sedan: 21, van: 32, coster: 53, bus: 147, vip: 53, jeep: 53 }

route-jeddah-airport-to-medina:
  prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }

route-medina-to-jeddah-airport:
  prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }

route-medina-airport-to-mecca:
  prices: { sedan: 141, van: 192, coster: 240, bus: 494, vip: 280, jeep: 280 }

route-mecca-to-medina-airport:
  prices: { sedan: 141, van: 192, coster: 240, bus: 494, vip: 280, jeep: 280 }

route-mecca-to-taif:
  prices: { sedan: 93, van: 107, coster: 133, bus: 267, vip: 213, jeep: 213 }
```

Yeni rota ID'leri:

```
route-mecca-to-badr-to-medina: (Mekke → Bedir → Medine)
  fromLocationId: 'mecca', toLocationId: 'medina'
  icon: '🕌', distanceKm: 500, durationMinutes: 360
  prices: { sedan: 147, van: 173, coster: 213, bus: 400, vip: 267, jeep: 267 }

route-mecca-to-hudeybiye: (Mekke → Hudeybiye)
  fromLocationId: 'mecca', toLocationId: 'hudeybiye'
  icon: '🕌', distanceKm: 25, durationMinutes: 60
  prices: { sedan: 40, van: 48, coster: 67, bus: 187, vip: 107, jeep: 107 }

route-mecca-to-cirane: (Mekke → Cirane)
  fromLocationId: 'mecca', toLocationId: 'cirane'
  icon: '🕌', distanceKm: 25, durationMinutes: 60
  prices: { sedan: 40, van: 48, coster: 67, bus: 187, vip: 107, jeep: 107 }

route-mecca-to-aisha-tanim: (Mekke → Aişe Tenim)
  fromLocationId: 'mecca', toLocationId: 'aisha_tanim'
  icon: '🕌', distanceKm: 8, durationMinutes: 20
  prices: { sedan: 19, van: 32, coster: 53, bus: 133, vip: 80, jeep: 80 }

route-mecca-to-train-station: (Mekke → Tren İstasyonu)
  fromLocationId: 'mecca', toLocationId: 'mecca_train_station'
  icon: '🚉', distanceKm: 10, durationMinutes: 15
  prices: { sedan: 21, van: 27, coster: 40, bus: 107, vip: 53, jeep: 53 }

route-medina-to-train-station: (Medine → Tren İstasyonu)
  fromLocationId: 'medina', toLocationId: 'medina_train_station'
  icon: '🚉', distanceKm: 10, durationMinutes: 15
  prices: { sedan: 21, van: 27, coster: 40, bus: 107, vip: 53, jeep: 53 }

route-taif-to-mecca: (Taif → Mekke - geri dönüş)
  fromLocationId: 'taif', toLocationId: 'mecca'
  icon: '🏔️', distanceKm: 90, durationMinutes: 90
  prices: { sedan: 93, van: 107, coster: 133, bus: 267, vip: 213, jeep: 213 }
```

### Dosya 2: `web-app/src/lib/data/popular-services-data.ts`

Tur fiyatlarını güncelle ve yeni turlar ekle:

```
service-city-tour-makkah: (Mekke Şehir Turu → Mekke Çevre Ziyareti)
  vehiclePrices: { sedan: 67, van: 75, coster: 120, bus: 200, vip: 107, jeep: 107 }
  price.baseAmount: 67

service-city-tour-madinah: (Medine Şehir Turu → Medine Çevre Ziyareti)
  vehiclePrices: { sedan: 61, van: 67, coster: 107, bus: 187, vip: 93, jeep: 93 }
  price.baseAmount: 61

service-taif-tour: (Taif Günübirlik Turu)
  vehiclePrices: { sedan: 93, van: 107, coster: 133, bus: 267, vip: 213, jeep: 213 }
  price.baseAmount: 93

service-jeddah-city-tour: (Jeddah Şehir Turu)
  vehiclePrices: { sedan: 93, van: 107, coster: 147, bus: 267, vip: 213, jeep: 213 }
  price.baseAmount: 93

service-hajj-umrah-guide: (Hac/Umre Rehberliği)
  vehiclePrices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }
  price.baseAmount: 120

service-ziyarat-makkah: (Mekke Ziyaret Turları → güncelle)
  vehiclePrices: { sedan: 67, van: 75, coster: 120, bus: 200, vip: 107, jeep: 107 }
  price.baseAmount: 67

service-ziyarat-madinah: (Medine Ziyaret Turları → güncelle)
  vehiclePrices: { sedan: 61, van: 67, coster: 107, bus: 187, vip: 93, jeep: 93 }
  price.baseAmount: 61

service-private-guide: (Özel Rehber Hizmeti → Mekke-Medine fiyatı üzerinden)
  vehiclePrices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }
  price.baseAmount: 120

service-airport-transfer: (Havalimanı Transfer → Cidde Airport-Mekke fiyatı)
  vehiclePrices: { sedan: 67, van: 93, coster: 120, bus: 267, vip: 133, jeep: 133 }
  price.baseAmount: 67

service-intercity-transfer: (Şehirlerarası Transfer → Mekke-Medine fiyatı)
  vehiclePrices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 }
  price.baseAmount: 120
```

### Dosya 3: `web-app/src/lib/transfers/pricing.ts`

ROUTE_FIXED_PRICES ve VEHICLE_PRICING güncelle:

```
VEHICLE_PRICING (basePrice güncelleme):
  sedan:  basePrice: 67  (was 40)
  van:    basePrice: 93  (was 53)
  bus:    basePrice: 267 (was 133)
  vip:    basePrice: 133 (was 80)
  jeep:   basePrice: 133 (was 53, jeep=vip)
  coster: basePrice: 120 (was 67)

ROUTE_FIXED_PRICES güncelleme + bus, vip, jeep kolonları ekleme
```

### Dosya 4: `web-app/src/lib/data/transfers-data.ts`

Araç basePrice güncelleme:
```
transfer-sedan-001 (Camry):   basePrice: 500 → 67 (USD)
transfer-van-001 (Carnival):  basePrice: 800 → 80 (USD)  
transfer-bus-001 (Otobüs):    basePrice: 2500 → 267 (USD)
transfer-vip-001 (GMC):       basePrice: 1500 → 133 (USD)
transfer-coster-001 (Haice):  basePrice: 1200 → 120 (USD)
transfer-van-002 (Staria):    basePrice: 900 → 93 (USD)
```

---

## Sitede Olup Tabloda Olmayan Öğeler (Kendin Hesapla)

Bu rotalar tabloda olmadığı için diğer rotaların km fiyatından hesapladım:

| Rota | Hesaplama Yöntemi | Sonuç |
|------|-------------------|-------|
| Medine Airport → Mekke | Mekke-Medine fiyatı + Medine-Airport fiyatı yaklaşık | sedan:141, van:192, coster:240, bus:494, vip:280, jeep:280 |
| Mekke → Medine Airport | Aynı yukarıdaki | Aynı fiyatlar |
| Taif → Mekke (geri) | Taif gidiş ile aynı | sedan:93, van:107, coster:133, bus:267, vip:213, jeep:213 |

---

## Uygulama Sırası

1. `popular-transfer-routes-data.ts` - 11 mevcut rota fiyat güncelle + 7 yeni rota ekle
2. `popular-services-data.ts` - 10 mevcut servis fiyat güncelle
3. `pricing.ts` - VEHICLE_PRICING ve ROUTE_FIXED_PRICES güncelle
4. `transfers-data.ts` - 6 araç basePrice güncelle
5. Test et - Sitedeki fiyatların doğru gösterildiğini kontrol et
