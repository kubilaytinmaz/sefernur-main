# Transfer Fiyatlandırma Sistemi - Mimari Diyagram

## Sistem Akış Diyagramı

```mermaid
flowchart TD
    subgraph AdminPanel[Admin Panel]
        A[Rota Yönetimi] --> B[Fiyat Girişi USD]
        C[Araç-Tur Matrisi] --> D[Override Fiyatları]
        E[Popüler Turlar] --> F[Rota Bağlantısı]
    end

    subgraph Firestore[Firestore Database]
        G[transfer_pricing] --> H[Route Documents]
        I[popularServices] --> J[Tour Documents]
    end

    subgraph PricingEngine[Fiyat Hesaplama Motoru]
        K[calculateRoutePrice] --> L[USD Fiyat]
        M[calculateTourPrice] --> N[Override Check]
        O[convertUSDToTL] --> P[TL Fiyat]
    end

    subgraph UserInterface[Kullanıcı Arayüzü]
        Q[Transfer Arama] --> R[Fiyat Gösterimi TL]
        S[Popüler Turlar] --> T[Araç Seçimi]
    end

    A --> G
    C --> I
    E --> I
    H --> K
    J --> M
    L --> O
    N --> O
    P --> R
    P --> T
```

## Veri Modeli İlişkileri

```mermaid
erDiagram
    TRANSFER_PRICING ||--o{ POPULAR_SERVICES : "route_pricing_id"
    TRANSFER_PRICING {
        string id PK
        string type "route"
        string route_id UK
        string route_name
        string from_city
        string to_city
        number distance_km
        object prices "USD"
        boolean is_active
        number order
    }
    POPULAR_SERVICES {
        string id PK
        string type "tour/guide/transfer"
        string name
        string icon
        object price "base USD"
        object vehicle_prices "override USD"
        string route_pricing_id FK
        boolean is_popular
        number order
    }
```

## Fiyat Hesaplama Mantığı

```mermaid
graph TD
    A[Fiyat İsteği] --> B{Rota ID var mı?}
    B -->|Evet| C[transfer_pricing'den çek]
    B -->|Hayır| D[Varsayılan hesaplama]
    C --> E{Araç tipi fiyatı var mı?}
    E -->|Evet| F[Rota fiyatını kullan]
    E -->|Hayır| G[Base fiyatı kullan]
    D --> H{Tour override var mı?}
    H -->|Evet| I[Override fiyatı kullan]
    H -->|Hayır| G
    F --> J[USD → TL dönüşüm]
    G --> J
    I --> J
    J --> K[Kullanıcıya göster]
```

## Admin Panel Tab Yapısı

```mermaid
graph LR
    A[Transfer Fiyatlandırma] --> B[Rota Fiyatları]
    A --> C[Araç-Tur Matrisi]
    A --> D[Popüler Turlar]
    A --> E[Fiyat Simülatörü]

    B --> B1[Rota Ekle]
    B --> B2[Rota Düzenle]
    B --> B3[Fiyat Girişi 6 Araç]

    C --> C1[Matris Görünümü]
    C --> C2[Hücre Düzenle]

    D --> D1[Tur Listesi]
    D --> D2[Rota Bağla]
    D --> D3[Override Fiyat]

    E --> E1[Parametre Seç]
    E --> E2[Hesapla]
    E --> E3[TL Sonuç]
```

## Bileşen Hiyerarşisi

```
/admin/transfers/pricing/page.tsx
├── tabs/RoutePricingTab.tsx
│   ├── components/RoutePricingForm.tsx
│   ├── components/RoutePricingTable.tsx
│   └── components/VehiclePriceInputs.tsx
├── tabs/VehicleTourMatrixTab.tsx
│   └── components/PriceEditModal.tsx
├── tabs/PopularToursPricingTab.tsx
│   └── components/TourEditModal.tsx
└── tabs/PriceSimulatorTab.tsx
```

## API Fonksiyonları

### Firebase CRUD

```typescript
// Rota Fiyatları
createRoutePricing(data, updatedBy) -> Promise<string>
updateRoutePricing(id, data) -> Promise<void>
deleteRoutePricing(id) -> Promise<void>
getRoutePricingByRouteId(routeId) -> Promise<RoutePricingModel | null>
getAllRoutePricing() -> Promise<RoutePricingModel[]>

// Popüler Servisler
updatePopularService(id, data) -> Promise<void>
getAllPopularServices(filters?) -> Promise<PopularServiceModel[]>
```

### Fiyat Hesaplama

```typescript
// Ana hesaplama
calculateTransferPrice(input) -> PriceCalculationResult
calculateRoutePrice(routeId, vehicleType) -> number
calculateTourPrice(tourId, vehicleType) -> number

// Dönüşüm
convertUSDToTL(usdAmount) -> number
formatPrice(amount, currency) -> string

// Yardımcı
getRouteFixedPrice(routeId, vehicleType) -> number | null
isVehicleSuitable(vehicleType, passengerCount) -> boolean
```

## Kullanıcı Tarafı Entegrasyon

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant UI as Arayüz
    participant API as Fiyat API
    participant DB as Firestore

    U->>UI: Transfer Arama
    UI->>API: calculateTransferPrice()
    API->>DB: getRoutePricingByRouteId()
    DB-->>API: Route Data (USD)
    API->>API: convertUSDToTL()
    API-->>UI: Price (TL)
    UI-->>U: Fiyat Göster
```

## Veri Akışı

1. **Admin Panel**
   - Admin rota ekler → `transfer_pricing` koleksiyonuna kaydet
   - Admin araç fiyatı girer → `prices` objesine USD olarak kaydet
   - Admin popüler tur ekler → `route_pricing_id` ile bağla

2. **Fiyat Hesaplama**
   - Kullanıcı transfer arar → `routeId` ile fiyat çek
   - Rota fiyatı yoksa → varsayılan hesaplama
   - Override varsa → override fiyatı kullan
   - USD → TL dönüşüm → kullanıcıya göster

3. **Popüler Turlar**
   - Tur listesi yüklenir → `route_pricing_id` kontrol et
   - Bağlantı varsa → rota fiyatlarını çek
   - Override varsa → override kullan
   - TL dönüşüm → göster
