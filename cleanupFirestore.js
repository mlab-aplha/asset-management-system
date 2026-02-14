// cleanupFirestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDatabase() {
    console.log('🧹 Starting database cleanup...\n');

    // 1. Delete all assets
    const assetsSnapshot = await getDocs(collection(db, 'assets'));
    console.log(`📦 Found ${assetsSnapshot.size} assets to delete`);

    let batch = writeBatch(db);
    let count = 0;

    for (const document of assetsSnapshot.docs) {
        batch.delete(doc(db, 'assets', document.id));
        count++;

        if (count % 20 === 0) {
            await batch.commit();
            console.log(`   Deleted ${count} assets`);
            batch = writeBatch(db);
        }
    }

    if (count % 20 !== 0) {
        await batch.commit();
        console.log(`   Deleted ${count} assets`);
    }

    // 2. Delete all locations
    const locationsSnapshot = await getDocs(collection(db, 'locations'));
    console.log(`\n📍 Found ${locationsSnapshot.size} locations to delete`);

    batch = writeBatch(db);
    count = 0;

    for (const document of locationsSnapshot.docs) {
        batch.delete(doc(db, 'locations', document.id));
        count++;

        if (count % 20 === 0) {
            await batch.commit();
            console.log(`   Deleted ${count} locations`);
            batch = writeBatch(db);
        }
    }

    if (count % 20 !== 0) {
        await batch.commit();
        console.log(`   Deleted ${count} locations`);
    }

    console.log('\n✨ Cleanup complete!');
}

cleanupDatabase();