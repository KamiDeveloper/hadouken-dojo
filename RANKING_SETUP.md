# 🚀 GUÍA DE CONFIGURACIÓN - SISTEMA DE RANKING

## ⚠️ Pasos Críticos para Eliminar Errores de Permisos

### 1. Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### 2. Poblar la Base de Datos

Usa el script en `src/utils/populatePlayers.js`:

```javascript
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "../config/firebase";

const playersData = [
  {
    name: "Arslan Ash",
    mainChar: "Nina",
    rank: 1,
    wins: 150,
    losses: 12,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arslan",
  },
  // ... resto de jugadores
];

const populatePlayers = async () => {
  const batch = writeBatch(db);
  const collectionRef = collection(db, "leagues/tekken8/players");

  playersData.forEach((player) => {
    const docRef = doc(collectionRef);
    batch.set(docRef, player);
  });

  await batch.commit();
  console.log("✅ Players populated successfully!");
};

// Ejecutar una vez
populatePlayers();
```

**Opción Rápida:** Copia y pega esto en la consola del navegador (en `/ranking`):

```javascript
import { collection, writeBatch, doc } from "firebase/firestore";

const db = window.__FIREBASE_DB__; // O accede desde el objeto global

(async () => {
  const players = [
    {
      name: "Arslan Ash",
      mainChar: "Nina",
      rank: 1,
      wins: 150,
      losses: 12,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arslan",
    },
    {
      name: "Knee",
      mainChar: "Bryan",
      rank: 2,
      wins: 145,
      losses: 15,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Knee",
    },
    {
      name: "Atif Butt",
      mainChar: "Dragunov",
      rank: 3,
      wins: 138,
      losses: 18,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Atif",
    },
    {
      name: "Chikurin",
      mainChar: "Lili",
      rank: 4,
      wins: 130,
      losses: 20,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chikurin",
    },
    {
      name: "Nobi",
      mainChar: "Dragunov",
      rank: 5,
      wins: 125,
      losses: 22,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nobi",
    },
    {
      name: "Jeondding",
      mainChar: "Eddy",
      rank: 6,
      wins: 120,
      losses: 25,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeondding",
    },
    {
      name: "Rangchu",
      mainChar: "Kuma",
      rank: 7,
      wins: 115,
      losses: 28,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rangchu",
    },
    {
      name: "Qudans",
      mainChar: "Devil Jin",
      rank: 8,
      wins: 110,
      losses: 30,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Qudans",
    },
    {
      name: "LowHigh",
      mainChar: "Shaheen",
      rank: 9,
      wins: 105,
      losses: 32,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LowHigh",
    },
    {
      name: "Book",
      mainChar: "Jin",
      rank: 10,
      wins: 100,
      losses: 35,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Book",
    },
  ];

  const batch = writeBatch(db);
  players.forEach((p) => {
    const ref = doc(collection(db, "leagues/tekken8/players"));
    batch.set(ref, p);
  });
  await batch.commit();
  alert("✅ Jugadores creados! Recarga la página.");
})();
```

### 3. Crear Índices Compuestos en Firestore

**Firebase Console → Firestore Database → Indexes → Create Index**

#### Índice 1: Players

- **Collection**: `leagues/tekken8/players`
- **Fields**: `rank` (Ascending)
- **Query scope**: Collection

#### Índice 2: Matches

- **Collection**: `matches`
- **Fields**: `scheduledTime` (Descending)
- **Query scope**: Collection

**O usar el archivo `firestore.indexes.json`:**

```json
{
  "indexes": [
    {
      "collectionGroup": "players",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "rank",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "scheduledTime",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

Luego:

```bash
firebase deploy --only firestore:indexes
```

### 4. Verificar Estructura de Datos

**Firestore Console debe tener:**

```
leagues/
  └── tekken8/
      └── players/
          └── [auto-id-1]
              ├── name: "Arslan Ash"
              ├── mainChar: "Nina"
              ├── rank: 1
              ├── wins: 150
              ├── losses: 12
              └── avatar: "https://..."
          └── [auto-id-2]
              ├── name: "Knee"
              └── ...

matches/
  (Vacío por ahora - se crean desde el Admin Panel)
```

### 5. Configurar Usuario Admin

En Firestore Console, edita tu documento de usuario:

```
users/
  └── [tu-uid]
      ├── email: "tu@email.com"
      ├── role: "admin"  ← ¡IMPORTANTE!
      └── ...
```

---

## 🧪 Testing

1. Recarga `/ranking`
2. Deberías ver los 10 jugadores con podio animado
3. Si eres admin, aparece botón rojo flotante (abajo derecha)
4. Click → Panel Admin → Crear match → Actualizar scores

---

## 📋 Checklist

- [ ] `firebase deploy --only firestore:rules`
- [ ] Índices creados en Firestore
- [ ] Jugadores poblados (10 mínimo)
- [ ] Usuario con `role: 'admin'`
- [ ] Sin errores en consola
- [ ] Podio visible con Top 3

---

## 🐛 Troubleshooting

**Error: "Missing or insufficient permissions"**
→ Despliega las reglas actualizadas (`firestore.rules`)

**Error: "Index required"**
→ Crea los índices en Firebase Console (links en la consola)

**No se ven jugadores**
→ Ejecuta el script de población

**No aparece botón admin**
→ Verifica que tu user tenga `role: 'admin'` en Firestore
