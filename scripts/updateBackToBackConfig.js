/**
 * Script para actualizar allowBackToBackBooking en Firestore
 * 
 * Este script actualiza la configuración existente en Firestore
 * para permitir reservas consecutivas.
 * 
 * Para ejecutar:
 * node scripts/updateBackToBackConfig.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Leer .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

// Configuración de Firebase
const firebaseConfig = {
    apiKey: envVars.VITE_FIREBASE_API_KEY,
    authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateConfig() {
    console.log('🚀 Actualizando configuración de reservas...\n');
    console.log('Project:', firebaseConfig.projectId);
    console.log('Documento: config/reservations\n');

    try {
        const configRef = doc(db, 'config', 'reservations');

        await updateDoc(configRef, {
            allowBackToBackBooking: true,
            updatedAt: new Date(),
        });

        console.log('✅ Configuración actualizada exitosamente!');
        console.log('\n📝 Cambio aplicado:');
        console.log('  - allowBackToBackBooking: false → true');
        console.log('\n💡 Impacto:');
        console.log('  - Ahora los usuarios PUEDEN hacer reservas consecutivas');
        console.log('  - Ejemplo: 10:00-11:00 + 11:00-12:00 = 2 horas seguidas ✅');
        console.log('  - Esto es ideal para sesiones largas de juego');
        console.log('\n✅ El sistema está listo para usar');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al actualizar configuración:', error);
        console.error('\n🔍 Posibles causas:');
        console.error('  1. El documento config/reservations no existe');
        console.error('  2. Problema de autenticación');
        console.error('  3. Reglas de Firestore no permiten escritura');
        console.error('\n💡 Solución:');
        console.error('  - Ejecutar primero: node scripts/seedFirestore.js');
        console.error('  - O actualizar manualmente desde Firestore Console');
        process.exit(1);
    }
}

// Ejecutar
updateConfig();
