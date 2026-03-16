# Transfer Pricing - Mimari Diyagramlar

## Sistem Genel Mimari

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React)"]
        A[TransferSearchForm]
        B[LocationSelector]
        C[PopularServicesSection]
        D[usePopularTransferRoutes Hook]
        E[useTransferLocations Hook]
    end
    
    subgraph AdminPanel["Admin Panel"]
        F[Lokasyon Yönetimi]
        G[Popüler Rotalar Yönetimi]
        H[Rota Fiyatlandırma]
    end
    
    subgraph DataLayer["Veri Katmanı"]
        I[transfer-locations-data.ts]
        J[popular-transfer-routes-data.ts]
        K[transfer-pricing-data.ts]
    end
    
    subgraph Storage["Depolama"]
        L[(Firestore)]
        L1[transfer_locations]
        L2[popular_transfer_routes]
        L3[transfer_pricing]
    end
    
    A --> D
    B --> E
    C --> D
    
    D --> J
    E --> I
    
    F --> I
    G --> J
    H --> K
    
    I --> L1
    J --> L2
    K --> L3
    
    L1 --> I
    L2 --> J
    L3 --> K
```

## Veri Akışı - Admin Panel

```mermaid
sequenceDiagram
    participant Admin as Admin Kullanıcı
    participant UI as Admin UI
    participant Hook as React Query Hook
    participant Data as Data Layer
    participant Firestore as Firestore
    
    Admin->>UI: Lokasyon Ekle
    UI->>Hook: useCreateTransferLocation()
    Hook->>Data: createTransferLocation(data)
    Data->>Firestore: addDoc(transfer_locations)
    Firestore-->>Data: docId
    Data-->>Hook: id
    Hook-->>UI: onSuccess
    Hook->>Hook: invalidateQueries(['transferLocations'])
    UI-->>Admin: Başarılı
    
    Admin->>UI: Popüler Rota Ekle
    UI->>Hook: useCreatePopularTransferRoute()
    Hook->>Data: createPopularTransferRoute(data)
    Data->>Firestore: addDoc(popular_transfer_routes)
    Firestore-->>Data: docId
    Data-->>Hook: id
    Hook-->>UI: onSuccess
    Hook->>Hook: invalidateQueries(['popularTransferRoutes'])
    UI-->>Admin: Başarılı
```

## Veri Akışı - Frontend

```mermaid
sequenceDiagram
    participant User as Kullanıcı
    participant UI as TransferSearchForm
    participant Hook as usePopularTransferRoutes
    participant Data as Data Layer
    participant Firestore as Firestore
    
    User->>UI: Sayfa Yükle
    UI->>Hook: useActivePopularTransferRoutes()
    Hook->>Data: getActivePopularTransferRoutes()
    Data->>Firestore: getDocs(popular_transfer_routes)
    Firestore-->>Data: routes[]
    Data-->>Hook: routes[]
    Hook-->>UI: data: routes
    UI-->>User: Popüler Rotalar Listesi
    
    User->>UI: Rota Seç (Cidde → Mekke)
    UI->>UI: Form Doldur (from/to)
    User->>UI: Transfer Ara
    UI->>UI: /transfer-sonuclar?a yönlendir
```

## Veri Modeli İlişkileri

```mermaid
erDiagram
    TRANSFER_LOCATION ||--o{ POPULAR_TRANSFER_ROUTE : "from"
    TRANSFER_LOCATION ||--o{ POPULAR_TRANSFER_ROUTE : "to"
    POPULAR_TRANSFER_ROUTE ||--|| ROUTE_PRICING : "prices"
    
    TRANSFER_LOCATION {
        string id PK
        string name
        string city
        LocationType type
        coordinates coordinates
        boolean isActive
        number order
    }
    
    POPULAR_TRANSFER_ROUTE {
        string id PK
        string name
        string fromLocationId FK
        string toLocationId FK
        string icon
        boolean isActive
        boolean isPopular
        number order
    }
    
    ROUTE_PRICING {
        string id PK
        string routeId FK
        prices prices
        boolean isActive
        number order
    }
```

## Admin Panel Sayfa Yapısı

```mermaid
flowchart LR
    A[Admin Panel] --> B[Transfers]
    B --> C[Transfer Listesi]
    B --> D[Pricing]
    B --> E[Locations]
    
    D --> D1[Turlar Sekmesi]
    D --> D2[Transferler Sekmesi]
    D --> D3[Popüler Rotalar Sekmesi]
    
    D3 --> D3a[Rota Listesi]
    D3 --> D3b[Rota Ekle/Düzenle]
    D3 --> D3c[Rota Fiyatlandırma]
    
    E --> E1[Lokasyon Listesi]
    E --> E2[Lokasyon Ekle/Düzenle]
```

## Component Hiyerarşisi

```mermaid
flowchart TB
    subgraph AdminPanel["Admin Panel Components"]
        A[AdminTransfersPricingPage]
        B[AdminTransfersLocationsPage]
        
        A --> C[PricingTabs]
        C --> D[ToursTab]
        C --> E[TransfersTab]
        C --> F[PopularRoutesTab]
        
        F --> G[PopularRoutesTable]
        F --> H[PopularRoutesForm]
        F --> I[RoutePricingCard]
        
        B --> J[LocationsTable]
        B --> K[LocationForm]
    end
    
    subgraph Frontend["Frontend Components"]
        L[TransferSearchForm]
        M[LocationSelector]
        N[PopularServicesSection]
        
        L --> O[PopularRouteButtons]
        M --> P[LocationDropdown]
    end
```

## State Management

```mermaid
flowchart LR
    subgraph ReactQuery["React Query Cache"]
        A[transferLocations]
        B[popularTransferRoutes]
        C[routePricing]
    end
    
    subgraph Components["Components"]
        D[AdminLocationsPage]
        E[AdminPricingPage]
        F[TransferSearchForm]
        G[LocationSelector]
    end
    
    subgraph Actions["Mutations"]
        H[createLocation]
        I[updateLocation]
        J[deleteLocation]
        K[createRoute]
        L[updateRoute]
        M[deleteRoute]
    end
    
    A --> D
    A --> G
    B --> E
    B --> F
    C --> E
    
    H --> A
    I --> A
    J --> A
    K --> B
    L --> B
    M --> B
```

## Deployment Stratejisi

```mermaid
gantt
    title Transfer Pricing Entegrasyon Timeline
    dateFormat  YYYY-MM-DD
    section Faz 1
    Veri Modeli           :f1, 2026-03-17, 2d
    section Faz 2
    Backend Geliştirme    :f2, after f1, 3d
    section Faz 3
    Admin Lokasyon        :f3, after f2, 4d
    section Faz 4
    Admin Rotalar         :f4, after f3, 4d
    section Faz 5
    Frontend Entegrasyon  :f5, after f4, 3d
    section Test
    Test & QA             :f6, after f5, 2d
```
