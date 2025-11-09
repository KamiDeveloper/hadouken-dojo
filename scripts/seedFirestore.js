/**
 * Firestore Seed Data Script
 * 
 * Script para poblar Firestore con datos iniciales del sistema de reservas.
 * 
 * IMPORTANTE: Este script debe ejecutarse UNA SOLA VEZ después de crear el proyecto.
 * 
 * Para ejecutar:
 * 1. Asegúrate de estar autenticado: firebase login
 * 2. Ejecuta: node scripts/seedFirestore.js
 * 
 * O importa manualmente los datos desde Firestore Console.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase (usar las mismas variables de .env.local)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// SEED DATA
// ============================================

const CATEGORIES = [
    {
        id: 'piu',
        name: 'PIU (Pump It Up)',
        description: 'Máquinas de baile coreanas con paneles de 5 botones',
        icon: '/assets/images/piu-logo.png',
        active: true,
        order: 1,
        createdAt: serverTimestamp(),
    },
    {
        id: 'ps5',
        name: 'PS5',
        description: 'Consolas PlayStation 5 con juegos populares',
        icon: '/assets/images/ps5-logo.png',
        active: true,
        order: 2,
        createdAt: serverTimestamp(),
    },
];

const MACHINES = [
    // PIU Machines
    {
        id: 'piu-machine-1',
        categoryId: 'piu',
        name: 'PIU Phoenix LX',
        description: 'Máquina PIU Phoenix - Gabinete LX',
        icon: '/assets/images/piu-lx.png',
        color: '#EF4444', // Red 500
        active: true,
        order: 1,
        createdAt: serverTimestamp(),
    },
    {
        id: 'piu-machine-2',
        categoryId: 'piu',
        name: 'PIU Phoenix TX',
        description: 'Máquina PIU Phoenix - Gabinete TX',
        icon: '/assets/images/piu-tx.png',
        color: '#3B82F6', // Blue 500
        active: true,
        order: 2,
        createdAt: serverTimestamp(),
    },
    {
        id: 'piu-machine-3',
        categoryId: 'piu',
        name: 'PIU Prime 2',
        description: 'Máquina PIU Prime 2',
        icon: '/assets/images/piu-prime2.png',
        color: '#10B981', // Emerald 500
        active: false,
        order: 3,
        createdAt: serverTimestamp(),
    },
    // PS5 Machines
    {
        id: 'ps5-1',
        categoryId: 'ps5',
        name: 'PS5 #1',
        description: 'PlayStation 5 - Tekken 8, Street Fighter 6',
        icon: '/assets/images/ps5-1.png',
        color: '#8B5CF6', // Purple 500
        active: true,
        order: 1,
        createdAt: serverTimestamp(),
    },
    {
        id: 'ps5-2',
        categoryId: 'ps5',
        name: 'PS5 #2',
        description: 'PlayStation 5 - Tekken 8, Crash Nitro Racing',
        icon: '/assets/images/ps5-2.png',
        color: '#F59E0B', // Amber 500
        active: false,
        order: 2,
        createdAt: serverTimestamp(),
    },
];

const CONFIG = {
    // Documento único: config/reservations
    slotDuration: 60, // minutos por slot
    openingTime: '10:00', // Hora de apertura
    closingTime: '22:00', // Hora de cierre
    daysOfWeek: [1, 2, 3, 4, 5], // Lun-Vie (0=Dom, 6=Sáb)
    maxSlotsPerDay: 2, // Máximo 2 reservas por día
    maxSlotsPerWeek: 5, // Máximo 5 reservas por semana
    maxWeeksInAdvance: 4, // Reservar hasta 4 semanas adelante
    minHoursToCancel: 2, // Mínimo 2 horas antes para cancelar
    allowBackToBackBooking: true, // ✅ PERMITIR reservas consecutivas (mayoría de usuarios juega 2 horas)

    // Sistema de strikes
    strikesForBan: 3, // 3 strikes = ban
    banDurationDays: 7, // Ban de 7 días
    strikeExpirationDays: 30, // Strikes expiran después de 30 días

    // Notificaciones
    sendReminderEmail: true,
    reminderHoursBefore: 24, // Enviar recordatorio 24h antes

    updatedAt: serverTimestamp(),
};

// ============================================
// FUNCIONES DE SEED
// ============================================

async function seedCategories() {
    console.log('📁 Seeding categories...');

    for (const category of CATEGORIES) {
        try {
            await setDoc(doc(db, 'categories', category.id), category);
            console.log(`  ✅ Created category: ${category.name}`);
        } catch (error) {
            console.error(`  ❌ Error creating category ${category.id}:`, error);
        }
    }
}

async function seedMachines() {
    console.log('\n🎮 Seeding machines...');

    for (const machine of MACHINES) {
        try {
            await setDoc(doc(db, 'machines', machine.id), machine);
            console.log(`  ✅ Created machine: ${machine.name}`);
        } catch (error) {
            console.error(`  ❌ Error creating machine ${machine.id}:`, error);
        }
    }
}

async function seedConfig() {
    console.log('\n⚙️ Seeding config...');

    try {
        await setDoc(doc(db, 'config', 'reservations'), CONFIG);
        console.log('  ✅ Created config/reservations');
    } catch (error) {
        console.error('  ❌ Error creating config:', error);
    }
}

async function seedAll() {
    console.log('🚀 Starting Firestore seed...\n');
    console.log('Project:', firebaseConfig.projectId);
    console.log('Database: (default)\n');

    try {
        await seedCategories();
        await seedMachines();
        await seedConfig();

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`  - ${CATEGORIES.length} categories`);
        console.log(`  - ${MACHINES.length} machines`);
        console.log('  - 1 config document');
        console.log('\n🎯 Next steps:');
        console.log('  1. Deploy indexes: firebase deploy --only firestore:indexes');
        console.log('  2. Deploy rules: firebase deploy --only firestore:rules');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    }
}

// Ejecutar seed
seedAll();
