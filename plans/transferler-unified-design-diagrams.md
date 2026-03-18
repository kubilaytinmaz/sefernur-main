# Transferler Sayfası - Birleşik Tasarım Diyagramları

## 1. Genel Sayfa Akışı

```mermaid
graph TD
    A[Kullanıcı /transferler sayfasına gelir] --> B{Feature Flag Kontrolü}
    B -->|USE_UNIFIED_DESIGN = true| C[Yeni Birleşik Tasarım]
    B -->|USE_UNIFIED_DESIGN = false| D[Eski Tasarım Legacy]
    
    C --> E[Hero Section - Arama Formu]
    E --> F[Birleşik Bölüm Container]
    
    F --> G[Popüler Turlar & Saatlik Kiralama]
    G --> H{Kullanıcı Seçim Yapar}
    
    H -->|Tur Seçer| I[Tur Kartı Seçili]
    H -->|Saatlik Mod Seçer| J[Saat Seçici Aktif]
    
    I --> K[Seçim Özeti Göster]
    J --> L[Saatlik Kiralama Özeti]
    
    K --> M[Müsait Araçlar - Tur Fiyatları]
    L --> N[Müsait Araçlar - Saatlik Fiyatlar]
    
    M --> O[Fiyat Animasyonu]
    N --> O
    
    O --> P[Kullanıcı Araç Seçer]
    P --> Q[Rezervasyon Sayfasına Yönlendir]
```

## 2. State Yönetimi Akışı

```mermaid
stateDiagram-v2
    [*] --> InitialLoad
    
    InitialLoad --> HourlyMode: Default Mode
    
    HourlyMode --> TourMode: Mod Değiştir
    TourMode --> HourlyMode: Mod Değiştir
    
    TourMode --> TourSelected: Tur Seç
    TourSelected --> TourMode: Tur Kaldır
    TourSelected --> MultipleTours: Başka Tur Ekle
    MultipleTours --> TourSelected: Tur Kaldır
    
    HourlyMode --> HourSelected: Saat Seç
    HourSelected --> HourlyMode: Farklı Saat Seç
    
    TourSelected --> PriceUpdate: Fiyat Hesapla
    MultipleTours --> PriceUpdate: Fiyat Hesapla
    HourSelected --> PriceUpdate: Fiyat Hesapla
    
    PriceUpdate --> VehicleCards: Kartları Güncelle
    VehicleCards --> [*]: Rezervasyon
```

## 3. Bileşen Hiyerarşisi

```mermaid
graph LR
    A[TransfersPage] --> B[Hero Section]
    A --> C[UnifiedTransferSection]
    
    C --> D[ModeSelectorArea]
    D --> D1[ModeToggle]
    D --> D2[HourSelector saatlik mod]
    
    C --> E[PopularServicesSection]
    E --> E1[ServiceCard x N]
    E1 --> E2[TourDetailModal]
    
    C --> F[SelectionSummaryCard koşullu]
    F --> F1[SelectedToursList]
    F --> F2[TotalInfo]
    
    C --> G[VehiclesSection]
    G --> G1[SectionHeader]
    G --> G2[EnhancedTransferCard x N]
    
    G2 --> H[PriceDisplay Dinamik]
    G2 --> I[VehicleInfo]
    G2 --> J[BookingLink]
```

## 4. Fiyat Hesaplama Akışı

```mermaid
flowchart TD
    Start[Kullanıcı Etkileşimi] --> CheckMode{Mod?}
    
    CheckMode -->|Saatlik| HourlyPath[Saatlik Kiralama]
    CheckMode -->|Tur| TourPath[Tur Seçimi]
    
    HourlyPath --> GetHours[Seçili Saat Al]
    GetHours --> CalcHourly[calculateHourlyPrice]
    CalcHourly --> HourlyResult[hourlyRate × hours]
    
    TourPath --> GetTours[Seçili Turlar Al]
    GetTours --> LoopTours{Her Tur İçin}
    LoopTours --> CheckVehiclePrice{vehiclePrices var mı?}
    
    CheckVehiclePrice -->|Evet| UseVehiclePrice[vehiclePrices araç tipi]
    CheckVehiclePrice -->|Hayır| UseBaseAmount[price.baseAmount]
    
    UseVehiclePrice --> AddToTotal[Toplama Ekle]
    UseBaseAmount --> AddToTotal
    
    AddToTotal --> LoopTours
    LoopTours -->|Bitti| TourResult[Toplam Fiyat]
    
    HourlyResult --> ConvertUSD[USD → TRY]
    TourResult --> ConvertUSD
    
    ConvertUSD --> FormatPrice[formatTlUsdPairFromUsd]
    FormatPrice --> UpdateUI[UI Güncelle]
    UpdateUI --> TriggerAnimation[Animasyon Tetikle]
    TriggerAnimation --> End[Bitti]
```

## 5. Kullanıcı Etkileşim Akışı - Tur Seçimi

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant TC as TourCard
    participant PS as PopularServicesSection
    participant TP as TransfersPage
    participant VC as VehicleCards
    
    U->>TC: Tur Kartına Tıkla
    TC->>PS: handleToggle serviceId
    PS->>PS: selectedServiceIds güncelle
    PS->>PS: selectedServices array oluştur
    PS->>TP: onServiceSelect serviceIds, services
    TP->>TP: State güncelle
    TP->>TP: Fiyat hesaplama başlat
    TP->>VC: Yeni props gönder
    VC->>VC: Fiyatları yeniden hesapla
    VC->>VC: Animasyon tetikle
    VC->>U: Güncel fiyatları göster
```

## 6. Kullanıcı Etkileşim Akışı - Saatlik Kiralama

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant MT as ModeToggle
    participant HS as HourSelector
    participant TP as TransfersPage
    participant VC as VehicleCards
    
    U->>MT: Saatlik Moda Geç
    MT->>TP: onModeChange hourly
    TP->>TP: mode = hourly
    TP->>TP: Tur seçimlerini temizle
    
    U->>HS: Saat Seç 3
    HS->>TP: onHoursChange 3
    TP->>TP: selectedHours = 3
    TP->>TP: Fiyat hesaplama başlat
    
    loop Her Araç İçin
        TP->>TP: calculateHourlyPrice vehicleType, 3
        TP->>TP: hourlyRate × 3
    end
    
    TP->>VC: Yeni fiyatlar gönder
    VC->>VC: Fiyatları güncelle
    VC->>VC: Animasyon tetikle
    VC->>U: 3 saatlik fiyatları göster
```

## 7. Bileşen İletişimi - Props ve State

```mermaid
graph TB
    subgraph TransfersPage State
        S1[mode: tour/hourly]
        S2[selectedServiceIds: string]
        S3[selectedServices: PopularServiceModel]
        S4[selectedHours: number]
        S5[priceChanged: boolean]
    end
    
    subgraph ModeToggle Props
        P1[mode]
        P2[onModeChange]
        P3[selectedHours]
        P4[onHoursChange]
    end
    
    subgraph PopularServicesSection Props
        P5[onServiceSelect]
        P6[selectedServiceIds]
    end
    
    subgraph SelectionSummaryCard Props
        P7[selectedServices]
        P8[mode]
        P9[selectedHours]
        P10[onRemove]
        P11[onClearAll]
    end
    
    subgraph VehicleCards Props
        P12[mode]
        P13[selectedServices]
        P14[selectedHours]
        P15[priceChanged]
    end
    
    S1 --> P1
    S1 --> P8
    S1 --> P12
    
    S2 --> P6
    
    S3 --> P7
    S3 --> P13
    
    S4 --> P3
    S4 --> P9
    S4 --> P14
    
    S5 --> P15
```

## 8. Responsive Layout Dönüşümü

```mermaid
graph LR
    subgraph Desktop > 1024px
        D1[Hero Section]
        D2[Mode Toggle Inline]
        D3[4-5 Tur Kartı Görünür]
        D4[Seçim Özeti Tam Genişlik]
        D5[Araç Kartları 4 Kolon]
    end
    
    subgraph Tablet 640-1024px
        T1[Hero Section]
        T2[Mode Toggle Inline]
        T3[2-3 Tur Kartı Görünür]
        T4[Seçim Özeti Tam Genişlik]
        T5[Araç Kartları 2-3 Kolon]
    end
    
    subgraph Mobile < 640px
        M1[Hero Section Kompakt]
        M2[Mode Toggle Stack]
        M3[1 Tur Kartı Görünür]
        M4[Seçim Özeti Collapsible]
        M5[Araç Kartları 1 Kolon]
    end
    
    Desktop --> T1
    Tablet --> M1
```

## 9. Fiyat Animasyonu Sıralaması

```mermaid
gantt
    title Fiyat Değişim Animasyonu Timeline
    dateFormat X
    axisFormat %Lms
    
    section Kullanıcı Etkileşimi
    Tur Seç/Saat Değiştir :0, 50ms
    
    section State Güncelleme
    State Update :50, 100ms
    Price Calculation :100, 150ms
    
    section UI Güncelleme
    Props Değişimi :150, 200ms
    Re-render Başlat :200, 250ms
    
    section Animasyon
    Scale Effect :250, 550ms
    Background Pulse :250, 550ms
    Color Transition :250, 550ms
    
    section Sonlandırma
    Animation Complete :550, 600ms
    Normal State :600, 650ms
```

## 10. Veri Akışı - API'den UI'ye

```mermaid
flowchart TD
    API[Firestore/JSON Data] --> Hook1[usePopularTours]
    API --> Hook2[useActiveTransfers]
    
    Hook1 --> Data1[services: PopularServiceModel]
    Hook2 --> Data2[transfers: TransferModel]
    
    Data1 --> Comp1[PopularServicesSection]
    Data2 --> Comp2[VehicleCards]
    
    Comp1 --> User1[Kullanıcı Tur Seçer]
    User1 --> State1[selectedServices State]
    
    State1 --> Calc1[Fiyat Hesaplama]
    Data2 --> Calc1
    
    Calc1 --> Price[Hesaplanan Fiyatlar]
    Price --> Comp2
    
    Comp2 --> UI[Ekranda Gösterim]
```

## 11. Hata Yönetimi Akışı

```mermaid
flowchart TD
    Start[Veri Yükleme] --> LoadTours{usePopularTours}
    Start --> LoadTransfers{useActiveTransfers}
    
    LoadTours -->|Success| ToursOK[Turlar Yüklendi]
    LoadTours -->|Error| ToursError[Hata Mesajı]
    LoadTours -->|Loading| ToursLoading[Loading Skeleton]
    
    LoadTransfers -->|Success| TransfersOK[Araçlar Yüklendi]
    LoadTransfers -->|Error| TransfersError[Hata Mesajı]
    LoadTransfers -->|Loading| TransfersLoading[Loading Skeleton]
    
    ToursError --> Fallback1[Statik Veri Göster]
    TransfersError --> Fallback2[Boş State Göster]
    
    ToursOK --> Render1[UI Render]
    TransfersOK --> Render2[UI Render]
    Fallback1 --> Render1
    Fallback2 --> Render2
    
    ToursLoading --> Skeleton1[Tur Kartı Skeleton]
    TransfersLoading --> Skeleton2[Araç Kartı Skeleton]
```

## 12. Feature Flag Implementasyonu

```mermaid
graph TD
    A[TransfersPage Component] --> B{USE_UNIFIED_DESIGN?}
    
    B -->|true| C[UnifiedTransfersPage]
    B -->|false| D[LegacyTransfersPage]
    
    C --> E[Yeni Bileşenler]
    E --> E1[ModeToggle]
    E --> E2[SelectionSummaryCard]
    E --> E3[Enhanced TransferCard]
    
    D --> F[Eski Bileşenler]
    F --> F1[Ayrı PopularServices]
    F --> F2[Ayrı TransferCard]
    
    subgraph Environment Config
        ENV[.env.local]
        ENV --> VAR[NEXT_PUBLIC_USE_UNIFIED_TRANSFER_DESIGN]
    end
    
    VAR --> B
```

## 13. Animasyon Detayları

```mermaid
graph LR
    subgraph Fiyat Değişim Animasyonu
        A1[Scale 1.0 → 1.05 → 1.0]
        A2[BG white → cyan-50 → white]
        A3[Duration: 500ms]
        A4[Easing: ease-in-out]
    end
    
    subgraph Tur Seçim Animasyonu
        B1[Border: slate → cyan]
        B2[Ring: 0 → 4px cyan]
        B3[Scale: 1.0 → 1.02]
        B4[Duration: 300ms]
    end
    
    subgraph Modal Animasyonu
        C1[Fade In Overlay]
        C2[Zoom In Content]
        C3[Slide From Bottom]
        C4[Duration: 300ms]
    end
```

## 14. Performans Optimizasyonu

```mermaid
graph TD
    Start[Component Render] --> Memo1{useMemo}
    Memo1 --> Calc1[displayPrice]
    Memo1 --> Calc2[priceLabel]
    Memo1 --> Calc3[routeDisplay]
    
    Memo1 --> Cache[Memoized Values]
    
    Start --> Callback{useCallback}
    Callback --> Func1[handleServiceSelect]
    Callback --> Func2[handleToggle]
    Callback --> Func3[handleRemove]
    
    Callback --> Stable[Stable Functions]
    
    Cache --> Render[Re-render]
    Stable --> Render
    
    Render --> Check{Props Changed?}
    Check -->|No| Skip[Skip Re-render]
    Check -->|Yes| Update[Update UI]
```

## 15. Test Stratejisi

```mermaid
graph TD
    Tests[Test Suite] --> Unit[Unit Tests]
    Tests --> Integration[Integration Tests]
    Tests --> E2E[E2E Tests]
    
    Unit --> U1[ModeToggle Logic]
    Unit --> U2[Price Calculation]
    Unit --> U3[State Management]
    
    Integration --> I1[Tur Seçimi → Fiyat Update]
    Integration --> I2[Mod Değiştirme → State Reset]
    Integration --> I3[API → UI Flow]
    
    E2E --> E1[Kullanıcı Tur Seçer]
    E2E --> E2[Saatlik Kiralama Akışı]
    E2E --> E3[Rezervasyon Tamamlama]
```

---

## Notlar

- Tüm diyagramlar Mermaid formatında
- VSCode'da Preview ile görüntülenebilir
- Implementasyon sırasında referans olarak kullanılabilir
- Gerçek zamanlı güncellenebilir
