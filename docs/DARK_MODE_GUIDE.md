# Sefernur - Karanlık Mod (Dark Mode) Rehberi

Bu döküman, uygulamanın karanlık mod uyumluluğu için izlenmesi gereken kuralları ve kullanılacak renk değerlerini içerir.

---

## 📌 Temel Kurallar

### 1. Yeşil Alanlar
- **Yeşil gradyanlar** her iki modda da YEŞİL kalmalı
- Açık mod: `Colors.green.shade600` → `Colors.green.shade400`
- Karanlık mod: `Colors.green.shade600` → `Colors.green.shade900`

```dart
// ✅ Doğru kullanım
gradient: LinearGradient(
  colors: isDark 
    ? [Colors.green.shade600, Colors.green.shade900]  // Dark
    : [Colors.green.shade600, Colors.green.shade400], // Light
)

// ❌ Yanlış - yeşil alanlar siyaha dönüşmemeli
gradient: LinearGradient(
  colors: [theme.primaryColor, Colors.black] // YANLIŞ!
)
```

### 2. Yeşil Arka Plan Üzerindeki İçerik
- Yeşil arka plan üzerindeki tüm içerikler **HER ZAMAN BEYAZ** olmalı
- Bu kural her iki mod için de geçerli

```dart
// ✅ Doğru kullanım (yeşil arka plan üzerinde)
Text(
  'Başlık',
  style: TextStyle(color: Colors.white),
)

// ❌ Yanlış - yeşil üzerinde siyah metin
Text(
  'Başlık',
  style: TextStyle(color: theme.colorScheme.onSurface), // YANLIŞ!
)
```

### 3. İkonlar
- Ayarlarda ve önemli alanlarda ikonlar **YEŞİL** olmalı
- `Colors.green.shade600` kullanın
- `theme.primaryColor` veya `Get.theme.primaryColor` kullanmaktan kaçının

```dart
// ✅ Doğru kullanım
Icon(
  Icons.settings,
  color: Colors.green.shade600,
)

// ❌ Kaçının
Icon(
  Icons.settings,
  color: theme.primaryColor, // Tema değişirse sorun olabilir
)
```

---

## 🎨 Renk Kullanım Tablosu

| Element | Açık Mod | Karanlık Mod |
|---------|----------|--------------|
| **Scaffold Background** | `theme.scaffoldBackgroundColor` | `theme.scaffoldBackgroundColor` |
| **Kart Arka Plan** | `theme.colorScheme.surface` | `theme.colorScheme.surface` |
| **Ana Metin** | `theme.colorScheme.onSurface` | `theme.colorScheme.onSurface` |
| **İkincil Metin** | `theme.colorScheme.onSurfaceVariant` | `theme.colorScheme.onSurfaceVariant` |
| **Border** | `Colors.grey.shade200` | `theme.colorScheme.outline` |
| **Container Arka Plan** | `Colors.grey[50]` | `theme.colorScheme.surfaceContainerHigh` |
| **Gölge** | `Colors.grey.withOpacity(0.1)` | `Colors.black26` |
| **Yeşil Gradient (başlangıç)** | `Colors.green.shade600` | `Colors.green.shade600` |
| **Yeşil Gradient (bitiş)** | `Colors.green.shade400` | `Colors.green.shade900` |
| **Yeşil İkon** | `Colors.green.shade600` | `Colors.green.shade600` |
| **Yeşil Üzerinde Metin** | `Colors.white` | `Colors.white` |

---

## 🔧 Kod Örnekleri

### Theme-Aware Container
```dart
final theme = Theme.of(context);
final isDark = theme.brightness == Brightness.dark;

Container(
  decoration: BoxDecoration(
    color: theme.colorScheme.surface,
    borderRadius: BorderRadius.circular(16.r),
    boxShadow: [
      BoxShadow(
        color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1),
        blurRadius: 10,
        offset: const Offset(0, 2),
      ),
    ],
  ),
)
```

### Theme-Aware Border
```dart
border: Border.all(
  color: isDark ? theme.colorScheme.outline : Colors.grey[200]!,
)
```

### Theme-Aware Secondary Container
```dart
Container(
  color: isDark 
    ? theme.colorScheme.surfaceContainerHigh 
    : Colors.grey[50],
)
```

### Yeşil Header
```dart
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: isDark 
        ? [Colors.green.shade600, Colors.green.shade900]
        : [Colors.green.shade600, Colors.green.shade400],
    ),
  ),
  child: Column(
    children: [
      // Header içeriği HER ZAMAN beyaz
      Text(
        'Başlık',
        style: TextStyle(
          color: Colors.white, // Mod ne olursa olsun beyaz
          fontWeight: FontWeight.bold,
        ),
      ),
      Icon(
        Icons.person,
        color: Colors.white, // Mod ne olursa olsun beyaz
      ),
    ],
  ),
)
```

### Filter Chips (Seçili/Seçilmemiş)
```dart
Widget _buildChip(bool selected) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;
  
  return Container(
    decoration: BoxDecoration(
      color: selected 
        ? Colors.green.shade600  // Seçili: yeşil arka plan
        : isDark 
          ? theme.colorScheme.surfaceContainerHigh  // Dark: koyu gri
          : Colors.grey.shade100,  // Light: açık gri
      borderRadius: BorderRadius.circular(18.r),
      border: Border.all(
        color: selected 
          ? Colors.green.shade600 
          : isDark 
            ? theme.colorScheme.outline 
            : Colors.grey.shade300,
      ),
    ),
    child: Text(
      'Label',
      style: TextStyle(
        color: selected 
          ? Colors.white  // Seçili: beyaz metin
          : theme.colorScheme.onSurface,  // Seçilmemiş: tema rengi
      ),
    ),
  );
}
```

### Settings Item
```dart
_SettingsItem(
  icon: Container(
    padding: EdgeInsets.all(8.w),
    decoration: BoxDecoration(
      color: isDark 
        ? theme.colorScheme.surfaceContainerHigh 
        : Colors.grey.shade100,
      borderRadius: BorderRadius.circular(8.r),
    ),
    child: Icon(
      Icons.settings,
      color: Colors.green.shade600,  // İkon her zaman yeşil
    ),
  ),
  title: Text(
    'Başlık',
    style: TextStyle(color: theme.colorScheme.onSurface),
  ),
  subtitle: Text(
    'Alt başlık',
    style: TextStyle(color: theme.colorScheme.onSurfaceVariant),
  ),
)
```

### Switch Item
```dart
Switch(
  value: isActive,
  onChanged: onChanged,
  activeColor: Colors.green.shade600,
  activeTrackColor: Colors.green.shade300,
  inactiveThumbColor: isDark ? Colors.grey[400] : Colors.grey[300],
  inactiveTrackColor: isDark 
    ? Colors.grey[700] 
    : Colors.grey[200],
)
```

---

## ⚠️ Kaçınılması Gerekenler

### 1. Get.theme.primaryColor kullanımı
```dart
// ❌ Kaçının
color: Get.theme.primaryColor

// ✅ Doğru
color: Colors.green.shade600  // Sabit yeşil için
color: theme.colorScheme.primary  // Theme-aware için
```

### 2. Hardcoded Colors.white arka plan
```dart
// ❌ Kaçının
Container(color: Colors.white)

// ✅ Doğru
Container(color: theme.colorScheme.surface)
```

### 3. Hardcoded Colors.grey kullanımı
```dart
// ❌ Kaçının
Container(color: Colors.grey[100])
Text(style: TextStyle(color: Colors.grey[600]))

// ✅ Doğru
Container(color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[100])
Text(style: TextStyle(color: theme.colorScheme.onSurfaceVariant))
```

### 4. withOpacity ile yeşil renk
```dart
// ❌ Kaçının - opacity yeşili soldurur
color: Colors.green.withOpacity(0.5)

// ✅ Doğru - farklı shade kullan
color: Colors.green.shade400  // Daha açık yeşil
color: Colors.green.shade900  // Daha koyu yeşil
```

---

## 📁 Düzeltilmiş Dosyalar

Karanlık mod uyumluluğu için düzeltilmiş dosyalar:

### Profile Bölümü
- [x] `lib/app/view/pages/profile/profile_content.dart`
- [x] `lib/app/view/pages/profile/widgets/profile_header.dart`
- [x] `lib/app/view/pages/profile/widgets/settings_tab.dart`
- [x] `lib/app/view/pages/profile/widgets/reservations_tab.dart` ✨
- [x] `lib/app/view/pages/profile/widgets/reviews_tab.dart` ✨
- [x] `lib/app/view/pages/profile/widgets/applications_tab.dart` ✨
- [x] `lib/app/view/pages/profile/widgets/favorites_tab.dart` ✨
- [x] `lib/app/view/pages/profile/widgets/favorite_detail_sheet.dart` ✨
- [x] `lib/app/view/pages/profile/widgets/guest_profile_view.dart`
- [x] `lib/app/view/pages/profile/widgets/shared/empty_state.dart`

### Travels Bölümü
- [x] `lib/app/view/pages/travels/travels_content.dart`

### Tema Dosyaları
- [x] `lib/app/view/themes/theme_dark.dart`
- [x] `lib/app/view/themes/theme_light.dart`
- [x] `lib/main.dart` (Obx wrapper)

---

## 🔍 Kontrol Listesi

Yeni bir sayfa veya widget oluştururken:

- [ ] `Theme.of(context)` ile theme alındı mı?
- [ ] `isDark = theme.brightness == Brightness.dark` tanımlandı mı?
- [ ] Arka plan renkleri `theme.colorScheme.surface` kullanıyor mu?
- [ ] Metin renkleri `theme.colorScheme.onSurface/onSurfaceVariant` kullanıyor mu?
- [ ] Border renkleri `isDark` kontrolüyle belirleniyor mu?
- [ ] Shadow renkleri `isDark` kontrolüyle belirleniyor mu?
- [ ] Yeşil alanlar `Colors.green.shade600/400/900` kullanıyor mu?
- [ ] Yeşil arka plan üzerindeki içerikler `Colors.white` kullanıyor mu?
- [ ] İkonlar `Colors.green.shade600` kullanıyor mu?
- [ ] `Get.theme.primaryColor` yerine doğrudan renk kullanılıyor mu?

---

## 📱 Test Kontrol Listesi

Karanlık modu test ederken kontrol edilecekler:

1. **Header Gradient**: Yeşil mi? (siyah değil)
2. **Tab Bar**: Yeşil mi? (siyah değil)
3. **İkonlar**: Yeşil mi? (siyah değil)
4. **Kartlar**: Koyu gri arka plan mı? (siyah değil)
5. **Metinler**: Okunabilir mi?
6. **Border'lar**: Görünür mü?
7. **Shadow'lar**: Çok koyu değil mi?
8. **Yeşil üzerindeki içerik**: Beyaz mı? (siyah değil)
9. **Switch'ler**: Çalışıyor mu? Renkleri doğru mu?
10. **Filter Chips**: Seçili/seçilmemiş durumları ayırt edilebiliyor mu?

---

*Son güncelleme: 2024*
*Hazırlayan: GitHub Copilot*
