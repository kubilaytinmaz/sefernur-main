# Popular Services Fiyat Güncelleme Planı

## Mevcut Araç Fiyatları (Saatlik)

| Araç Tipi | Kapasite | SAR/Saat |
|-----------|----------|----------|
| Sedan | 3-6 kişi | 44 SAR |
| Van | 8 kişi | 44 SAR |
| VIP | 5 kişi | 70 SAR |
| Coster | 16 kişi | 125 SAR |
| Bus | 7-55 kişi | 125 SAR |

## Tur Süreleri ve Hesaplanan Fiyatlar

### 1. Mekke Şehir Turu (4-6 saat = 5 saat)
- **Sedan**: 44 × 5 = **220 SAR** (1-4 kişi)
- **Van**: 44 × 5 = **220 SAR** (5-8 kişi)
- **VIP**: 70 × 5 = **350 SAR** (1-5 kişi)
- **Coster**: 125 × 5 = **625 SAR** (9-16 kişi)
- **Bus**: 125 × 5 = **625 SAR** (17+ kişi)

### 2. Medine Şehir Turu (4-6 saat = 5 saat)
- **Sedan**: 44 × 5 = **220 SAR** (1-4 kişi)
- **Van**: 44 × 5 = **220 SAR** (5-8 kişi)
- **VIP**: 70 × 5 = **350 SAR** (1-5 kişi)
- **Coster**: 125 × 5 = **625 SAR** (9-16 kişi)
- **Bus**: 125 × 5 = **625 SAR** (17+ kişi)

### 3. Taif Turu (8 saat)
- **Sedan**: 44 × 8 = **352 SAR** (1-4 kişi)
- **Van**: 44 × 8 = **352 SAR** (5-8 kişi)
- **VIP**: 70 × 8 = **560 SAR** (1-5 kişi)
- **Coster**: 125 × 8 = **1000 SAR** (9-16 kişi)
- **Bus**: 125 × 8 = **1000 SAR** (17+ kişi)

### 4. Cidde Şehir Turu (6 saat)
- **Sedan**: 44 × 6 = **264 SAR** (1-4 kişi)
- **Van**: 44 × 6 = **264 SAR** (5-8 kişi)
- **VIP**: 70 × 6 = **420 SAR** (1-5 kişi)
- **Coster**: 125 × 6 = **750 SAR** (9-16 kişi)
- **Bus**: 125 × 6 = **750 SAR** (17+ kişi)

### 5. Hudeybiye Umre Mescidi (2-3 saat = 2.5 saat)
- **Sedan**: 44 × 2.5 = **110 SAR** (1-4 kişi)
- **Van**: 44 × 2.5 = **110 SAR** (5-8 kişi)
- **VIP**: 70 × 2.5 = **175 SAR** (1-5 kişi)
- **Coster**: 125 × 2.5 = **313 SAR** (9-16 kişi)
- **Bus**: 125 × 2.5 = **313 SAR** (17+ kişi)

### 6. Cirane Umre Mescidi (2-3 saat = 2.5 saat)
- **Sedan**: 44 × 2.5 = **110 SAR** (1-4 kişi)
- **Van**: 44 × 2.5 = **110 SAR** (5-8 kişi)
- **VIP**: 70 × 2.5 = **175 SAR** (1-5 kişi)
- **Coster**: 125 × 2.5 = **313 SAR** (9-16 kişi)
- **Bus**: 125 × 2.5 = **313 SAR** (17+ kişi)

### 7. Aişe Tenim Umre Mescidi (1-2 saat = 1.5 saat)
- **Sedan**: 44 × 1.5 = **66 SAR** (1-4 kişi)
- **Van**: 44 × 1.5 = **66 SAR** (5-8 kişi)
- **VIP**: 70 × 1.5 = **105 SAR** (1-5 kişi)
- **Coster**: 125 × 1.5 = **188 SAR** (9-16 kişi)
- **Bus**: 125 × 1.5 = **188 SAR** (17+ kişi)

### 8. Mekke - Bedir - Medine Turu (6-8 saat = 7 saat)
- **Sedan**: 44 × 7 = **308 SAR** (1-4 kişi)
- **Van**: 44 × 7 = **308 SAR** (5-8 kişi)
- **VIP**: 70 × 7 = **490 SAR** (1-5 kişi)
- **Coster**: 125 × 7 = **875 SAR** (9-16 kişi)
- **Bus**: 125 × 7 = **875 SAR** (17+ kişi)

## Araç Kapasite Eşleşmeleri

| Araç Tipi | Kod Kapasite | Gerçek Kapasite | Kişi Aralığı |
|-----------|--------------|-----------------|--------------|
| Sedan | ≤4 | 3-6 | 1-4 |
| Van | ≤7 | 8 | 5-8 |
| VIP | Özel | 5 | 1-5 |
| Coster | ≤15 | 16 | 9-16 |
| Bus | >15 | 7-55 | 17+ |

## Güncelleme Adımları

1. `web-app/src/data/popular-services.json` dosyasını aç
2. Her tur için `vehiclePrices` objesini yukarıdaki hesaplanan fiyatlarla güncelle
3. `price.display` ve `price.baseAmount` değerlerini Sedan fiyatına göre güncelle
4. Değişiklikleri kaydet

## Notlar

- Fiyatlar araç saatlik ücreti × tur süresi formülüyle hesaplanmıştır
- Sedan ve Van aynı saatlik fiyata sahip (44 SAR/saat)
- Coster ve Bus aynı saatlik fiyata sahip (125 SAR/saat)
- VIP daha pahalıdır (70 SAR/saat)
