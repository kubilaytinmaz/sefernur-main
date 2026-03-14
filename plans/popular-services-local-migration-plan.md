# Popüler Hizmetler - Firebase'den Local'e Geçiş Planı

## 📋 Mevcut Durum Analizi

### Firebase Koleksiyonu
- **Koleksiyon Adı**: `popularServices`
- **Admin Panel**: [`/admin/transfers/popular-services`](web-app/src/app/admin/transfers/popular-services/page.tsx:1)
- **Firebase Fonksiyonları**: [`admin-domain.ts`](web-app/src/lib/firebase/admin-domain.ts:1258) (CRUD işlemleri)

### Local Veri Dosyası
- **Dosya**: [`popular-services-simple.ts`](web-app/src/lib/transfers/popular-services-simple.ts:1)
- **Mevcut Veri**: 8 adet popüler hizmet (Mekke/Medine turları, rehberler)
- **Kullanım**: Statik fallback olarak kullanılıyor

### Kullanım Noktaları
1. **Admin Panel**: Firebase'den veri çekiyor, CRUD yapıyor
2. **Public Hooks**: [`usePopularServices.ts`](web-app/src/hooks/usePopularServices.ts:1) - Firebase'den çekiyor
3. **PopularServicesSection**: Firebase + fallback mekanizması
4. **Transfer Rezervasyon**: Firebase'den servis detayı çekiyor

---

## 🎯 Hedef
Firebase'deki popüler servis verilerini local'e taşıyarak Firebase bağımlılığını tamamen kaldırmak.

---

## 📝 Uygulama Adımları

### Adım 1: Firebase'den Veri Export API'si Oluştur
**Dosya**: `web-app/src/app/api/admin/export/popular-services/route.ts`

```typescript
// Firebase'deki tüm popüler servisleri JSON olarak export eden API
// Admin panelinden çağrılacak
```

### Adım 2: Export Edilen Verileri Local JSON Dosyasına Kaydet
**Dosya**: `web-app/src/data/popular-services.json`

```json
{
  "services": [
    // Firebase'den gelen veriler buraya
  ],
  "lastUpdated": "2026-03-14T11:45:00.000Z"
}
```

### Adım 3: Local Veri Katmanı Oluştur
**Dosya**: `web-app/src/lib/data/popular-services.ts`

```typescript
// Local JSON dosyasından okuma/yazma fonksiyonları
// Admin paneli için CRUD fonksiyonları (Firebase yerine)
```

### Adım 4: Admin Paneli Güncelle
**Dosya**: [`web-app/src/app/admin/transfers/popular-services/page.tsx`](web-app/src/app/admin/transfers/popular-services/page.tsx:1)

```typescript
// Firebase import'larını kaldır
// Local veri katmanını kullan
// - getAllPopularServices() -> local'den
// - createPopularService() -> JSON'a yaz
// - updatePopularService() -> JSON'da güncelle
// - deletePopularService() -> JSON'dan sil
```

### Adım 5: Public Hook'ları Güncelle
**Dosya**: [`web-app/src/hooks/usePopularServices.ts`](web-app/src/hooks/usePopularServices.ts:1)

```typescript
// Firebase import'larını kaldır
// Local veri katmanını kullan
// React Query cache mekanizması korunsun
```

### Adım 6: PopularServicesSection Sadeleştir
**Dosya**: [`web-app/src/components/transfers/PopularServicesSection.tsx`](web-app/src/components/transfers/PopularServicesSection.tsx:1)

```typescript
// Firebase fallback mantığını kaldır
// Sadece local veriyi kullan
```

### Adım 7: Transfer Rezervasyon Güncelle
**Dosya**: [`web-app/src/app/transfer-rezervasyon/[slug]/[tourSlug]/_client.tsx`](web-app/src/app/transfer-rezervasyon/[slug]/[tourSlug]/_client.tsx:1)

```typescript
// Firebase fallback mantığını kaldır
// Local veri katmanını kullan
```

---

## 🔄 Veri Akışı (Öncesi - Sonrası)

### Öncesi (Firebase)
```
Admin Panel → Firebase Firestore → Public Hooks → UI Components
```

### Sonrası (Local)
```
Admin Panel → Local JSON → Public Hooks → UI Components
```

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Veri Tutarlılığı**: Firebase'deki son veriler export edilmeli
2. **CRUD İşlemleri**: Admin panelindeki tüm işlemler local JSON dosyasına yansımalı
3. **Type Safety**: `PopularServiceModel` tipi korunmalı
4. **React Query**: Cache mekanizması korunsun (performans için)
5. **Deployment**: JSON dosyası build'e dahil edilmeli

---

## 🚀 Implementasyon Sırası

1. ✅ Mevcut sistem analizi
2. ⏳ Firebase export API'si oluştur
3. ⏳ Local JSON dosyası oluştur
4. ⏳ Local veri katmanı oluştur
5. ⏳ Admin paneli güncelle
6. ⏳ Public hook'ları güncelle
7. ⏳ Component'leri sadeleştir
8. ⏳ Test ve doğrulama

---

## 📊 Başarı Kriterleri

- [ ] Admin paneli Firebase olmadan çalışıyor
- [ ] Public sayfalar verileri doğru gösteriyor
- [ ] CRUD işlemleri (create, update, delete) çalışıyor
- [ ] Type safety korunuyor
- [ ] Performans sorunu yok
