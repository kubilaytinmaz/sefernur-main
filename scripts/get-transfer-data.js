/**
 * Firebase'den transfer verilerini çekmek için Node.js scripti
 * Mevcut araç görsellerini yedekler
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase service account key path
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

// Initialize Firebase Admin
let db;
try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized with service account');
  } else {
    console.log('⚠️  Service account key not found, trying to use environment variables...');
    // Fallback to environment variables if available
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized with application default');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('\n💡 To use this script, you need to:');
  console.log('1. Download service account key from Firebase Console');
  console.log('2. Save it as firebase-service-account.json in the project root');
  process.exit(1);
}

async function getTransferData() {
  try {
    console.log('\n🔍 Fetching transfers from Firestore...');
    
    const transfersSnapshot = await db.collection('transfers').get();
    
    if (transfersSnapshot.empty) {
      console.log('⚠️  No transfers found in Firestore');
      return;
    }
    
    console.log(`✅ Found ${transfersSnapshot.size} transfers`);
    
    const transfersData = [];
    const backupData = {
      backupDate: new Date().toISOString(),
      totalTransfers: transfersSnapshot.size,
      transfers: []
    };
    
    transfersSnapshot.forEach((doc) => {
      const data = doc.data();
      const transferInfo = {
        id: doc.id,
        vehicleName: data.vehicleName || 'Bilinmiyor',
        vehicleType: data.vehicleType || 'unknown',
        capacity: data.capacity || 0,
        basePrice: data.basePrice || 0,
        company: data.company || '',
        images: data.images || [],
        isActive: data.isActive !== false,
        isPopular: data.isPopular || false,
        fromAddress: data.fromAddress || {},
        toAddress: data.toAddress || {}
      };
      
      transfersData.push(transferInfo);
      backupData.transfers.push(transferInfo);
      
      console.log(`\n📄 ${transferInfo.vehicleName} (${transferInfo.vehicleType})`);
      console.log(`   Kapasite: ${transferInfo.capacity} kişi`);
      console.log(`   Fiyat: ₺${transferInfo.basePrice}`);
      console.log(`   Görseller: ${transferInfo.images.length} adet`);
      if (transferInfo.images.length > 0) {
        transferInfo.images.forEach((img, idx) => {
          console.log(`      [${idx + 1}] ${img}`);
        });
      }
    });
    
    // Save backup to JSON file
    const backupFile = path.join(__dirname, '../transfer-images-backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`\n💾 Backup saved to: ${backupFile}`);
    
    // Create a summary file with image URLs only
    const imagesSummary = {
      backupDate: new Date().toISOString(),
      vehicles: transfersData.map(t => ({
        id: t.id,
        name: t.vehicleName,
        type: t.vehicleType,
        images: t.images
      }))
    };
    
    const summaryFile = path.join(__dirname, '../transfer-images-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(imagesSummary, null, 2), 'utf-8');
    console.log(`📊 Summary saved to: ${summaryFile}`);
    
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error fetching transfer data:', error);
  }
}

// Run the function
getTransferData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
