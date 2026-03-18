# Admin Transfer Rezervasyonları Sayfası - Teknik Plan

## 📋 Genel Bakış

Admin panelde Transferler için özel bir rezervasyon bölümü oluşturulacak. Bu sayfa, Transfer ve Tur sayfalarında yapılan tüm rezervasyonları gösterecek.

## 🎯 Hedefler

1. Transfer ve Transfer+Tur rezervasyonlarını tek bir sayfada görüntüleme
2. Gelişmiş filtreleme ve arama özellikleri
3. Rezervasyon detaylarını görüntüleme ve yönetme
4. İstatistiksel özetler ve raporlama

## 📁 Dosya Yapısı

```
web-app/src/
├── app/admin/transfers/
│   ├── reservations/
│   │   ├── page.tsx                    # Ana sayfa
│   │   └── [id]/
│   │       ├── page.tsx                # Detay sayfası (server)
│   │       └── _client.tsx             # Detay sayfası (client)
├── lib/firebase/
│   └── admin-domain.ts                 # Yeni fonksiyonlar eklenecek
├── components/admin/
│   └── TransferReservationCard.tsx     # Yeni bileşen
└── types/
    └── reservation.ts                  # Mevcut, güncellenebilir
```

## 🔧 Teknik Spesifikasyonlar

### 1. Veri Modeli

Mevcut [`ReservationModel`](web-app/src/types/reservation.ts:10) kullanılacak:

```typescript
interface ReservationModel {
  id?: string;
  userId: string;
  type: ReservationType;  // "transfer" | "tour" | "transfer_tour"
  itemId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  people?: number;
  price: number;
  currency: string;
  status: ReservationStatus;
  paymentOrderId?: string;
  paymentStatus?: "initiated" | "success" | "failed";
  meta?: Record<string, unknown>;  // Transfer/tur özel verileri
  userPhone?: string;
  userEmail?: string;
  notes?: string;
  source?: "web" | "mobile" | "admin";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Firebase Fonksiyonları

[`admin-domain.ts`](web-app/src/lib/firebase/admin-domain.ts:227) dosyasına eklenecek:

```typescript
// Transfer rezervasyonlarını filtrele
export async function getTransferReservations(
  filters?: TransferReservationFilters
): Promise<ReservationModel[]>

// Belirli bir transfer için rezervasyonlar
export async function getReservationsByTransferId(
  transferId: string
): Promise<ReservationModel[]>

// Transfer rezervasyon istatistikleri
export async function getTransferReservationStats(): Promise<TransferReservationStats>
```

### 3. Filtreleme Seçenekleri

- **Durum**: Beklemede, Onaylandı, İptal, Tamamlandı
- **Tip**: Transfer, Transfer+Tur
- **Tarih Aralığı**: Başlangıç/Bitiş tarihi
- **Kaynak**: Web, Mobil, Admin
- **Transfer ID**: Belirli bir transfer için
- **Fiyat Aralığı**: Min/Max fiyat
- **Arama**: İsim, e-posta, telefon, rezervasyon ID

### 4. İstatistik Kartları

- Toplam Rezervasyon Sayısı
- Onay Bekleyen Rezervasyonlar
- Bugünkü/Yaklaşan Rezervasyonlar
- Toplam Gelir
- İptal Oranı

### 5. Tablo Sütunları

| Sütun | Açıklama |
|-------|----------|
| Rezervasyon No | ID'nin ilk 8 karakteri |
| Müşteri | Ad + İletişim bilgileri |
| Transfer/Tur | Başlık + Görsel |
| Tip | Transfer / Transfer+Tur |
| Tarih | Başlangıç tarihi ve saati |
| Kişi | Yetişkin + Çocuk + Bebek |
| Fiyat | Toplam tutar |
| Durum | StatusBadge ile |
| Kaynak | Web/Mobil/Admin |
| İşlem | Detay butonu |

## 🎨 UI/UX Tasarımı

### Sayfa Düzeni

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Transfer Rezervasyonları                            │
│  Alt başlık: Tüm transfer ve tur rezervasyonlarını yönetin   │
├─────────────────────────────────────────────────────────────┤
│  [İstatistik Kartları - 5 adet yan yana]                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Toplam│ │Bekleyen│ │Bugün │ │Gelir │ │İptal │              │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
├─────────────────────────────────────────────────────────────┤
│  [Arama] [Filtreler▼] [Dışa Aktar] [Yeni Rezervasyon]      │
├─────────────────────────────────────────────────────────────┤
│  Gelişmiş Filtreler (açılır/kapanır)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Durum▼] [Tip▼] [Tarih] [Kaynak▼] [Fiyat Aralığı]  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Tablo                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ # │ Müşteri │ Transfer │ Tip │ Tarih │ Fiyat │ Durum│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Sayfalama                                                  │
│  ◄ 1 2 3 ... 10 ►                                          │
└─────────────────────────────────────────────────────────────┘
```

### Detay Sayfası

```
┌─────────────────────────────────────────────────────────────┐
│  ← Rezervasyon Detayı                    [Onayla] [İptal]  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────────────┐   │
│  │ Rezervasyon         │ │ Müşteri Bilgileri          │   │
│  │ Bilgileri           │ │                            │   │
│  │                     │ │ ┌─────┐                     │   │
│  │ Tip: Transfer       │ │ │ Foto │  Ad Soyad          │   │
│  │ Durum: Onaylandı    │ │ └─────┘  E-posta           │   │
│  │ Tarih: ...          │ │          Telefon           │   │
│  │ Fiyat: ₺1,200      │ │          [Profili Gör→]    │   │
│  └─────────────────────┘ └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Transfer Detayları                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Görsel]                                            │   │
│  │ Araç: Mercedes Vito                                  │   │
│  │ Rota: Antalya Havalimanı → Lara                     │   │
│  │ Tarih: 15 Mart 2024, 10:00                          │   │
│  │ Yolcular: 4 yetişkin, 1 çocuk                       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Tur Detayları (varsa)                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Görsel]                                            │   │
│  │ Tur: Perge & Aspendos Yarım Gün Tur                 │   │
│  │ Süre: 6 saat                                        │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Ödeme Bilgileri                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Ödeme ID: PAY_123456                                │   │
│  │ Durum: Başarılı                                     │   │
│  │ Tutar: ₺1,200                                       │   │
│  └────────────────────────────────��────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Admin Notu                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Textarea]                                          │   │
│  │ [Kaydet]                                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Geliştirme Adımları

### Adım 1: Firebase Fonksiyonları
- [ ] `getTransferReservations` fonksiyonu
- [ ] `getReservationsByTransferId` fonksiyonu
- [ ] `getTransferReservationStats` fonksiyonu

### Adım 2: Ana Sayfa
- [ ] Sayfa iskeleti oluşturma
- [ ] İstatistik kartları bileşeni
- [ ] Filtreleme sistemi
- [ ] Tablo bileşeni
- [ ] Sayfalama

### Adım 3: Detay Sayfası
- [ ] Rezervasyon detayları
- [ ] Müşteri bilgileri
- [ ] Transfer/tur detayları
- [ ] Durum değiştirme
- [ ] Admin notu

### Adım 4: Sidebar Güncelleme
- [ ] Transferler menüsüne "Rezervasyonlar" alt menüsü ekleme

## 🔗 İlgili Dosyalar

- [`web-app/src/app/admin/reservations/page.tsx`](web-app/src/app/admin/reservations/page.tsx:1) - Referans olarak kullanılacak
- [`web-app/src/app/admin/transfers/page.tsx`](web-app/src/app/admin/transfers/page.tsx:1) - Tasarım referansı
- [`web-app/src/lib/firebase/admin-domain.ts`](web-app/src/lib/firebase/admin-domain.ts:227) - Firebase fonksiyonları
- [`web-app/src/types/reservation.ts`](web-app/src/types/reservation.ts:10) - Veri modeli
- [`web-app/src/components/admin/AdminSidebar.tsx`](web-app/src/components/admin/AdminSidebar.tsx:51) - Sidebar güncellemesi

## 🎨 Renk Paleti

- **Birincil**: Emerald-600 (#059669)
- **Başarı**: Emerald-50/700
- **Beklemede**: Amber-50/700
- **İptal**: Red-50/700
- **Tamamlandı**: Blue-50/700
- **Nötr**: Gray-50/900

## 📱 Responsive Tasarım

- Mobil: Tek sütun, yatay kaydırmalı tablo
- Tablet: 2 sütun istatistik kartları
- Desktop: 5 sütun istatistik kartları, tam tablo

## 🔐 Güvenlik

- Sadece admin rolündeki kullanıcılar erişebilir
- Firebase güvenlik kuralları ile kontrol
- Server-side rendering ile veri yükleme
