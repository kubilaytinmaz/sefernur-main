# 📍 Google Places API Etkinleştirme - Otel Puanları

## Durum
✅ **Kod hazır** - Google Places API entegrasyonu tamamlandı
❌ **API etkin değil** - Firebase projesinde Places API henüz etkinleştirilmemiş

## Neden Gerekli?
WebBeds API'den kullanıcı değerlendirme puanları (Google rating) gelmiyor. 
Sadece otel yıldız sayısı (3⭐, 4⭐, 5⭐) geliyor.

Google Places API ile otellerin Google Maps puanlarını (örn: 3.7/5.0) çekiyoruz.

## Etkinleştirme Adımları

### 1. Google Cloud Console'a Git
https://console.cloud.google.com/

### 2. Doğru Projeyi Seç
- Firebase projesi: `sefernur-app`
- API Key: `AIzaSyB8xXEtVZyFmTrU3lnESu5j1p2OE8gjBUM`

### 3. Places API'yi Etkinleştir
1. Sol menüden **"API'ler ve Hizmetler"** > **"Kütüphane"** seçin
2. Arama çubuğuna **"Places API"** yazın
3. **"Places API (New)"** seçin
4. **"Etkinleştir"** butonuna tıklayın

### 4. Faturalama Kontrolü
- Places API kullanımı ücretlidir (ilk $200 her ay ücretsiz)
- Faturalama hesabı eklenmiş olmalı
- Aylık kullanım limiti ayarlayabilirsiniz

## Kod Konumları

### Backend API
- **Route**: `web-app/src/app/api/google-places/ratings/route.ts`
- **Otomatik çağrılıyor**: `web-app/src/app/api/webbeds/search/route.ts` (satır 218-268)
- **Cache**: 24 saat in-memory cache (aynı otel için tekrar sorgu yok)

### Frontend
- **Kullanım**: `web-app/src/app/hotels/page.tsx` (satır 203-204)
- **Gösterim**: `web-app/src/components/hotels/HotelCard.tsx` (satır 207-221)

## Test Etme

### Terminal'de Test
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=21+Makkah+hotel&type=lodging&key=AIzaSyB8xXEtVZyFmTrU3lnESu5j1p2OE8gjBUM"
```

**Başarılı yanıt**: `"status": "OK"` ve otel listesi
**Hata yanıtı**: `"status": "REQUEST_DENIED"` (API etkin değil)

### Localhost'ta Test
1. API'yi etkinleştirin
2. http://localhost:3001/hotels/ sayfasını yenileyin
3. Terminal loglarında şunu göreceksiniz:
   ```
   [WebBeds Search] Phase 3 — Google ratings enriched: X
   ```
   (X > 0 ise başarılı)

4. Otel kartlarında yıldız + puan gösterilecek:
   ```
   ⭐ 3.7 (245 değerlendirme)
   ```

## Fiyatlandırma
- **Text Search**: $32 / 1000 istek
- **İlk $200**: Ücretsiz (her ay)
- **Örnek**: 10 otel × 3 sayfa = 30 istek/arama
  - 1000 arama = 30,000 istek = ~$960
  - İlk 6,250 arama ücretsiz ($200 / $32 × 1000)

## Cache Stratejisi
- ✅ **24 saatlik cache**: Aynı otel için 24 saat tekrar sorgu yapılmaz
- ✅ **Non-blocking**: API hatası durumunda oteller yine gösterilir
- ✅ **İlk 10 otel**: Sayfa başına sadece ilk 10 otel için sorgu atılır (maliyet optimizasyonu)

## Alternatifler
Eğer Google Places API kullanmak istemezseniz:
1. **Kendi değerlendirme sistemi**: Firebase Firestore'da kullanıcı yorumları
2. **Sadece yıldız göster**: WebBeds'den gelen otel yıldız sayısı (mevcut)
3. **TripAdvisor API**: Alternatif puan kaynağı

---

**Son Güncelleme**: 09.03.2026  
**Durum**: Kod hazır, API etkinleştirme bekleniyor
