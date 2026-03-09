# Firebase Phone Authentication Kurulum Rehberi

## ⚠️ Önemli: auth/invalid-app-credential Hatası

Bu hata Firebase Phone Auth için reCAPTCHA yapılandırması eksik olduğunda oluşur.

## ✅ Çözüm Adımları

### 1. Firebase Console - Phone Authentication Aktifleştirme

1. [Firebase Console](https://console.firebase.google.com/) > Projenizi seçin
2. **Authentication** > **Sign-in method** sekmesi
3. **Phone** provider'ı aktifleştirin

### 2. reCAPTCHA Yapılandırması

#### Seçenek A: Test Mode (Geliştirme İçin)

1. Firebase Console > **Authentication** > **Settings** > **Phone Number Sign-in**
2. **Test phone numbers** bölümünü bulun
3. Test numaraları ekleyin:
   ```
   +905551234567 → 123456
   +905551234568 → 654321
   ```
4. Bu numaralar SMS göndermeden direkt çalışır

#### Seçenek B: Production (reCAPTCHA v3)

1. [Google reCAPTCHA](https://www.google.com/recaptcha/admin) sayfasına gidin
2. **Create** butonuna tıklayın
3. Ayarlar:
   - **Label**: Sefernur Web
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**:
     - `localhost` (development için)
     - `your-domain.com` (production için)
4. **Site Key** ve **Secret Key** alın

5. Firebase Console'da:
   - **Authentication** > **Settings**
   - **reCAPTCHA Enterprise** bölümünü bulun
   - Site Key'i ekleyin (veya otomatik oluşturun)

### 3. Domain Whitelist

Firebase Console'da domainlerinizi whitelist'e ekleyin:

1. **Authentication** > **Settings** > **Authorized domains**
2. `localhost` ve production domainlerinizi ekleyin

### 4. App Check (Opsiyonel ama Önerilen)

1. Firebase Console > **App Check**
2. Web uygulamanızı kaydedin
3. reCAPTCHA Enterprise veya v3 ile entegre edin

## 🧪 Test Etme

### Test Numaraları ile:

```typescript
// Test numarası kullan (Firebase Console'da eklenmiş olmalı)
const phoneNumber = "+905551234567";
const otp = "123456"; // Firebase Console'da tanımlanan kod
```

### Gerçek Numara ile:

```typescript
// Gerçek telefon numarası
const phoneNumber = "+905XXXXXXXXX";
// SMS ile gelecek kodu girin
```

## ✅ Site Key Ekleme

### Yöntem 1: Firebase Console'da Otomatik Kullanım (Önerilen)

Firebase Phone Auth, reCAPTCHA'yı otomatik yönetir. Sadece şu adımları takip edin:

1. [Firebase Console](https://console.firebase.google.com/) > **Authentication**
2. **Settings** sekmesi > **Phone Authentication** bölümü
3. **reCAPTCHA verification** altında:
   - "Use reCAPTCHA Enterprise" seçeneği varsa aktifleştirin
   - Yoksa "Basic reCAPTCHA" kullanın
4. **Authorized domains** listesine domain'lerinizi ekleyin:
   - `localhost` (development)
   - Production domain'iniz

Firebase otomatik olarak reCAPTCHA entegrasyonunu yapacaktır.

### Yöntem 2: Manuel Site Key Kullanımı

Eğer manuel kontrol istiyorsanız, `.env.local` dosyasına ekleyin:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lde9issAAAAACLIdMgtr4cHCg1dbfFa_oxtORzi
```

**Not**: Yukarıdaki key zaten `.env.local` dosyasına eklenmiştir.

## 🔧 Troubleshooting

### Hata: auth/invalid-app-credential

**Çözüm**: reCAPTCHA doğru yapılandırılmamış. Yukarıdaki adımları takip edin.

### Hata: auth/too-many-requests

**Çözüm**: Çok fazla deneme yapıldı. 1-2 saat bekleyin veya test numaraları kullanın.

### Hata: auth/invalid-phone-number

**Çözüm**: Telefon numarası E.164 formatında olmalı: `+[country_code][number]`

- Türkiye: `+905551234567`
- Suudi Arabistan: `+966501234567`

### reCAPTCHA görünmüyor

**Çözüm**:

1. Ad blocker kapalı olmalı
2. Console'da hata var mı kontrol edin
3. `size: 'normal'` kullanın (invisible yerine)

## 📝 Geliştirme Ortamı

Development için en kolay yol test numaraları kullanmaktır:

1. Firebase Console'da test numaraları ekleyin
2. SMS ücreti ödemeden test edebilirsiniz
3. reCAPTCHA bypass edilir

## 🚀 Production Checklist

- [ ] reCAPTCHA v3 site key oluşturuldu
- [ ] Production domain whitelist'e eklendi
- [ ] App Check entegre edildi
- [ ] Rate limiting aktif
- [ ] Test numaraları silindi/devre dışı bırakıldı

## 🔗 Faydalı Linkler

- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [Firebase Console](https://console.firebase.google.com/)
