/**
 * Firebase Popular Services (Tours) Migration Script
 * 
 * Bu script, hardcoded POPULAR_SERVICES verilerini Firebase Firestore'a yükler.
 * 
 * Kullanım:
 * 1. Firebase admin SDK yapılandırmasını kontrol edin
 * 2. `node scripts/migrate-popular-services.js` komutunu çalıştırın
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase admin yapılandırması
const serviceAccountPath = path.join(__dirname, '../functions/service-account-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Hata: service-account-key.json dosyası bulunamadı!');
  console.error('Lütfen Firebase service account key dosyasını functions/ klasörüne koyun.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Hardcoded POPULAR_SERVICES verileri
const POPULAR_SERVICES = [
  {
    id: 'service-city-tour-makkah',
    type: 'tour',
    name: 'Mekke Şehir Turu',
    description: 'Mekke ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur',
    icon: '🕌',
    duration: {
      hours: 4,
      text: '4 saat'
    },
    distance: {
      km: 50,
      text: '50 km'
    },
    price: {
      baseAmount: 500,
      currency: 'TRY',
      type: 'per_person'
    },
    isPopular: true,
    order: 1
  },
  {
    id: 'service-city-tour-madinah',
    type: 'tour',
    name: 'Medine Şehir Turu',
    description: 'Medine ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur',
    icon: '🕌',
    duration: {
      hours: 4,
      text: '4 saat'
    },
    distance: {
      km: 40,
      text: '40 km'
    },
    price: {
      baseAmount: 500,
      currency: 'TRY',
      type: 'per_person'
    },
    isPopular: true,
    order: 2
  },
  {
    id: 'service-hajj-umrah-guide',
    type: 'guide',
    name: 'Hac & Umre Rehberliği',
    description: 'Deneyimli rehber eşliğinde tam rehberlik hizmeti',
    icon: '👨‍🏫',
    duration: {
      hours: 8,
      text: 'Tam gün'
    },
    distance: {
      km: 0,
      text: '-'
    },
    price: {
      baseAmount: 1000,
      currency: 'TRY',
      type: 'per_group'
    },
    isPopular: true,
    order: 3
  },
  {
    id: 'service-taif-tour',
    type: 'tour',
    name: 'Taif Günübirlik Turu',
    description: 'Taif şehrini kapsayan günübirlik tur',
    icon: '🏔️',
    duration: {
      hours: 8,
      text: '8 saat'
    },
    distance: {
      km: 240,
      text: '240 km (gidiş-dönüş)'
    },
    price: {
      baseAmount: 800,
      currency: 'TRY',
      type: 'per_person'
    },
    isPopular: false,
    order: 4
  },
  {
    id: 'service-jeddah-city-tour',
    type: 'tour',
    name: 'Jeddah Şehir Turu',
    description: 'Jeddah tarihi merkez ve sahil bölgesi turu',
    icon: '🏙️',
    duration: {
      hours: 5,
      text: '5 saat'
    },
    distance: {
      km: 60,
      text: '60 km'
    },
    price: {
      baseAmount: 600,
      currency: 'TRY',
      type: 'per_person'
    },
    isPopular: true,
    order: 5
  },
  {
    id: 'service-ziyarat-makkah',
    type: 'tour',
    name: 'Mekke Ziyaret Turları',
    description: 'Mekke civarındaki önemli ziyaret yerlerini kapsayan tur',
    icon: '🗺️',
    duration: {
      hours: 6,
      text: '6 saat'
    },
    distance: {
      km: 80,
      text: '80 km'
    },
    price: {
      baseAmount: 700,
      currency: 'TRY',
      type: 'per_person'
    },
    isPopular: true,
    order: 6
  },
  {
    id: 'service-ziyarat-madinah',
    type: 'tour',
    name: 'Medine Ziyaret Turları',
    description: 'Medine civarındaki önemli ziyaret yerlerini kapsayan tur',
    icon: '🗺️',
    duration: {
      hours: 6,
      text: '6 saat'
    },
    distance: {
      km: 70,
      text: '70 km'
    },
    price: {
      baseAmount: 700,
      currency: 'TRY',
      type: 'per_person'
    },
    isPopular: true,
    order: 7
  },
  {
    id: 'service-private-guide',
    type: 'guide',
    name: 'Özel Rehber Hizmeti',
    description: 'Size özel rehberlik hizmeti',
    icon: '👤',
    duration: {
      hours: 4,
      text: '4 saat'
    },
    distance: {
      km: 0,
      text: '-'
    },
    price: {
      baseAmount: 1500,
      currency: 'TRY',
      type: 'per_group'
    },
    isPopular: false,
    order: 8
  }
];

async function migratePopularServices() {
  console.log('🚀 Popüler Servisler (Turlar) migrasyonu başlatılıyor...\n');

  const collectionName = 'popularServices';
  const batch = db.batch();

  try {
    // Mevcut verileri kontrol et
    const snapshot = await db.collection(collectionName).get();
    
    if (!snapshot.empty) {
      console.log(`⚠️  Uyarı: ${snapshot.size} adet popüler servis zaten mevcut.`);
      console.log('Mevcut veriler silinip yeniden oluşturulacak.\n');
      
      // Mevcut verileri sil
      const deleteBatch = db.batch();
      snapshot.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log('✅ Mevcut veriler silindi.\n');
    }

    // Yeni verileri ekle
    let count = 0;
    for (const service of POPULAR_SERVICES) {
      const docRef = db.collection(collectionName).doc(service.id);
      
      const serviceData = {
        type: service.type,
        name: service.name,
        description: service.description,
        icon: service.icon,
        duration: service.duration,
        distance: service.distance,
        price: service.price,
        isPopular: service.isPopular,
        order: service.order,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(docRef, serviceData);
      count++;

      // Her 500 belgede bir batch commit
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`✅ ${count} servis yüklendi...`);
      }
    }

    // Kalan verileri commit et
    await batch.commit();

    console.log(`\n✅ Başarılı! ${count} adet popüler servis Firebase'e yüklendi.`);
    console.log(`📁 Koleksiyon: ${collectionName}`);
    console.log(`🔗 Firestore URL: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore/data\n`);

  } catch (error) {
    console.error('❌ Migrasyon hatası:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
migratePopularServices().then(() => {
  console.log('🎉 Migrasyon tamamlandı!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Beklenmeyen hata:', error);
  process.exit(1);
});
