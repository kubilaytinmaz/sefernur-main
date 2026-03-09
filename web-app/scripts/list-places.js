// Firebase'deki mevcut places verilerini listelemek için script
// Çalıştırmak için: node scripts/list-places.js

const admin = require('firebase-admin');

// Firebase service account key gerekiyor
// Bu scripti çalıştırmak için önce Firebase Admin SDK yapılandırması yapılmalı

const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listAllPlaces() {
  try {
    const snapshot = await db.collection('places').get();
    
    console.log(`\n=== FIREBASE PLACES VERİLERİ ===`);
    console.log(`Toplam ${snapshot.docs.length} kayıt bulundu:\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Başlık: ${data.title || 'Belirtilmemiş'}`);
      console.log(`   Şehir: ${data.city || 'Belirtilmemiş'}`);
      console.log(`   Kısa Açıklama: ${data.shortDescription || 'Belirtilmemiş'}`);
      console.log(`   Uzun Açıklama: ${data.longDescription ? data.longDescription.substring(0, 100) + '...' : 'Belirtilmemiş'}`);
      console.log(`   Aktif: ${data.isActive !== false ? 'Evet' : 'Hayır'}`);
      console.log(`   Görsel: ${data.images?.[0] || 'Yok'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

listAllPlaces();
