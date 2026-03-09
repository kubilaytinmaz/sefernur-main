Bu dokümanı yazılım ekibinize verdiğinizde, ne yapmaları gerektiğini net bir şekilde anlayacaklardır.

Customer Name:

Gokhan Urul Turizm Credit
Login ID:

birlikgrup
Company Code:

2285355

password
21011995Kk.

-----

# 🏗️ WebBeds (DOTW) XML API Entegrasyon Dokümantasyonu (Swagger Style)

**Sürüm:** V4
**Protokol:** XML over HTTPS (POST)
[cite_start]**Base URL (Test):** `https://xmldev.dotwconnect.com/gatewayV4.dotw` [cite: 1]
**Format:** Tüm istekler ve yanıtlar XML formatındadır.

-----

## 🔐 1. Kimlik Doğrulama (Authentication)

Bu API standart bir "Header" yetkilendirmesi kullanmaz. Her XML gövdesinin (body) içinde `<customer>` etiketi altında kullanıcı adı ve şifre gönderilmelidir.

  * **username:** Size verilen kullanıcı adı.
  * [cite_start]**password:** MD5 ile şifrelenmiş parola[cite: 1].
  * **source:** Genellikle `1` olarak gönderilir.
  * **product:** `hotel`

-----

## 📦 2. Statik Veri (Otel Veritabanı Oluşturma)

Hac/Umre uygulamanızda otelleri hızlı listelemek için otel adlarını, adreslerini ve özelliklerini önceden indirmelisiniz.

### `POST /gatewayV4.dotw` (Command: searchhotels - Static)

Statik verileri (fiyatsız) indirmek için kullanılır.

**Önemli:** `noPrice` filtresi `true` olmalıdır.
[cite_start]**Sıklık:** Haftalık veya Aylık çalıştırılmalı[cite: 179].

#### Request Body (XML)

```xml
<request command="searchhotels">
    <return>
        <filters>
            <country>364</country> <noPrice>true</noPrice> </filters>
        <fields>
            <field>hotelName</field> <field>address</field> <field>rating</field>
            <field>images</field> <field>description1</field> <field>geoPoint</field>
        </fields>
    </return>
</request>
```

**Response:** Otel listesi, yıldız puanları, enlem/boylam, resim URL'leri.

-----

## 🔍 3. Müsaitlik Arama (Search)

Kullanıcı tarih ve kişi sayısı seçtiğinde çalışır.

### `POST /gatewayV4.dotw` (Command: searchhotels)

Canlı fiyat ve müsaitlik sorgusu.

[cite_start]**Kritik Kural:** Hızlı yanıt için (8 saniye altı), tüm şehri aramak yerine, kendi veritabanınızdaki otel ID'lerini 50'şerli gruplar halinde sorgulayın[cite: 671].

#### Request Body (XML)

```xml
<request command="searchhotels">
    <bookingDetails>
        <fromDate>2025-12-09</fromDate>
        <toDate>2025-12-12</toDate>
        <rooms no="1">
            <room runno="0">
                <adultsCode>2</adultsCode>
                <passengerNationality>TR</passengerNationality> 
            </room>
        </rooms>
    </bookingDetails>
    <return>
        <filters>
            <city>364</city> </filters>
    </return>
</request>
```

-----

## 🏨 4. Oda ve Fiyat Listeleme (Product Details)

Kullanıcı bir otele tıkladığında detayları gösterir.

### `POST /gatewayV4.dotw` (Command: getrooms - Simple)

Otel bazında oda tiplerini (Standart, Deluxe vb.) ve iptal kurallarını çeker.

[cite_start]**Best Practice:** Fiyat ve İptal politikaları müşteriye bu aşamada gösterilmelidir[cite: 665].

#### Request Body (XML)

```xml
<request command="getrooms">
    <bookingDetails>
        <productId>30714</productId> <fromDate>...</fromDate>
        <toDate>...</toDate>
        <rooms no="1">
           </rooms>
    </bookingDetails>
</request>
```

**Response Analizi:**

  * `<tariffNotes>`: Otel notları (Vergiler, harçlar). [cite_start]Müşteriye göstermek zorunludur[cite: 634].
  * [cite_start]`<minStay>`: Eğer dolu gelirse, minimum konaklama süresi kuralı vardır[cite: 618].

-----

## 🛑 5. Bloklama (Pre-Booking Validation)

Kullanıcı "Satın Al" butonuna bastığında, ödeme sayfasına gitmeden önce çalışır.

### `POST /gatewayV4.dotw` (Command: getrooms - Blocking)

Odayı geçici olarak ayırır ve fiyatı doğrular.

**Zorunluluk:** `roomTypeSelected` düğümü eklenmelidir. [cite_start]Yanıtta `<status>checked</status>` görülmeden ödeme adımına geçilmemelidir[cite: 613].

#### Request Body (XML)

```xml
<request command="getrooms">
    <roomTypeSelected>
        <code>12345</code> <selectedRateBasis>1</selectedRateBasis> </roomTypeSelected>
</request>
```

**Response:** `allocationDetails` değerini kaydedin. [cite_start]ConfirmBooking'de lazım olacak[cite: 657].

-----

## ✅ 6. Rezervasyon Onayı (Booking)

Ödeme alındıktan sonra rezervasyonu kesinleştirir.

### `POST /gatewayV4.dotw` (Command: confirmbooking)

**Kritik Özellik: Changed Occupancy (Değişen Doluluk)**
[cite_start]Eğer API, çocukları yetişkin olarak saydıysa veya ek yatak eklediyse (`changedOccupancy` dönerse), bu istekte `adultsCode` ve `children` sayılarını API'nin yeni önerisine göre güncellemelisiniz[cite: 5]. Aksi takdirde rezervasyon başarısız olur.

#### Request Body (XML)

```xml
<request command="confirmbooking">
    <bookingDetails>
        <productId>30714</productId>
        <allocationDetails>...</allocationDetails> 
        <rooms no="1">
            <room runno="0">
                <adultsCode>2</adultsCode>
                <passengerNationality>TR</passengerNationality>
                <passengersDetails>
                    <passenger leading="yes">
                        <firstName>AHMET</firstName>
                        <lastName>YILMAZ</lastName>
                    </passenger>
                </passengersDetails>
            </room>
        </rooms>
    </bookingDetails>
</request>
```

[cite_start]**Response:** `bookingCode` (Rezervasyon No) ve `<paymentGuaranteedBy>` (Voucher'a basılacak metin) döner[cite: 644].

-----

## ❌ 7. İptal İşlemleri (Cancellation)

İptal işlemi iki aşamalıdır.

### Adım 1: Ceza Sorgulama (`confirm=no`)

`confirm` parametresi `no` olarak gönderilir. [cite_start]Ceza tutarı (`<charge>`) kontrol edilir[cite: 661].

### Adım 2: Kesin İptal (`confirm=yes`)

[cite_start]Eğer kullanıcı cezayı kabul ederse veya ceza yoksa, `confirm` parametresi `yes` yapılır ve Adım 1'den gelen ceza tutarı `<penaltyApplied>` içine yazılarak gönderilir[cite: 662].

#### Request Body (XML - Final Step)

```xml
<request command="cancelbooking">
    <bookingDetails>
        <bookingCode>249XXXXX3</bookingCode>
        <confirm>yes</confirm>
        <testPricesAndAllocation>
            <service>
                <penaltyApplied>120.50</penaltyApplied> </service>
        </testPricesAndAllocation>
    </bookingDetails>
</request>
```

-----

## ⚠️ Yazılımcı İçin Kritik Kontrol Listesi (Checklist)

1.  [cite_start]**GZIP Sıkıştırma:** Header'da `Accept-Encoding: gzip, deflate` göndermek zorunludur[cite: 179].
2.  [cite_start]**Minimum Satış Fiyatı (MSP):** Eğer B2C satış yapıyorsanız, API yanıtındaki `MinimumSellingPrice` değerinin altında satış yapamazsınız[cite: 651].
3.  **Hata Yönetimi:** `<allowBook>no</allowBook>` dönerse rezervasyonu durdurun.
4.  [cite_start]**Promosyonlar:** `<specials>` düğümü dönerse (Örn: 3 Kal 2 Öde), kullanıcıya gösterin[cite: 187].
5.  [cite_start]**APR (İade Edilemez):** `nonRefundable` değeri `yes` ise, kullanıcıya iptal hakkı olmadığını belirten uyarıyı mutlaka gösterin[cite: 650].