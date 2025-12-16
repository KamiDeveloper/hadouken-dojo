// Script para poblar la colección de jugadores en Firestore
// Ejecutar en la consola del navegador o adaptar para Node.js

const playersData = [
    {
        name: "Arslan Ash",
        mainChar: "Nina",
        rank: 1,
        wins: 150,
        losses: 12,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arslan"
    },
    {
        name: "Knee",
        mainChar: "Bryan",
        rank: 2,
        wins: 145,
        losses: 15,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Knee"
    },
    {
        name: "Atif Butt",
        mainChar: "Dragunov",
        rank: 3,
        wins: 138,
        losses: 18,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Atif"
    },
    {
        name: "Chikurin",
        mainChar: "Lili",
        rank: 4,
        wins: 130,
        losses: 20,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chikurin"
    },
    {
        name: "Nobi",
        mainChar: "Dragunov",
        rank: 5,
        wins: 125,
        losses: 22,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nobi"
    },
    {
        name: "Jeondding",
        mainChar: "Eddy",
        rank: 6,
        wins: 120,
        losses: 25,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeondding"
    },
    {
        name: "Rangchu",
        mainChar: "Kuma",
        rank: 7,
        wins: 115,
        losses: 28,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rangchu"
    },
    {
        name: "Qudans",
        mainChar: "Devil Jin",
        rank: 8,
        wins: 110,
        losses: 30,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Qudans"
    },
    {
        name: "LowHigh",
        mainChar: "Shaheen",
        rank: 9,
        wins: 105,
        losses: 32,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LowHigh"
    },
    {
        name: "Book",
        mainChar: "Jin",
        rank: 10,
        wins: 100,
        losses: 35,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Book"
    }
];

// Instrucciones para poblar:
// 1. Copia este array `playersData`.
// 2. En tu componente Ranking.jsx o en un archivo temporal, usa el siguiente código:

/*
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const populatePlayers = async () => {
    const batch = writeBatch(db);
    const collectionRef = collection(db, 'leagues/tekken8/players');

    playersData.forEach((player) => {
        const docRef = doc(collectionRef); // Auto-ID
        batch.set(docRef, player);
    });

    await batch.commit();
    console.log('Players populated successfully!');
};
*/
