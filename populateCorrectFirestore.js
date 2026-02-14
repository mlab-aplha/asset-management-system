// populateCorrectFirestore.js
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    Timestamp,
    writeBatch,
    getDocs
} from 'firebase/firestore';
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

// ===========================================
// LOCATIONS DATA - MATCHING YOUR FIRESTORE SCHEMA
// ===========================================
const locations = [
    {
        // NO id field - Firebase auto-generates this
        name: "Polokwane",
        code: "HUB-PLK-001",
        type: "hub",
        capacity: {
            maxAssets: 100,
            currentAssets: 0,
            availableCapacity: 100
        },
        status: "active",
        address: "202 Landros Mare Street, Polokwane",
        region: "Limpopo",
        contactPerson: {
            name: "Polokwane Manager",
            email: "manager@polokwane.mlab.co.za",
            phone: "+27123456789"
        }
    },
    {
        name: "Pretoria",
        code: "HQ-PTA-001",
        type: "headquarters",
        capacity: {
            maxAssets: 500,
            currentAssets: 0,
            availableCapacity: 500
        },
        status: "active",
        address: "123 Pretoria Street, Pretoria CBD",
        region: "Gauteng",
        contactPerson: {
            name: "Pretoria Manager",
            email: "manager@pretoria.mlab.co.za",
            phone: "+27123456780"
        }
    },
    {
        name: "Johannesburg",
        code: "HUB-JHB-002",
        type: "hub",
        capacity: {
            maxAssets: 300,
            currentAssets: 0,
            availableCapacity: 300
        },
        status: "active",
        address: "456 Sandton Drive, Sandton",
        region: "Gauteng",
        contactPerson: {
            name: "Johannesburg Manager",
            email: "manager@johannesburg.mlab.co.za",
            phone: "+27123456781"
        }
    },
    {
        name: "Cape Town",
        code: "HUB-CPT-003",
        type: "hub",
        capacity: {
            maxAssets: 250,
            currentAssets: 0,
            availableCapacity: 250
        },
        status: "active",
        address: "789 Waterfront Avenue, Cape Town",
        region: "Western Cape",
        contactPerson: {
            name: "Cape Town Manager",
            email: "manager@capetown.mlab.co.za",
            phone: "+27123456782"
        }
    },
    {
        name: "Durban",
        code: "HUB-DBN-004",
        type: "hub",
        capacity: {
            maxAssets: 200,
            currentAssets: 0,
            availableCapacity: 200
        },
        status: "active",
        address: "101 Umhlanga Ridge, Durban",
        region: "KwaZulu-Natal",
        contactPerson: {
            name: "Durban Manager",
            email: "manager@durban.mlab.co.za",
            phone: "+27123456783"
        }
    },
    {
        name: "East London",
        code: "HQ-EL-006",
        type: "satellite",
        capacity: {
            maxAssets: 150,
            currentAssets: 0,
            availableCapacity: 150
        },
        status: "active",
        address: "303 Oxford Street, East London",
        region: "Eastern Cape",
        contactPerson: {
            name: "East London Manager",
            email: "manager@eastlondon.mlab.co.za",
            phone: "+27123456784"
        }
    },
    {
        name: "Bloemfontein",
        code: "HUB-BFN-007",
        type: "hub",
        capacity: {
            maxAssets: 120,
            currentAssets: 0,
            availableCapacity: 120
        },
        status: "active",
        address: "404 West Burger Street, Bloemfontein",
        region: "Free State",
        contactPerson: {
            name: "Bloemfontein Manager",
            email: "manager@bloemfontein.mlab.co.za",
            phone: "+27123456785"
        }
    },
    {
        name: "Nelspruit",
        code: "HUB-NLP-008",
        type: "hub",
        capacity: {
            maxAssets: 80,
            currentAssets: 0,
            availableCapacity: 80
        },
        status: "active",
        address: "505 Brown Street, Nelspruit",
        region: "Mpumalanga",
        contactPerson: {
            name: "Nelspruit Manager",
            email: "manager@nelspruit.mlab.co.za",
            phone: "+27123456786"
        }
    },
    {
        name: "Kimberley",
        code: "HUB-KMB-009",
        type: "hub",
        capacity: {
            maxAssets: 75,
            currentAssets: 0,
            availableCapacity: 75
        },
        status: "active",
        address: "606 Du Toitspan Road, Kimberley",
        region: "Northern Cape",
        contactPerson: {
            name: "Kimberley Manager",
            email: "manager@kimberley.mlab.co.za",
            phone: "+27123456787"
        }
    },
    {
        name: "Upington",
        code: "HUB-UPN-010",
        type: "hub",
        capacity: {
            maxAssets: 60,
            currentAssets: 0,
            availableCapacity: 60
        },
        status: "active",
        address: "707 Scott Street, Upington",
        region: "Northern Cape",
        contactPerson: {
            name: "Upington Manager",
            email: "manager@upington.mlab.co.za",
            phone: "+27123456788"
        }
    }
];

// ===========================================
// ASSET CATALOG - MATCHING YOUR FIRESTORE SCHEMA
// ===========================================
const assetTypes = {
    printers: {
        prefix: 'PR',
        models: [
            { name: "HP Printer1", manufacturer: "HP", model: "LaserJet Pro M402dn" },
            { name: "HP Printer2", manufacturer: "HP", model: "Color LaserJet M455" },
            { name: "Epson Printer", manufacturer: "Epson", model: "WorkForce WF-7720" },
            { name: "Brother Printer", manufacturer: "Brother", model: "MFC-L8900CDW" },
            { name: "Canon Printer", manufacturer: "Canon", model: "imageRUNNER ADV C5535i" }
        ]
    },
    laptops: {
        prefix: 'LP',
        models: [
            { name: "Dell Laptop", manufacturer: "Dell", model: "XPS 15 9520" },
            { name: "MacBook", manufacturer: "Apple", model: "MacBook Pro 14 M2" },
            { name: "HP Laptop", manufacturer: "HP", model: "EliteBook 840 G9" },
            { name: "Lenovo Laptop", manufacturer: "Lenovo", model: "ThinkPad X1 Carbon" },
            { name: "Surface", manufacturer: "Microsoft", model: "Surface Pro 9" }
        ]
    },
    desktops: {
        prefix: 'DT',
        models: [
            { name: "Dell Desktop", manufacturer: "Dell", model: "OptiPlex 7080" },
            { name: "iMac", manufacturer: "Apple", model: "iMac 24 M1" },
            { name: "HP Desktop", manufacturer: "HP", model: "EliteDesk 800" }
        ]
    },
    monitors: {
        prefix: 'MO',
        models: [
            { name: "LG Monitor", manufacturer: "LG", model: "27UK850-W" },
            { name: "Dell Monitor", manufacturer: "Dell", model: "UltraSharp U2720Q" },
            { name: "Samsung Monitor", manufacturer: "Samsung", model: "Smart Monitor M7" }
        ]
    },
    networking: {
        prefix: 'NW',
        models: [
            { name: "Cisco Router", manufacturer: "Cisco", model: "ISR 4331" },
            { name: "Aruba Switch", manufacturer: "Aruba", model: "2930F 48G" },
            { name: "Ubiquiti AP", manufacturer: "Ubiquiti", model: "UniFi U6-LR" },
            { name: "Fortinet Firewall", manufacturer: "Fortinet", model: "FortiGate 60F" }
        ]
    },
    furniture: {
        prefix: 'FN',
        models: [
            { name: "Office Chair", manufacturer: "Herman Miller", model: "Aeron" },
            { name: "Standing Desk", manufacturer: "Steelcase", model: "Gesture" },
            { name: "Bookshelf", manufacturer: "IKEA", model: "Billy" }
        ]
    },
    mobile: {
        prefix: 'MB',
        models: [
            { name: "iPhone", manufacturer: "Apple", model: "iPhone 14 Pro" },
            { name: "Samsung Phone", manufacturer: "Samsung", model: "Galaxy S23 Ultra" },
            { name: "iPad", manufacturer: "Apple", model: "iPad Air" }
        ]
    },
    vehicles: {
        prefix: 'VH',
        models: [
            { name: "Company Car", manufacturer: "Toyota", model: "Corolla 2023" },
            { name: "Utility Vehicle", manufacturer: "Ford", model: "Ranger 2024" },
            { name: "Cargo Van", manufacturer: "Volkswagen", model: "Transporter 2023" }
        ]
    },
    av: {
        prefix: 'AV',
        models: [
            { name: "Conference Camera", manufacturer: "Logitech", model: "Brio 4K" },
            { name: "Conference System", manufacturer: "Poly", model: "Studio E70" },
            { name: "TV Display", manufacturer: "Samsung", model: "QB65B" }
        ]
    }
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================
function generateAssetId(prefix, index) {
    return `MLAB-${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function generateId(prefix, index) {
    return `ast-${prefix.toLowerCase()}-${String(index + 1).padStart(3, '0')}`;
}

function generateSerialNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let serial = '';
    for (let i = 0; i < 12; i++) {
        serial += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return serial;
}

function getRandomStatus() {
    const rand = Math.random();
    if (rand < 0.6) return "active";
    if (rand < 0.8) return "maintenance";
    if (rand < 0.9) return "in-transit";
    if (rand < 0.95) return "reserved";
    return "retired";
}

function getRandomCondition() {
    const conditions = ["excellent", "good", "fair", "poor", "needs-repair"];
    const weights = [0.2, 0.5, 0.2, 0.07, 0.03];
    const rand = Math.random();
    let sum = 0;
    for (let i = 0; i < conditions.length; i++) {
        sum += weights[i];
        if (rand <= sum) return conditions[i];
    }
    return "good";
}

// ===========================================
// MAIN POPULATION FUNCTIONS
// ===========================================
async function populateLocations() {
    console.log('📍 Creating locations with auto-generated IDs...\n');
    const batch = writeBatch(db);
    const now = Timestamp.now();

    for (const location of locations) {
        // Let Firebase auto-generate the document ID
        const locationRef = doc(collection(db, 'locations'));

        batch.set(locationRef, {
            ...location,
            createdAt: now,
            updatedAt: now
        });

        console.log(`   ✅ Created location: ${location.name}`);
    }

    await batch.commit();
    console.log(`\n🎉 Successfully created ${locations.length} locations with auto-generated IDs!\n`);
}

async function populateAssets() {
    console.log('📦 Creating assets matching Firestore schema...\n');

    // Get all locations
    const locationsSnapshot = await getDocs(collection(db, 'locations'));
    const locationList = locationsSnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));

    if (locationList.length === 0) {
        console.log('❌ No locations found!');
        return;
    }

    let batch = writeBatch(db);
    let assetCount = 0;
    let assetIndex = 0;
    const now = Timestamp.now();

    // Create 50 assets
    for (let i = 0; i < 50; i++) {
        // Select random location
        const location = locationList[Math.floor(Math.random() * locationList.length)];

        // Select random asset type
        const typeKeys = Object.keys(assetTypes);
        const typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const assetType = assetTypes[typeKey];
        const model = assetType.models[Math.floor(Math.random() * assetType.models.length)];

        // Generate IDs matching Firestore format
        const assetId = generateAssetId(assetType.prefix, assetIndex);
        const id = generateId(assetType.prefix, assetIndex);

        // Determine asset category based on type
        let category = "hardware";
        if (typeKey === 'furniture') category = "furniture";
        if (typeKey === 'vehicles') category = "vehicles";
        if (typeKey === 'software') category = "software";

        const status = getRandomStatus();
        const condition = getRandomCondition();

        // Build asset object EXACTLY matching your Firestore schema
        const asset = {
            // Core fields - MATCHING YOUR SCREENSHOT
            id: id,
            assetId: assetId,
            name: model.name,
            category: category,
            type: typeKey === 'printers' ? 'printer' :
                typeKey === 'laptops' ? 'laptop' :
                    typeKey === 'desktops' ? 'desktop' :
                        typeKey === 'monitors' ? 'monitor' :
                            typeKey === 'networking' ? 'router' :
                                typeKey === 'furniture' ? 'chair' :
                                    typeKey === 'mobile' ? 'smartphone' :
                                        typeKey === 'vehicles' ? 'company-car' :
                                            typeKey === 'av' ? 'conference-system' : 'other',

            // Manufacturer and model
            manufacturer: model.manufacturer,
            model: model.model,
            serialNumber: generateSerialNumber(),

            // Status and condition
            status: status,
            condition: condition,

            // Location and assignment
            currentLocationId: location.firestoreId, // This links to the location document ID
            assignedTo: status === 'active' && Math.random() > 0.5 ?
                `user-${Math.floor(Math.random() * 100)}@mlab.co.za` : "",

            // Timestamps
            createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)),
            updatedAt: now,

            // Description and notes (empty strings as in your schema)
            description: "",
            notes: Math.random() > 0.7 ? `Scheduled for ${status} maintenance` : "",

            // Tags array
            tags: [],

            // Price info
            purchasePrice: Math.floor(Math.random() * 50000) + 5000,
            warrantyExpiry: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
        };

        // Add to batch with AUTO-GENERATED document ID
        const assetRef = doc(collection(db, 'assets'));
        batch.set(assetRef, asset);

        // Update location capacity
        const locationRef = doc(db, 'locations', location.firestoreId);
        batch.update(locationRef, {
            'capacity.currentAssets': (location.capacity?.currentAssets || 0) + 1,
            'capacity.availableCapacity': (location.capacity?.availableCapacity || 0) - 1,
            updatedAt: now
        });

        assetCount++;
        assetIndex++;
        console.log(`   ✅ [${assetCount}/50] Created ${assetId} - ${asset.name} - ${status} - ${location.name}`);

        if (assetCount % 20 === 0) {
            await batch.commit();
            console.log(`\n   📦 Batch of 20 assets committed!\n`);
            batch = writeBatch(db);
        }
    }

    if (assetCount % 20 !== 0) {
        await batch.commit();
    }

    console.log(`\n🎉 Successfully created ${assetCount} assets matching Firestore schema!\n`);
}

async function verifyPopulation() {
    console.log('🔍 Verifying population...\n');

    const assetsSnapshot = await getDocs(collection(db, 'assets'));
    const locationsSnapshot = await getDocs(collection(db, 'locations'));

    console.log('📊 Population Summary:');
    console.log(`   📍 Locations: ${locationsSnapshot.size}`);
    console.log(`   📦 Assets: ${assetsSnapshot.size}`);

    // Check first asset structure
    if (assetsSnapshot.size > 0) {
        const firstAsset = assetsSnapshot.docs[0].data();
        console.log('\n✅ Sample Asset Structure:');
        console.log(`   Document ID: ${assetsSnapshot.docs[0].id} (auto-generated)`);
        console.log(`   id field: ${firstAsset.id || 'MISSING'}`);
        console.log(`   assetId: ${firstAsset.assetId || 'MISSING'}`);
        console.log(`   name: ${firstAsset.name || 'MISSING'}`);
        console.log(`   status: ${firstAsset.status || 'MISSING'}`);
        console.log(`   currentLocationId: ${firstAsset.currentLocationId || 'MISSING'}`);
    }
}

async function main() {
    console.log('🚀 Starting CORRECT Firestore population script...\n');
    console.log('🔥 Project:', firebaseConfig.projectId);

    try {
        // Step 1: Create locations with auto-generated IDs
        await populateLocations();

        // Step 2: Create assets with correct schema
        await populateAssets();

        // Step 3: Verify
        await verifyPopulation();

        console.log('\n✨ Population complete! Your database now matches the Firestore schema!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();