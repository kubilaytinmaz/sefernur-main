/**
 * Firebase Popular Routes Migration Script
 * 
 * Bu script, hardcoded POPULAR_ROUTES verilerini Firebase Firestore'a yükler.
 * 
 * Kullanım:
 * 1. Firebase admin SDK yapılandırmasını kontrol edin
 * 2. `node scripts/migrate-popular-routes.js` komutunu çalıştırın
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

// Hardcoded POPULAR_ROUTES verileri
const POPULAR_ROUTES = [
  {
    id: 'route-jed-makkah-airport',
    name: 'Jeddah - Mekke Havalimanı Transfer',
    icon: '✈️',
    from: {
      city: 'Jeddah',
      name: 'Kral Abdulaziz Havalimanı (JED)',
    },
    to: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    distance: {
      km: 85,
      text: '85 km'
    },
    duration: {
      minutes: 90,
      text: '1 saat 30 dk'
    },
    category: 'airport',
    isPopular: true,
    order: 1
  },
  {
    id: 'route-madinah-airport',
    name: 'Medine Havalimanı Transfer',
    icon: '✈️',
    from: {
      city: 'Medine',
      name: 'Prens Muhammed Bin Abdulaziz Havalimanı (MED)',
    },
    to: {
      city: 'Medine',
      name: 'Medine Şehri / Mescid-i Nebevi',
    },
    distance: {
      km: 15,
      text: '15 km'
    },
    duration: {
      minutes: 25,
      text: '25 dk'
    },
    category: 'airport',
    isPopular: true,
    order: 2
  },
  {
    id: 'route-makkah-madinah',
    name: 'Mekke - Medine Havalimanı Transfer',
    icon: '🚌',
    from: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    to: {
      city: 'Medine',
      name: 'Medine Şehri / Mescid-i Nebevi',
    },
    distance: {
      km: 450,
      text: '450 km'
    },
    duration: {
      minutes: 300,
      text: '5 saat'
    },
    category: 'intercity',
    isPopular: true,
    order: 3
  },
  {
    id: 'route-jed-makkah-city',
    name: 'Jeddah - Mekke Şehir Transfer',
    icon: '🚗',
    from: {
      city: 'Jeddah',
      name: 'Jeddah Şehir Merkezi',
    },
    to: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    distance: {
      km: 80,
      text: '80 km'
    },
    duration: {
      minutes: 75,
      text: '1 saat 15 dk'
    },
    category: 'intercity',
    isPopular: true,
    order: 4
  },
  {
    id: 'route-makkah-haram',
    name: 'Mekke İçi Harem Transfer',
    icon: '🕌',
    from: {
      city: 'Mekke',
      name: 'Otel / Konaklama',
    },
    to: {
      city: 'Mekke',
      name: 'Mescid-i Haram',
    },
    distance: {
      km: 5,
      text: '5 km'
    },
    duration: {
      minutes: 15,
      text: '15 dk'
    },
    category: 'local',
    isPopular: true,
    order: 5
  },
  {
    id: 'route-madinah-haram',
    name: 'Medine İçi Mescid-i Nebevi Transfer',
    icon: '🕌',
    from: {
      city: 'Medine',
      name: 'Otel / Konaklama',
    },
    to: {
      city: 'Medine',
      name: 'Mescid-i Nebevi',
    },
    distance: {
      km: 5,
      text: '5 km'
    },
    duration: {
      minutes: 15,
      text: '15 dk'
    },
    category: 'local',
    isPopular: true,
    order: 6
  },
  {
    id: 'route-makkah-taif',
    name: 'Mekke - Taif Transfer',
    icon: '🏔️',
    from: {
      city: 'Mekke',
      name: 'Mekke Şehri',
    },
    to: {
      city: 'Taif',
      name: 'Taif Şehri',
    },
    distance: {
      km: 120,
      text: '120 km'
    },
    duration: {
      minutes: 120,
      text: '2 saat'
    },
    category: 'intercity',
    isPopular: false,
    order: 7
  },
  {
    id: 'route-jed-airport-makkah',
    name: 'Jeddah Havalimanı - Mekke Transfer',
    icon: '🛬',
    from: {
      city: 'Jeddah',
      name: 'Kral Abdulaziz Havalimanı (JED)',
    },
    to: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    distance: {
      km: 85,
      text: '85 km'
    },
    duration: {
      minutes: 90,
      text: '1 saat 30 dk'
    },
    category: 'airport',
    isPopular: true,
    order: 8
  },
  {
    id: 'route-madinah-airport-medinah',
    name: 'Medine Havalimanı - Medine Şehir Transfer',
    icon: '🛬',
    from: {
      city: 'Medine',
      name: 'Prens Muhammed Bin Abdulaziz Havalimanı (MED)',
    },
    to: {
      city: 'Medine',
      name: 'Medine Şehri / Mescid-i Nebevi',
    },
    distance: {
      km: 15,
      text: '15 km'
    },
    duration: {
      minutes: 25,
      text: '25 dk'
    },
    category: 'airport',
    isPopular: true,
    order: 9
  },
  {
    id: 'route-makkah-arafa',
    name: 'Mekke - Arafat Transfer',
    icon: '⛺',
    from: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    to: {
      city: 'Mekke',
      name: 'Arafat',
    },
    distance: {
      km: 25,
      text: '25 km'
    },
    duration: {
      minutes: 40,
      text: '40 dk'
    },
    category: 'local',
    isPopular: false,
    order: 10
  },
  {
    id: 'route-makkah-mina',
    name: 'Mekke - Mina Transfer',
    icon: '⛺',
    from: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    to: {
      city: 'Mekke',
      name: 'Mina',
    },
    distance: {
      km: 8,
      text: '8 km'
    },
    duration: {
      minutes: 20,
      text: '20 dk'
    },
    category: 'local',
    isPopular: false,
    order: 11
  },
  {
    id: 'route-makkah-muzdalifah',
    name: 'Mekke - Müzdelifeh Transfer',
    icon: '⛺',
    from: {
      city: 'Mekke',
      name: 'Mekke Şehri / Harem',
    },
    to: {
      city: 'Mekke',
      name: 'Müzdelifeh',
    },
    distance: {
      km: 5,
      text: '5 km'
    },
    duration: {
      minutes: 15,
      text: '15 dk'
    },
    category: 'local',
    isPopular: false,
    order: 12
  }
];

async function migratePopularRoutes() {
  console.log('🚀 Popüler Rotalar migrasyonu başlatılıyor...\n');

  const collectionName = 'popularRoutes';
  const batch = db.batch();

  try {
    // Mevcut verileri kontrol et
    const snapshot = await db.collection(collectionName).get();
    
    if (!snapshot.empty) {
      console.log(`⚠️  Uyarı: ${snapshot.size} adet popüler rota zaten mevcut.`);
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
    for (const route of POPULAR_ROUTES) {
      const docRef = db.collection(collectionName).doc(route.id);
      
      const routeData = {
        name: route.name,
        icon: route.icon,
        from: route.from,
        to: route.to,
        distance: route.distance,
        duration: route.duration,
        category: route.category,
        isPopular: route.isPopular,
        order: route.order,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(docRef, routeData);
      count++;

      // Her 500 belgede bir batch commit
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`✅ ${count} rota yüklendi...`);
      }
    }

    // Kalan verileri commit et
    await batch.commit();

    console.log(`\n✅ Başarılı! ${count} adet popüler rota Firebase'e yüklendi.`);
    console.log(`📁 Koleksiyon: ${collectionName}`);
    console.log(`🔗 Firestore URL: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore/data\n`);

  } catch (error) {
    console.error('❌ Migrasyon hatası:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
migratePopularRoutes().then(() => {
  console.log('🎉 Migrasyon tamamlandı!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Beklenmeyen hata:', error);
  process.exit(1);
});
