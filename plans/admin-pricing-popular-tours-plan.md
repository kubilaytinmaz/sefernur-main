# Admin Transfer Fiyatlandırma - Popüler Turlar & Araçlar Yönetimi

## Genel Bakış

`http://localhost:3000/admin/transfers/pricing/` sayfasına **Popüler Turlar** ve **Müsait Araçlar** fiyatlandırmasını yönetmek için yeni tab'lar eklenecek.

## Mevcut Durum Analizi

### Mevcut Tab'lar (pricing/page.tsx)
1. ✅ **Araç Tipi Fiyatlandırma** (`vehicle`)
   - Araç tipine göre baz fiyat, km başı fiyat, gece sürşarjı vb.
   
2. ✅ **Rota Bazlı Fiyatlandırma** (`route`)
   - Belirli rotalar için sabit fiyatlar
   
3. ✅ **Fiyat Simülatörü** (`simulator`)
   - Fiyat hesaplama simülasyonu

### Yeni Eklenecek Tab'lar
4. 🆕 **Popüler Turlar Fiyatlandırma** (`popular-tours`)
5. 🆕 **Araç & Tur İlişkilendirme** (`vehicle-tour-matrix`)

## Veri Yapısı

### Popüler Turlar (Mevcut)
```typescript
// types/popular-service.ts
interface PopularServiceModel {
  id: string;
  type: ServiceType; // 'tour' | 'guide' | 'transfer'
  name: string;
  description: string;
  icon: string;
  duration: {
    text: string;
    hours: number;
  };
  distance: {
    km: number;
    text: string;
  };
  price: {
    display: string;      // "800₺"
    baseAmount: number;   // 800
    type: 'fixed' | 'per-person';
  };
  route: {
    from: string;
    to: string;
    stops: string[];
  };
  tourDetails: TourDetails;
  isPopular: boolean;
  order: number;
}
```

### Müsait Araçlar (Transfers - Mevcut)
```typescript
// types/transfer.ts
interface TransferModel {
  id: string;
  vehicleType: VehicleType; // 'sedan' | 'van' | 'coster' | 'bus' | 'vip' | 'jeep'
  vehicleName: string;
  basePrice: number;        // Araç baz fiyatı (örn: 100₺)
  capacity: {
    passengers: number;
    luggage: number;
  };
  // ... diğer alanlar
}
```

### Fiyat Hesaplama Mantığı (Şu Anki)
```typescript
// transfers/page.tsx - TransferCard içinde
const displayPrice = useMemo(() => {
  if (selectedServices.length === 0) {
    return transfer.basePrice;
  }

  // Sadece seçili turların toplam fiyatını göster
  let totalPrice = 0;
  
  for (const service of selectedServices) {
    totalPrice += service.price.baseAmount;
  }
  
  return totalPrice;
}, [selectedServices, transfer]);
```

## Yeni Tab 1: Popüler Turlar Fiyatlandırma

### Amaç
Popüler turların fiyatlarını toplu olarak görüntüleme ve düzenleme.

### UI Tasarımı

#### Görünüm
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎫 Popüler Turlar Fiyatlandırma                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 İstatistikler                                                │
│ ┌──────────┬──────────┬──────────┬──────────┐                  │
│ │ Toplam   │ Aktif    │ Ortalama │ En Pahalı│                  │
│ │ Turlar   │ Turlar   │ Fiyat    │ Tur      │                  │
│ │    8     │    8     │  725₺    │  1200₺   │                  │
│ └──────────┴──────────┴──────────┴──────────┘                  │
│                                                                 │
│ 🔍 Filtreler                                                    │
│ [Ara...] [Tür: Tümü ▼] [Fiyat: Tümü ▼] [Sırala: Ad ▼]         │
│                                                                 │
│ 📋 Tur Listesi                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Sıra │ İkon │ Tur Adı         │ Tür    │ Süre │ Fiyat │ ✏️  ││
│ ├──────┼──────┼─────────────────┼────────┼──────┼───────┼─────┤│
│ │  1   │ 🕌   │ Mekke Şehir Tu..│ Tur    │ 4sa  │ 800₺  │ [✏️]││
│ │  2   │ ⛰️   │ Cebeli Nur      │ Rehber │ 3sa  │ 600₺  │ [✏️]││
│ │  3   │ 🕋   │ Arafat-Mina-... │ Tur    │ 5sa  │ 850₺  │ [✏️]││
│ │  4   │ 🕌   │ Medine Şehir... │ Tur    │ 5sa  │ 900₺  │ [✏️]││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [+ Yeni Tur Ekle]  [📥 İçe Aktar]  [📤 Dışa Aktar]            │
└─────────────────────────────────────────────────────────────────┘
```

#### Düzenleme Formu (Modal/Inline)
```
┌─────────────────────────────────────────────────────┐
│ ✏️ Tur Fiyatlandırma Düzenle                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🕌 Mekke Şehir Turu                                 │
│                                                     │
│ Temel Bilgiler                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Tur Adı: Mekke Şehir Turu                       │ │
│ │ Süre: 4 saat                                    │ │
│ │ Mesafe: 45 km                                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Fiyatlandırma                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Fiyat Tipi: [●] Sabit  [ ] Kişi Başı           │ │
│ │                                                  │ │
│ │ Baz Fiyat (₺) *                                 │ │
│ │ [    800    ] ₺                                 │ │
│ │                                                  │ │
│ │ Görüntülenen Fiyat                              │ │
│ │ [  800₺     ]                                   │ │
│ │                                                  │ │
│ │ ℹ️ Bu fiyat müsait araçlar sayfasında           │ │
│ │    gösterilecektir (araç fiyatı dahil değil)    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Popülerlik                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [✓] Popüler turlar bölümünde göster             │ │
│ │ Sıralama: [ 1  ] (1-100 arası)                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│               [İptal]  [💾 Kaydet]                  │
└─────────────────────────────────────────────────────┘
```

### Özellikler
- ✅ Tüm popüler turların listesi (tablo)
- ✅ Inline düzenleme veya modal ile düzenleme
- ✅ Toplu fiyat güncelleme (seçili turlar için)
- ✅ Fiyat geçmişi (opsiyonel - sonraki aşama)
- ✅ CSV/Excel dışa aktarma
- ✅ Fiyat değişiklik önizlemesi

### API İhtiyaçları
```typescript
// lib/firebase/admin-domain.ts - Mevcut fonksiyonlar
✅ getAllPopularServices(): Promise<PopularServiceModel[]>
✅ updatePopularService(id: string, data: Partial<PopularServiceModel>): Promise<void>
✅ getPopularServiceStats(): Promise<Stats>

// Yeni eklenecek (opsiyonel)
🆕 bulkUpdatePopularServicePrices(updates: { id: string; price: number }[]): Promise<void>
🆕 getPopularServicePriceHistory(id: string): Promise<PriceHistory[]>
```

## Yeni Tab 2: Araç & Tur İlişkilendirme

### Amaç
Hangi turların hangi araçlarda gösterileceğini ve toplam fiyatın nasıl hesaplanacağını görselleştirme.

### UI Tasarımı - Matriks Görünümü

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔗 Araç & Tur Fiyat Matrisi                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ℹ️ Bu matris, hangi tur seçildiğinde hangi araçta ne kadar fiyat  │
│    gösterileceğini simüle eder.                                     │
│                                                                     │
│ 📌 Seçili Turlar                                                    │
│ [x] 🕌 Mekke Şehir Turu (800₺)                                      │
│ [x] ⛰️  Cebeli Nur (600₺)                                           │
│ [ ] 🕋 Arafat-Mina-Müzdelife (850₺)                                │
│                                                                     │
│ 🚗 Müsait Araçlar - Gösterilecek Fiyatlar                          │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Araç Tipi    │ Baz Fiyat │ Seçili Turlar │ Toplam Gösterim   ││
│ ├──────────────┼───────────┼───────────────┼───────────────────┤│
│ │ Sedan        │    100₺   │  800₺ + 600₺  │  1.400₺          ││
│ │ (Binek)      │           │               │                   ││
│ ├──────────────┼───────────┼───────────────┼───────────────────┤│
│ │ Van          │    250₺   │  800₺ + 600₺  │  1.400₺          ││
│ │ (CAMRY)      │           │               │                   ││
│ ├──────────────┼───────────┼───────────────┼───────────────────┤│
│ │ Van          │    300₺   │  800₺ + 600₺  │  1.400₺          ││
│ │ (CARNIVAL)   │           │               │                   ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ 💡 Hesaplama Mantığı                                                │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Müsait Araçlar sayfasında gösterilen fiyat:                    ││
│ │ = SADECE seçili turların toplam fiyatı                         ││
│ │ = Σ(seçili tur fiyatları)                                      ││
│ │                                                                 ││
│ │ Örnek:                                                          ││
│ │ Mekke Turu (800₺) + Cebeli Nur (600₺) = 1.400₺                ││
│ │                                                                 ││
│ │ ⚠️ Araç baz fiyatı (100₺, 250₺ vb.) dahil EDİLMİYOR           ││
│ └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Özellikler
- ✅ Tur seçim simülasyonu
- ✅ Gerçek zamanlı fiyat hesaplama gösterimi
- ✅ Araç listesi ile entegrasyon
- ✅ Hesaplama formülü açıklaması
- ✅ Test senaryoları

## Teknik Detaylar

### Yeni Tab Yapısı

```typescript
// pricing/page.tsx
type TabType = "vehicle" | "route" | "simulator" | "popular-tours" | "vehicle-tour-matrix";

const tabs = [
  { id: "vehicle", label: "Araç Tipi Fiyatlandırma", icon: Car },
  { id: "route", label: "Rota Bazlı Fiyatlandırma", icon: Route },
  { id: "simulator", label: "Fiyat Simülatörü", icon: Calculator },
  { id: "popular-tours", label: "Popüler Turlar", icon: Popcorn },      // 🆕
  { id: "vehicle-tour-matrix", label: "Araç & Tur Matrisi", icon: GripVertical }, // 🆕
];
```

### Popüler Turlar Tab Component

```typescript
interface PopularToursPricingTabProps {
  onRefresh: () => void;
}

function PopularToursPricingTab({ onRefresh }: PopularToursPricingTabProps) {
  const [services, setServices] = useState<PopularServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<PopularServiceModel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filtreleme
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'tour' | 'guide' | 'transfer',
    priceRange: 'all' as 'all' | '0-500' | '500-1000' | '1000+',
    sortBy: 'order' as 'order' | 'name' | 'price'
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getAllPopularServices();
      setServices(data.filter(s => s.isPopular).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading popular services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string, updates: Partial<PopularServiceModel>) => {
    await updatePopularService(id, updates);
    await loadServices();
    onRefresh();
  };

  // Filtreleme mantığı
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Search filter
      if (filters.search && !service.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type !== 'all' && service.type !== filters.type) {
        return false;
      }
      
      // Price range filter
      const price = service.price.baseAmount;
      if (filters.priceRange === '0-500' && price >= 500) return false;
      if (filters.priceRange === '500-1000' && (price < 500 || price >= 1000)) return false;
      if (filters.priceRange === '1000+' && price < 1000) return false;
      
      return true;
    }).sort((a, b) => {
      // Sorting
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr');
        case 'price':
          return a.price.baseAmount - b.price.baseAmount;
        case 'order':
        default:
          return a.order - b.order;
      }
    });
  }, [services, filters]);

  // İstatistikler
  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.isPopular).length,
    avgPrice: Math.round(services.reduce((sum, s) => sum + s.price.baseAmount, 0) / services.length),
    maxPrice: Math.max(...services.map(s => s.price.baseAmount))
  }), [services]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Toplam Turlar" value={stats.total} />
        <StatCard title="Aktif Turlar" value={stats.active} />
        <StatCard title="Ortalama Fiyat" value={`${stats.avgPrice}₺`} />
        <StatCard title="En Pahalı" value={`${stats.maxPrice}₺`} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          placeholder="Tur ara..."
        />
        {/* Type, Price Range, Sort filters... */}
      </div>

      {/* Services Table */}
      <DataTable
        data={filteredServices}
        columns={columns}
        onEdit={(service) => {
          setEditingService(service);
          setShowEditModal(true);
        }}
      />

      {/* Edit Modal */}
      {showEditModal && editingService && (
        <PopularTourEditModal
          service={editingService}
          onSave={handleSave}
          onClose={() => {
            setShowEditModal(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}
```

### Araç & Tur Matrisi Tab Component

```typescript
function VehicleTourMatrixTab() {
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([]);
  const [tours, setTours] = useState<PopularServiceModel[]>([]);
  const [transfers, setTransfers] = useState<TransferModel[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [toursData, transfersData] = await Promise.all([
      getAllPopularServices(),
      getActiveTransfers()
    ]);
    setTours(toursData.filter(t => t.isPopular && t.type !== 'transfer'));
    setTransfers(transfersData.sort((a, b) => a.basePrice - b.basePrice));
  };

  // Seçili turların toplam fiyatı
  const totalTourPrice = useMemo(() => {
    return selectedTourIds.reduce((sum, id) => {
      const tour = tours.find(t => t.id === id);
      return sum + (tour?.price.baseAmount || 0);
    }, 0);
  }, [selectedTourIds, tours]);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>ℹ️ Bilgi:</strong> Bu matris, kullanıcılar tur seçtiğinde müsait araçlarda
          hangi fiyatların gösterileceğini simüle eder.
        </p>
      </div>

      {/* Tour Selection */}
      <div>
        <h3 className="font-semibold mb-3">📌 Seçili Turlar</h3>
        <div className="space-y-2">
          {tours.map(tour => (
            <label key={tour.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTourIds.includes(tour.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTourIds([...selectedTourIds, tour.id]);
                  } else {
                    setSelectedTourIds(selectedTourIds.filter(id => id !== tour.id));
                  }
                }}
                className="w-4 h-4"
              />
              <span>{tour.icon}</span>
              <span className="flex-1">{tour.name}</span>
              <span className="font-semibold text-emerald-600">
                {tour.price.baseAmount}₺
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Vehicle Price Matrix */}
      <div>
        <h3 className="font-semibold mb-3">🚗 Müsait Araçlar - Gösterilecek Fiyatlar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Araç Tipi</th>
                <th className="px-4 py-3 text-right">Baz Fiyat</th>
                <th className="px-4 py-3 text-right">Seçili Turlar</th>
                <th className="px-4 py-3 text-right">Toplam Gösterim</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{vehicleTypeLabels[transfer.vehicleType]}</p>
                      <p className="text-sm text-gray-500">({transfer.vehicleName})</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {transfer.basePrice}₺
                  </td>
                  <td className="px-4 py-3 text-right">
                    {selectedTourIds.length > 0 ? (
                      <span className="text-blue-600">
                        {selectedTourIds.map(id => {
                          const tour = tours.find(t => t.id === id);
                          return tour?.price.baseAmount;
                        }).join(' + ')}₺
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-emerald-600">
                      {totalTourPrice > 0 ? `${totalTourPrice}₺` : `${transfer.basePrice}₺`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculation Logic Explanation */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          💡 Hesaplama Mantığı
        </h3>
        <div className="space-y-3 text-sm">
          <p>Müsait Araçlar sayfasında gösterilen fiyat:</p>
          <div className="bg-white rounded p-3 font-mono text-emerald-700">
            = SADECE seçili turların toplam fiyatı<br />
            = Σ(seçili tur fiyatları)
          </div>
          <p><strong>Örnek:</strong></p>
          <div className="bg-white rounded p-3">
            Mekke Turu (800₺) + Cebeli Nur (600₺) = <strong className="text-emerald-600">1.400₺</strong>
          </div>
          <p className="text-amber-700">
            ⚠️ <strong>Önemli:</strong> Araç baz fiyatı (100₺, 250₺ vb.) dahil EDİLMİYOR
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Uygulama Adımları

### Adım 1: Popüler Turlar Tab'ı Ekle
- [ ] `pricing/page.tsx` dosyasına `popular-tours` tab ekle
- [ ] `PopularToursPricingTab` component'i oluştur
- [ ] Tablo ve filtreleme UI'ı implement et
- [ ] Düzenleme modal'ı ekle
- [ ] Firebase CRUD işlemlerini bağla

### Adım 2: Araç & Tur Matrisi Tab'ı Ekle
- [ ] `vehicle-tour-matrix` tab ekle
- [ ] `VehicleTourMatrixTab` component'i oluştur
- [ ] Tur seçim UI'ı implement et
- [ ] Fiyat matrisi tablosunu oluştur
- [ ] Gerçek zamanlı hesaplama gösterimi ekle

### Adım 3: Test ve Doğrulama
- [ ] Tüm tab'ların çalıştığından emin ol
- [ ] Fiyat güncellemelerinin canlı yansıdığını kontrol et
- [ ] UI/UX iyileştirmeleri yap

## Beklenen Sonuç

Admin kullanıcısı:
1. ✅ Popüler turların fiyatlarını tek sayfadan yönetebilecek
2. ✅ Hangi turların hangi araçlarda nasıl gösterileceğini simüle edebilecek
3. ✅ Fiyat değişikliklerinin etkisini anlayabilecek
4. ✅ Toplu işlemler yapabilecek

## Notlar

- 📝 Mevcut `popular-services/page.tsx` sayfası daha detaylı tur yönetimi için kullanılabilir
- 📝 `pricing/page.tsx` sadece fiyatlandırma odaklı olacak
- 📝 İki sayfa arasında navigasyon linkleri eklenebilir
- 📝 Fiyat geçmişi ve analytics ileride eklenebilir
