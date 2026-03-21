# Otel Rezervasyon Mimarisi - Diyagramlar

## 1. Kullanıcı Akış Diyagramı

```mermaid
flowchart TD
    A[Otel Detay Sayfası] -->|Oda Seç + Rezervasyon Yap| B[Rezervasyon Sayfası]
    B --> C{Adım 1: Oda Seçimi}
    C -->|Oda Seçilmedi| C
    C -->|Oda Seçildi| D[Adım 2: Misafir Bilgileri]
    D -->|Form Dolduruldu| E[Adım 3: Ödeme]
    E -->|Kart Bilgileri Girildi| F[Adım 4: Onay]
    F -->|Onayla| G[Ödeme İşlemi]
    G -->|3D Secure| H[KuveytTürk Popup]
    H -->|Başarılı| I[Başarı Sayfası]
    H -->|Başarısız| J[Hata Sayfası]
    
    D -->|Geri| C
    E -->|Geri| D
    F -->|Geri| E
    
    style A fill:#e0f2fe
    style B fill:#dbeafe
    style C fill:#bfdbfe
    style D fill:#bfdbfe
    style E fill:#bfdbfe
    style F fill:#bfdbfe
    style G fill:#fef3c7
    style H fill:#fde68a
    style I fill:#d1fae5
    style J fill:#fecaca
```

## 2. Komponent Hiyerarşisi

```mermaid
graph TD
    A[page.tsx - Server] --> B[_client.tsx - Main Component]
    B --> C[HotelBookingHeader]
    B --> D[BookingStepper]
    B --> E[Main Content]
    B --> F[BookingSummaryCard - Sticky]
    
    E --> G[RoomSelectionStep]
    E --> H[GuestInfoStep]
    E --> I[PaymentStep]
    E --> J[ConfirmationStep]
    
    G --> G1[RoomCard]
    G --> G2[RoomFilters]
    
    H --> H1[GuestForm]
    H --> H2[SpecialRequests]
    
    I --> I1[PaymentForm]
    I --> I2[SecurityBadges]
    
    J --> J1[BookingSummary]
    J --> J2[ConfirmButton]
    
    F --> F1[HotelInfo]
    F --> F2[DateInfo]
    F --> F3[PriceBreakdown]
    F --> F4[SelectedRoomInfo]
    
    style A fill:#fecaca
    style B fill:#fed7aa
    style C fill:#fef3c7
    style D fill:#fef3c7
    style E fill:#d1fae5
    style F fill:#a7f3d0
```

## 3. State Yönetimi

```mermaid
stateDiagram-v2
    [*] --> Loading: Sayfa Yüklendi
    Loading --> RoomSelection: Veriler Yüklendi
    
    RoomSelection --> RoomSelection: Oda Değiştir
    RoomSelection --> GuestInfo: Oda Seçildi & İleri
    
    GuestInfo --> RoomSelection: Geri
    GuestInfo --> GuestInfo: Form Güncelle
    GuestInfo --> Payment: Form Valid & İleri
    
    Payment --> GuestInfo: Geri
    Payment --> Payment: Kart Bilgileri Güncelle
    Payment --> Confirmation: Kart Valid & İleri
    
    Confirmation --> Payment: Geri
    Confirmation --> Processing: Onayla
    
    Processing --> ThreeDSecure: Block & Booking Başarılı
    Processing --> Error: API Hatası
    
    ThreeDSecure --> Success: Ödeme Başarılı
    ThreeDSecure --> Error: Ödeme Başarısız
    
    Error --> RoomSelection: Tekrar Dene
    Success --> [*]
```

## 4. API Akış Diyagramı

```mermaid
sequenceDiagram
    actor User as Kullanıcı
    participant UI as Frontend
    participant API as Next.js API
    participant WB as WebBeds API
    participant KT as KuveytTürk

    Note over User,KT: Adım 1: Oda Seçimi
    User->>UI: Sayfa yükle
    UI->>API: GET /api/hotels/[id]
    API->>WB: Hotel details request
    WB-->>API: Hotel data
    API-->>UI: Hotel info
    
    UI->>API: POST /api/hotels/[id]/rooms
    API->>WB: GetRooms request
    WB-->>API: Room list
    API-->>UI: Available rooms
    
    User->>UI: Oda seç
    
    Note over User,KT: Adım 2-3: Form Doldur
    User->>UI: Misafir bilgileri gir
    User->>UI: Ödeme bilgileri gir
    
    Note over User,KT: Adım 4: Onay
    User->>UI: Rezervasyonu onayla
    
    UI->>API: POST /api/hotels/[id]/block
    API->>WB: Block room (15 min hold)
    WB-->>API: Block ID
    API-->>UI: Block confirmed
    
    UI->>API: POST /api/hotels/[id]/booking
    API->>WB: Confirm booking
    WB-->>API: Booking reference
    API-->>UI: Booking confirmed
    
    UI->>API: POST /api/payment/kuveytturk/initiate
    API->>KT: 3D Payment request
    KT-->>API: 3D Secure HTML
    API-->>UI: Payment form
    
    UI->>User: Popup aç
    User->>KT: 3D doğrulama
    KT-->>User: Sonuç
    
    KT->>API: POST /api/payment/kuveytturk/callback
    API-->>UI: Redirect to result
    UI->>User: Başarı/Hata sayfası
```

## 5. Dosya Yapısı Diyagramı

```mermaid
graph LR
    A[web-app/src] --> B[app]
    A --> C[components]
    A --> D[types]
    A --> E[lib]
    
    B --> B1[otel-rezervasyon]
    B1 --> B11[hotelSlug]
    B11 --> B111[page.tsx]
    B11 --> B112[_client.tsx]
    
    B --> B2[api/hotels]
    B2 --> B21[hotelId/booking/route.ts]
    B2 --> B22[hotelId/block/route.ts]
    
    C --> C1[hotels]
    C1 --> C11[booking]
    C11 --> C111[BookingStepper.tsx]
    C11 --> C112[RoomSelectionStep.tsx]
    C11 --> C113[GuestInfoStep.tsx]
    C11 --> C114[PaymentStep.tsx]
    C11 --> C115[ConfirmationStep.tsx]
    C11 --> C116[BookingSummaryCard.tsx]
    C11 --> C117[index.ts]
    
    D --> D1[hotel-booking.ts]
    
    E --> E1[hotels]
    E1 --> E11[booking-helpers.ts]
    E1 --> E12[validation.ts]
    
    style B1 fill:#dbeafe
    style C11 fill:#d1fae5
    style D1 fill:#fef3c7
    style E1 fill:#fecaca
```

## 6. Responsive Layout Diyagramı

```mermaid
graph TB
    subgraph Desktop 1280px+
    D1[Header - Sticky]
    D2[Stepper]
    D3[Content 2/3]
    D4[Sidebar 1/3 - Sticky]
    end
    
    subgraph Tablet 768px - 1280px
    T1[Header - Sticky]
    T2[Stepper]
    T3[Content Full Width]
    T4[Sidebar - Static Below]
    end
    
    subgraph Mobile 768px-
    M1[Header - Sticky]
    M2[Stepper - Horizontal]
    M3[Content Full Width]
    M4[Summary - Bottom Sheet]
    end
    
    style D3 fill:#dbeafe
    style D4 fill:#a7f3d0
    style T3 fill:#dbeafe
    style T4 fill:#a7f3d0
    style M3 fill:#dbeafe
    style M4 fill:#a7f3d0
```

## 7. Veri Akışı (State Flow)

```mermaid
flowchart LR
    A[URL Params] --> B[Initial State]
    B --> C{Current Step}
    
    C -->|1| D[Room Selection State]
    C -->|2| E[Guest Info State]
    C -->|3| F[Payment State]
    C -->|4| G[Confirmation State]
    
    D --> H[Selected Room]
    E --> I[Guest Data]
    F --> J[Payment Data]
    G --> K[Complete Booking]
    
    H --> L[Summary Card]
    I --> L
    J --> L
    K --> M[Submit to API]
    
    M --> N{Success?}
    N -->|Yes| O[Redirect to Success]
    N -->|No| P[Show Error]
    
    P --> C
    
    style A fill:#fef3c7
    style B fill:#bfdbfe
    style C fill:#dbeafe
    style L fill:#a7f3d0
    style M fill:#fde68a
    style O fill:#d1fae5
    style P fill:#fecaca
```

## 8. Hata Yönetimi Akışı

```mermaid
flowchart TD
    A[User Action] --> B{Validation}
    B -->|Client Invalid| C[Show Field Errors]
    B -->|Client Valid| D[API Call]
    
    D --> E{API Response}
    E -->|200 Success| F[Next Step]
    E -->|400 Bad Request| G[Show Form Errors]
    E -->|404 Not Found| H[Show Not Found]
    E -->|500 Server Error| I[Show Server Error]
    E -->|Network Error| J[Show Network Error]
    
    C --> K[User Fixes]
    G --> K
    H --> L[Retry Button]
    I --> L
    J --> L
    
    K --> A
    L --> A
    
    style B fill:#fef3c7
    style E fill:#fde68a
    style F fill:#d1fae5
    style C fill:#fecaca
    style G fill:#fecaca
    style H fill:#fecaca
    style I fill:#fecaca
    style J fill:#fecaca
```

## 9. Ödeme Güvenlik Akışı

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant V as Validator
    participant A as API
    participant B as Block
    participant R as Reserve
    participant P as Payment
    participant T as 3D Secure

    U->>F: Ödeme bilgileri gir
    F->>V: Client-side validation
    
    alt Invalid
        V-->>F: Validation errors
        F-->>U: Hata göster
    else Valid
        V-->>F: Valid
        F->>A: Submit booking
        
        A->>B: Block room (15 min)
        B-->>A: Block ID
        
        A->>R: Create reservation
        R-->>A: Booking reference
        
        A->>P: Initialize payment
        P-->>A: Payment HTML
        
        A-->>F: Payment form
        F->>U: Open 3D popup
        
        U->>T: Authenticate
        T->>P: Verify
        
        alt Success
            P-->>F: Success callback
            F-->>U: Başarı sayfası
        else Failure
            P-->>F: Failure callback
            F-->>U: Hata sayfası
        end
    end
```

## 10. Mobil Optimizasyon Stratejisi

```mermaid
graph TD
    A[Mobile Entry] --> B{Screen Size Check}
    B -->|< 768px| C[Mobile Layout]
    B -->|>= 768px| D[Desktop Layout]
    
    C --> C1[Vertical Stepper]
    C --> C2[Full Width Content]
    C --> C3[Bottom Sheet Summary]
    C --> C4[Touch Gestures]
    
    D --> D1[Horizontal Stepper]
    D --> D2[Two Column Layout]
    D --> D3[Sticky Sidebar]
    D --> D4[Mouse/Keyboard Nav]
    
    C1 --> E[Auto Focus]
    C2 --> E
    C3 --> F[Swipe Actions]
    C4 --> F
    
    D1 --> G[Tab Navigation]
    D2 --> G
    D3 --> G
    D4 --> G
    
    E --> H[Smooth Scroll]
    F --> H
    G --> H
    
    style C fill:#dbeafe
    style D fill:#a7f3d0
    style H fill:#fef3c7
```

## 11. Performance Optimizasyon Stratejisi

```mermaid
flowchart LR
    A[Initial Load] --> B[Critical CSS]
    A --> C[Server Components]
    
    B --> D[First Paint]
    C --> D
    
    D --> E[Lazy Load Steps]
    E --> F[Code Splitting]
    
    F --> G{User Interaction}
    G -->|Step 1| H[Load Room Components]
    G -->|Step 2| I[Load Guest Form]
    G -->|Step 3| J[Load Payment]
    G -->|Step 4| K[Load Confirmation]
    
    H --> L[Prefetch Next Step]
    I --> L
    J --> L
    
    L --> M[Cache API Responses]
    M --> N[Optimistic UI]
    
    style A fill:#fef3c7
    style D fill:#d1fae5
    style F fill:#dbeafe
    style N fill:#a7f3d0
```

## 12. SEO ve Meta Tags Yapısı

```mermaid
graph TD
    A[Page Load] --> B[Generate Metadata]
    B --> C[Hotel Name]
    B --> D[Description]
    B --> E[OG Image]
    B --> F[Canonical URL]
    
    C --> G[Title Tag]
    D --> H[Meta Description]
    E --> I[Open Graph]
    F --> J[Link Canonical]
    
    G --> K[Search Result]
    H --> K
    I --> L[Social Share]
    J --> M[SEO Ranking]
    
    style A fill:#fef3c7
    style B fill:#dbeafe
    style K fill:#d1fae5
    style L fill:#a7f3d0
    style M fill:#fecaca
```

## Notlar

- Tüm diyagramlar Mermaid formatında
- Renk kodları tutarlı kullanılmış
- Her diyagram belirli bir bakış açısını gösteriyor
- Implementation sırasında referans olarak kullanılabilir
