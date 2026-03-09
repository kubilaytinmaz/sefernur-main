# 🚀 4 ÖZELLİK UYGULAMA PLANI

## 📋 İÇİNDEKİLER

1. [Transfer Sistemi Genişletme](#1-transfer-sistemi-genişletme-) 🚗
2. [Rehber Kiralama Sistemi](#2-rehber-kiralama-sistemi-) 👨‍🏫
3. [Bireysel Sefer Planlayıcı](#3-bireysel-sefer-planlayıcı-) 📅
4. [Favoriler Sistemi Geliştir](#4-favoriler-sistemi-geliştir-) ⭐
5. [Karşılaştırma Özelliği](#5-karşılaştırma-özelliği-) ⚖️

---

## 1. TRANSFER SİSTEMİ GENİŞLETME 🚗

### 📊 Mevcut Durum Analizi

**Mevcut Özellikler:**
- ✅ Transfer listesi (Firebase'den çekiliyor)
- ✅ Araç tipi filtresi (sedan, van, bus, vip, jeep, coster)
- ✅ Kapasite filtresi (1-4, 5-8, 9-15, 16+ kişi)
- ✅ Arama fonksiyonu
- ✅ Transfer detay sayfası

**Eksiklikler:**
- ❌ Popüler rotalar yok
- ❌ Dinamik fiyat hesaplama yok
- ❌ Havalimanı karşılama servisi yok
- ❌ Tarih bazlı arama yok
- ❌ Anlık rezervasyon yok

---

### 🎯 Yeni Özellikler

#### 1.1 Popüler Transfer Rotaları

```typescript
// src/lib/transfers/popular-routes.ts

export interface PopularRoute {
  id: string;
  name: string;
  from: { city: string; location: string; coordinates?: { lat: number; lng: number } };
  to: { city: string; location: string; coordinates?: { lat: number; lng: number } };
  distance: { km: number; text: string };
  duration: { minutes: number; text: string };
  basePrice: number;
  pricePerKm?: number;
  category: 'airport' | 'intercity' | 'local';
  isPopular: boolean;
  icon: string;
  description: string;
}

export const POPULAR_ROUTES: PopularRoute[] = [
  {
    id: 'jed-to-mecca',
    name: 'Cidde Havalimanı → Mekke',
    from: { city: 'Cidde', location: 'Kral Abdulaziz Havalimanı (JED)', coordinates: { lat: 21.6796, lng: 39.1565 } },
    to: { city: 'Mekke', location: 'Harem / Oteller', coordinates: { lat: 21.4225, lng: 39.8262 } },
    distance: { km: 75, text: '75 km' },
    duration: { minutes: 75, text: '60-90 dakika' },
    basePrice: 150,
    pricePerKm: 2,
    category: 'airport',
    isPopular: true,
    icon: '✈️',
    description: 'Havalimanından otelinize konforlu transfer',
  },
  {
    id: 'mecca-to-medina',
    name: 'Mekke → Medine',
    from: { city: 'Mekke', location: 'Otel / Harem', coordinates: { lat: 21.4225, lng: 39.8262 } },
    to: { city: 'Medine', location: 'Mescid-i Nebevi / Oteller', coordinates: { lat: 24.4672, lng: 39.6157 } },
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    basePrice: 500,
    pricePerKm: 1.5,
    category: 'intercity',
    isPopular: true,
    icon: '🕌',
    description: 'İki kutsal şehir arası konforlu yolculuk',
  },
  {
    id: 'medina-to-jed',
    name: 'Medine → Cidde Havalimanı',
    from: { city: 'Medine', location: 'Otel / Mescid-i Nebevi', coordinates: { lat: 24.4672, lng: 39.6157 } },
    to: { city: 'Cidde', location: 'Kral Abdulaziz Havalimanı (JED)', coordinates: { lat: 21.6796, lng: 39.1565 } },
    distance: { km: 420, text: '420 km' },
    duration: { minutes: 280, text: '4 saat' },
    basePrice: 480,
    pricePerKm: 1.5,
    category: 'airport',
    isPopular: true,
    icon: '✈️',
    description: 'Medine\'den uçağınızı kaçırmayın',
  },
  {
    id: 'mecca-haram-to-hotel',
    name: 'Mekke Harem → Otel',
    from: { city: 'Mekke', location: 'Harem (Kabe-i Muazzama)', coordinates: { lat: 21.4225, lng: 39.8262 } },
    to: { city: 'Mekke', location: 'Otel (Adres belirtilecek)' },
    distance: { km: 0, text: 'Değişken' },
    duration: { minutes: 15, text: '5-30 dakika' },
    basePrice: 30,
    category: 'local',
    isPopular: true,
    icon: '🏨',
    description: 'Harem\'den otelinize kısa mesafe transfer',
  },
  {
    id: 'medine-prophet-to-hotel',
    name: 'Medine Mescid-i Nebevi → Otel',
    from: { city: 'Medine', location: 'Mescid-i Nebevi', coordinates: { lat: 24.4672, lng: 39.6157 } },
    to: { city: 'Medine', location: 'Otel (Adres belirtilecek)' },
    distance: { km: 0, text: 'Değişken' },
    duration: { minutes: 10, text: '5-20 dakika' },
    basePrice: 25,
    category: 'local',
    isPopular: true,
    icon: '🏨',
    description: 'Mescid-i Nebevi\'den otelinize konforlu transfer',
  },
];
```

#### 1.2 Dinamik Fiyat Hesaplama

```typescript
// src/lib/transfers/pricing.ts

export const VEHICLE_PRICING: Record<VehicleType, {
  basePrice: number;
  pricePerKm: number;
  nightSurcharge: number;
  waitingFeePerHour: number;
  luggageFee: number;
}> = {
  sedan: { basePrice: 50, pricePerKm: 2.5, nightSurcharge: 30, waitingFeePerHour: 50, luggageFee: 10 },
  van: { basePrice: 80, pricePerKm: 3.5, nightSurcharge: 50, waitingFeePerHour: 75, luggageFee: 15 },
  bus: { basePrice: 200, pricePerKm: 5, nightSurcharge: 100, waitingFeePerHour: 150, luggageFee: 0 },
  vip: { basePrice: 150, pricePerKm: 4, nightSurcharge: 75, waitingFeePerHour: 100, luggageFee: 20 },
  jeep: { basePrice: 100, pricePerKm: 3, nightSurcharge: 40, waitingFeePerHour: 60, luggageFee: 15 },
  coster: { basePrice: 150, pricePerKm: 4, nightSurcharge: 60, waitingFeePerHour: 100, luggageFee: 10 },
};

export function calculateTransferPrice(input: {
  vehicleType: VehicleType;
  distanceKm: number;
  isNightTime: boolean;
  waitingHours?: number;
  extraLuggage?: number;
}): { total: number; breakdown: string[] } {
  const pricing = VEHICLE_PRICING[input.vehicleType];
  const distancePrice = input.distanceKm * pricing.pricePerKm;
  const nightSurcharge = input.isNightTime ? pricing.nightSurcharge : 0;
  const waitingFee = (input.waitingHours || 0) * pricing.waitingFeePerHour;
  const luggageFee = (input.extraLuggage || 0) * pricing.luggageFee;
  const total = pricing.basePrice + distancePrice + nightSurcharge + waitingFee + luggageFee;
  
  const breakdown = [
    `Başlangıç: ${pricing.basePrice} TL`,
    `Mesafe (${input.distanceKm} km): ${distancePrice.toFixed(0)} TL`,
  ];
  if (nightSurcharge > 0) breakdown.push(`Gece sürşarjı: ${nightSurcharge} TL`);
  if (waitingFee > 0) breakdown.push(`Bekleme: ${waitingFee} TL`);
  if (luggageFee > 0) breakdown.push(`Fazla bagaj: ${luggageFee} TL`);
  
  return { total, breakdown };
}
```

#### 1.3 Transfer Arama Formu

```typescript
// src/components/transfers/TransferSearchForm.tsx

export function TransferSearchForm({ onSearch }: { onSearch: (params: any) => void }) {
  const [params, setParams] = useState({
    fromCity: '', toCity: '', pickupDate: new Date(), pickupTime: '09:00', passengerCount: 1, luggageCount: 1,
  });
  const [selectedRoute, setSelectedRoute] = useState<PopularRoute | null>(null);

  return (
    <Card className="border-slate-200 bg-white shadow-lg">
      <CardContent className="p-6">
        {/* Popüler Rotalar */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Popüler Rotalar</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {POPULAR_ROUTES.filter(r => r.isPopular).map((route) => (
              <button
                key={route.id}
                onClick={() => { setSelectedRoute(route); setParams({...params, routeId: route.id, fromCity: route.from.city, toCity: route.to.city}); }}
                className={`p-3 rounded-lg border text-left ${selectedRoute?.id === route.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-cyan-300'}`}
              >
                <div className="text-lg mb-1">{route.icon}</div>
                <div className="text-xs font-medium">{route.name}</div>
                <div className="text-[10px] text-slate-500">{route.duration.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detaylı Arama Alanları */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" value={params.fromCity} onChange={(e) => setParams({...params, fromCity: e.target.value})} placeholder="Nereden" className="w-full h-11 rounded-lg border px-3" />
            <input type="text" value={params.toCity} onChange={(e) => setParams({...params, toCity: e.target.value})} placeholder="Nereye" className="w-full h-11 rounded-lg border px-3" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <input type="date" value={params.pickupDate.toISOString().split('T')[0]} onChange={(e) => setParams({...params, pickupDate: new Date(e.target.value)})} className="w-full h-11 rounded-lg border px-3" />
            <input type="time" value={params.pickupTime} onChange={(e) => setParams({...params, pickupTime: e.target.value})} className="w-full h-11 rounded-lg border px-3" />
            <select value={params.passengerCount} onChange={(e) => setParams({...params, passengerCount: Number(e.target.value)})} className="w-full h-11 rounded-lg border px-3">
              {[1,2,3,4,5,6,7,8,9,10,12,14].map(n => <option key={n} value={n}>{n} Kişi</option>)}
            </select>
          </div>
          <Button onClick={() => onSearch(params)} className="w-full h-12 bg-cyan-600 text-white">Transfer Ara</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 2. REHBER KİRALAMA SİSTEMİ 👨‍🏫

### 📊 Mevcut Durum Analizi

**Mevcut Özellikler:**
- ✅ Rehber listesi ve filtreleme var
- ✅ Uzmanlık ve dil filtreleri var
- ✅ Rehber detay sayfası var

**Eksiklikler:**
- ❌ Tarih bazlı müsaitlik kontrolü yok
- ❌ Rezervasyon sistemi yok
- ❌ Fiyat hesaplama yok

---

### 🎯 Yeni Özellikler

#### 2.1 Rehber Rezervasyon Formu

```typescript
// src/components/guides/GuideBookingForm.tsx

export function GuideBookingForm({ guideId, guideName, dailyRate }: { guideId: string; guideName: string; dailyRate: number }) {
  const [formData, setFormData] = useState({
    startDate: '', endDate: '', city: 'mekke', groupSize: 1, services: { hotelPickup: false, meals: false }, contact: { phone: '', email: '' },
  });

  const days = formData.startDate && formData.endDate ? 
    Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = dailyRate * days;

  return (
    <Card className="border-violet-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{guideName} - Rezervasyon</h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="h-11 rounded-lg border px-3" />
          <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="h-11 rounded-lg border px-3" />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2">Ek Hizmetler</label>
          <div className="space-y-2">
            {[
              { key: 'hotelPickup', label: 'Otel Alışverişi', price: 50 },
              { key: 'meals', label: 'Yemek Hizmeti', price: 100 },
            ].map((service) => (
              <label key={service.key} className="flex items-center justify-between p-3 border rounded-lg">
                <span>{service.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">+{service.price} TL</span>
                  <input type="checkbox" onChange={(e) => setFormData({...formData, services: {...formData.services, [service.key]: e.target.checked}})} />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-violet-50 rounded-lg mb-4">
          <div className="flex justify-between">
            <span>Günlük Ücret: {dailyRate} TL</span>
            <span>{days} gün</span>
            <span className="font-bold text-violet-700">Toplam: {total} TL</span>
          </div>
        </div>

        <Button className="w-full bg-violet-600 text-white">Rezervasyon Talebi Gönder</Button>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Rehber Müsaitlik Kontrolü

```typescript
// src/lib/guides/availability.ts

export async function checkGuideAvailability(guideId: string, startDate: Date, endDate: Date) {
  const q = query(
    collection(db, 'guideAvailabilities'),
    where('guideId', '==', guideId),
    where('date', '>=', startDate.toISOString().split('T')[0]),
    where('date', '<=', endDate.toISOString().split('T')[0])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.every(doc => doc.data().status !== 'booked');
}
```

---

## 3. BİREYSEL SEFER PLANLAYICI 📅

### 📊 Mevcut Durum

Bu özellik tamamen yeni - mevcut değil.

---

### 🎯 Yeni Özellikler

#### 3.1 Veri Modeli

```typescript
// src/types/itinerary.ts

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  type: 'visit' | 'prayer' | 'meal' | 'rest' | 'transfer' | 'guide';
  location?: { placeId?: string; placeName?: string };
  completed: boolean;
}

export interface ItineraryDay {
  day: number;
  date: Date;
  city: 'mekke' | 'medine';
  activities: ItineraryActivity[];
  hotel?: { hotelName: string; checkIn: string; };
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean; };
}

export interface UserItinerary {
  id?: string;
  userId: string;
  name: string;
  dates: { start: Date; end: Date; totalDays: number };
  days: ItineraryDay[];
  budget: { hotels: number; transfers: number; guides: number; meals: number; total: number; };
  status: 'planning' | 'booked' | 'completed';
  createdAt: Date;
}
```

#### 3.2 Sefer Planlayıcı Component

```typescript
// src/components/itinerary/ItineraryBuilder.tsx

export function ItineraryBuilder() {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [itineraryName, setItineraryName] = useState('');

  const addDay = () => {
    const newDay: ItineraryDay = {
      day: days.length + 1,
      date: new Date(),
      city: days.length === 0 ? 'mekke' : days[days.length - 1].city,
      activities: [],
      meals: { breakfast: true, lunch: true, dinner: true },
    };
    setDays([...days, newDay]);
  };

  const addActivity = (dayIndex: number, activity: Omit<ItineraryActivity, 'id'>) => {
    const newActivity: ItineraryActivity = { ...activity, id: `activity-${Date.now()}`, completed: false };
    const updatedDays = [...days];
    updatedDays[dayIndex].activities.push(newActivity);
    setDays(updatedDays);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <input
        type="text"
        value={itineraryName}
        onChange={(e) => setItineraryName(e.target.value)}
        placeholder="Seyahat Planınızın Adı"
        className="text-2xl font-bold border-none focus:outline-none bg-transparent mb-6"
      />

      <div className="space-y-6">
        {days.map((day, idx) => (
          <Card key={day.day}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Gün {day.day} - {day.city === 'mekke' ? 'Mekke' : 'Medine'}</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {['🕌 Ziyaret', '🍽️ Yemek', '😴 Dinlenme', '🚗 Transfer'].map((template) => (
                  <button
                    key={template}
                    onClick={() => addActivity(idx, { type: 'visit', title: template.split(' ')[1], time: '09:00' })}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200"
                  >
                    {template}
                  </button>
                ))}
              </div>

              {day.activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
                  <span className="text-lg">{activity.type === 'visit' ? '🕌' : '📌'}</span>
                  <span>{activity.title}</span>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <button onClick={addDay} className="w-full py-4 border-2 border-dashed rounded-xl hover:border-emerald-500">
        + Gün Ekle
      </button>
    </div>
  );
}
```

---

## 4. FAVORİLER SİSTEMİ GELİŞTİR ⭐

### 📊 Mevcut Durum

**Mevcut:**
- ✅ Favoriler type'ları var
- ✅ Firebase fonksiyonları var
- ✅ Profil sayfasında favoriler sekmesi var

**Eksik:**
- ❌ Favori butonu component'i yok
- ❌ Her sayfada favorilere ekleme butonu yok

---

### 🎯 Yeni Özellikler

#### 4.1 Favori Butonu Component

```typescript
// src/components/favorites/FavoriteButton.tsx

export function FavoriteButton({ targetType, targetId, meta }: {
  targetType: FavoriteTargetType;
  targetId: string;
  meta: FavoriteMeta;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: isFavorited } = useQuery({
    queryKey: ['favorite', targetType, targetId, user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const favorites = await getUserFavorites(user!.id);
      return favorites.some(f => f.targetType === targetType && f.targetId === targetId);
    },
  });

  const addMutation = useMutation({
    mutationFn: () => addFavorite(user!.id, targetType, targetId, meta),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] }),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFavorite(user!.id, targetType, targetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] }),
  });

  if (!isAuthenticated) {
    return (
      <button onClick={() => {/* Login modal aç */}} className="p-2 rounded-full hover:bg-slate-100">
        <Heart className="w-5 h-5 text-slate-400" />
      </button>
    );
  }

  return (
    <button
      onClick={() => isFavorited ? removeMutation.mutate() : addMutation.mutate()}
      className="p-2 rounded-full hover:bg-slate-100 transition-colors"
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
    </button>
  );
}
```

#### 4.2 Kullanım Örneği

```typescript
// src/app/hotels/[hotelId]/page.tsx - Otel detayında

<FavoriteButton
  targetType="hotel"
  targetId={hotel.id}
  meta={{
    title: hotel.name,
    image: hotel.images[0],
    price: hotel.basePrice,
    rating: hotel.rating,
  }}
/>
```

---

## 5. KARŞILAŞTIRMA ÖZELLİĞİ ⚖️

### 📊 Mevcut Durum

Bu özellik tamamen yeni - mevcut değil.

---

### 🎯 Yeni Özellikler

#### 5.1 Karşılaştırma State

```typescript
// src/store/compare.ts

interface CompareState {
  hotels: string[];
  tours: string[];
  transfers: string[];
  guides: string[];
}

export const useCompareStore = create<CompareState>((set) => ({
  hotels: [],
  tours: [],
  transfers: [],
  guides: [],
  addHotel: (id) => set((state) => ({ ...state, hotels: [...state.hotels, id].slice(0, 3) })),
  removeHotel: (id) => set((state) => ({ ...state, hotels: state.hotels.filter(h => h !== id) })),
  clearHotels: () => set((state) => ({ ...state, hotels: [] })),
  // ... diğer tipler için benzer
}));
```

#### 5.2 Karşılaştırma Component

```typescript
// src/components/compare/CompareHotels.tsx

export function CompareHotels({ hotelIds }: { hotelIds: string[] }) {
  const { data: hotels } = useQuery({
    queryKey: ['hotels', 'compare', hotelIds],
    queryFn: () => Promise.all(hotelIds.map(id => getHotelById(id))).then(hs => hs.filter(Boolean)),
    enabled: hotelIds.length > 0,
  });

  const compareFields = [
    { key: 'name', label: 'Otel Adı' },
    { key: 'stars', label: 'Yıldız' },
    { key: 'rating', label: 'Puan' },
    { key: 'basePrice', label: 'Fiyat', format: (v: number) => formatTlUsdPairFromTl(v) },
    { key: 'haramDistance', label: 'Harem Mesafesi', format: (v: number) => `${v}m` },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6">Otel Karşılaştırma</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Özellik</th>
                {hotels?.map((hotel) => (
                  <th key={hotel.id} className="p-3 min-w-[200px]">{hotel.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field) => (
                <tr key={field.key} className="border-b">
                  <td className="p-3 font-medium">{field.label}</td>
                  {hotels?.map((hotel) => (
                    <td key={hotel.id} className="p-3">
                      {field.format ? field.format(hotel[field.key]) : hotel[field.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📅 UYGULAMA TAKVİMİ

### Hafta 1: Transfer Sistemi
- [ ] Popüler rotalar ekle
- [ ] Dinamik fiyat hesaplama
- [ ] Transfer arama formu
- [ ] Transfer sonuç sayfası

### Hafta 2: Rehber Sistemi
- [ ] Gelişmiş filtreler
- [ ] Rezervasyon formu
- [ ] Müsaitlik kontrolü
- [ ] Firebase entegrasyonu

### Hafta 3: Sefer Planlayıcı
- [ ] Veri modeli oluştur
- [ ] Ana component
- [ ] Aktivite ekleme
- [ ] Bütçe hesaplama
- [ ] Kaydetme fonksiyonu

### Hafta 4: Favoriler ve Karşılaştırma
- [ ] Favori butonu component
- [ ] Her sayfaya entegreasyon
- [ ] Karşılaştırma state
- [ ] Karşılaştırma component
- ] Karşılaştırma modal'ı

---

## 🎯 BAŞARI KRİTERLERİ

- ✅ Transfer: Popüler rotalar + dinamik fiyat
- ✅ Rehber: Rezervasyon + müsaitlik kontrolü
- ✅ Sefer Planlayıcı: Tam fonksiyonel planlama aracı
- ✅ Favoriler: Her sayfada buton + kolay yönetim
- ✅ Karşıştırma: 3 ürün karşılaştırma
