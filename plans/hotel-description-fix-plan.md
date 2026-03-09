# Otel Açıklaması (Description) Çözüm Planı

## 🔍 Sorun Analizi

### Mevcut Durum
- WebBeds API'den otel detayları çekilirken `description` alanı boş geliyor
- Frontend'de `HotelInfoSection` bileşeni description'ı göstermeye hazır (satır 116-120)
- API route'da `description: hotel.description` olarak döndürülüyor ancak bu değer `undefined`

### Kök Neden
WebBeds V4 API'de `description1` alanı basit bir string değil, `descriptionType` adında karmaşık bir XML yapısı:

```xml
<description1>
    <language id="1" name="English">Hotel description text...</language>
    <language id="2" name="Turkish">Otel açıklaması...</language>
</description1>
```

XSD Tanımı (docs/dotwconnect.com.md satır 10761-10774):
```xml
<xs:complexType name="descriptionType">
    <xs:sequence>
        <xs:element name="language" minOccurs="1" maxOccurs="10">
            <xs:complexType>
                <xs:simpleContent>
                    <xs:extension base="xs:string">
                        <xs:attribute name="id" type="languageType" use="required"/>
                        <xs:attribute name="name" type="languageNameType" use="required"/>
                    </xs:extension>
                </xs:simpleContent>
            </xs:complexType>
        </xs:element>
    </xs:sequence>
</xs:complexType>
```

### Mevcut Kod Sorunu
`xml-parser.ts` satır 287'de:
```typescript
const description = getString(hotel, ["description1", "description"]);
```

`getString()` fonksiyonu sadece string tipindeki değerleri döndürüyor (satır 30: `typeof direct !== "object"` kontrolü). `description1` bir nesne olduğu için bu fonksiyon `undefined` döndürüyor.

---

## 🛠️ Çözüm Planı

### Adım 1: XML Parser'a Description Extraction Fonksiyonu Ekle

**Dosya:** `web-app/src/lib/webbeds/xml-parser.ts`

Yeni bir `extractDescription()` helper fonksiyonu eklenecek:

```typescript
/**
 * Extract description from description1/description2 fields.
 * These fields contain language objects with text content.
 * 
 * Structure: description1 > language[id, name, #text]
 * 
 * Priority:
 * 1. Turkish (id=2) if available
 * 2. English (id=1) as fallback
 * 3. First available language
 */
function extractDescription(hotel: XmlObject): string | undefined {
  const descKeys = ["description1", "description2"];
  
  for (const key of descKeys) {
    const descNode = hotel[key];
    if (!descNode || typeof descNode !== "object" || Array.isArray(descNode)) continue;
    
    const descObj = descNode as XmlObject;
    const languages = asArray(descObj["language"]);
    
    if (languages.length === 0) continue;
    
    // Try Turkish first (id="2")
    const turkish = languages.find((lang: unknown) => {
      const langObj = asObject(lang);
      return langObj?.["@_id"] === "2" || langObj?.["@_id"] === 2;
    });
    if (turkish) {
      const text = getDescriptionText(turkish);
      if (text) return text;
    }
    
    // Fallback to English (id="1")
    const english = languages.find((lang: unknown) => {
      const langObj = asObject(lang);
      return langObj?.["@_id"] === "1" || langObj?.["@_id"] === 1;
    });
    if (english) {
      const text = getDescriptionText(english);
      if (text) return text;
    }
    
    // Last resort: first available language
    const first = languages[0];
    const text = getDescriptionText(first);
    if (text) return text;
  }
  
  return undefined;
}

/**
 * Get text content from a language object.
 * Handles both direct text and CDATA wrapped content.
 */
function getDescriptionText(language: unknown): string | undefined {
  const langObj = asObject(language);
  if (!langObj) return undefined;
  
  // Try #text first (CDATA content)
  const textContent = langObj["#text"];
  if (typeof textContent === "string" && textContent.trim()) {
    return textContent.trim();
  }
  
  // Try direct string value
  if (typeof language === "string" && language.trim()) {
    return language.trim();
  }
  
  return undefined;
}
```

### Adım 2: normalizeHotelNode Fonksiyonunu Güncelle

**Dosya:** `web-app/src/lib/webbeds/xml-parser.ts` (satır ~286)

Mevcut kod:
```typescript
// Description
const description = getString(hotel, ["description1", "description"]);
```

Yeni kod:
```typescript
// Description - extract from description1/description2 language objects
const description = extractDescription(hotel) || getString(hotel, ["description"]);
```

### Adım 3: XML Builder'a description2 Alanını Ekle (Opsiyonel)

**Dosya:** `web-app/src/lib/webbeds/xml-builder.ts` (satır ~159)

Mevcut zaten `description1` isteniyor. İsteğe bağlı olarak `description2` de eklenebilir:

```typescript
<field>description1</field>
<field>description2</field>  <!-- Opsiyonel: ikinci açıklama alanı -->
```

### Adım 4: Test Senaryosu

Gerçek bir otel ID'si ile API'yi test ederek description'ın geldiğini doğrulayın:

```bash
# Test endpoint
curl "http://localhost:3000/api/hotels/30714?checkIn=2025-12-09&checkOut=2025-12-12"
```

Beklenen yanıt:
```json
{
  "success": true,
  "data": {
    "hotelId": "30714",
    "hotelName": "Örnek Otel",
    "description": "Otelin detaylı açıklaması burada yer alacak...",
    ...
  }
}
```

---

## 📋 Değişiklik Özeti

| Dosya | Değişiklik | Satır |
|-------|-----------|------|
| `xml-parser.ts` | `extractDescription()` fonksiyonu ekle | ~175 |
| `xml-parser.ts` | `getDescriptionText()` helper fonksiyonu ekle | ~220 |
| `xml-parser.ts` | `normalizeHotelNode()` içinde description extraction güncelle | ~286 |
| `xml-builder.ts` | `description2` alanını ekle (opsiyonel) | ~160 |

---

## 🎯 Başarı Kriterleri

1. [ ] API yanıtında `description` alanı dolu geliyor
2. [ ] Türkçe açıklama varsa Türkçe, yoksa İngilizce gösteriliyor
3. [ ] Frontend'de `HotelInfoSection` bileşeninde description görüntüleniyor
4. [ ] CDATA ile sarılmış açıklamalar doğru parse ediliyor
5. [ ] Hiçbir açıklama yoksa graceful fallback çalışıyor

---

## 📝 Notlar

- WebBeds API'de `description1` ve `description2` olmak üzere iki ayrı açıklama alanı var
- Her alan içinde birden fazla dil desteği var (max 10 dil)
- Dil ID'leri: 1=English, 2=Turkish, vb. (languageType enum)
- CDATA kullanımı yaygın, bu yüzden `#text` kontrolü önemli
- `noPrice=true` ile yapılan isteklerde description alanları geliyor
