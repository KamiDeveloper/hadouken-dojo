# ⚠️ Setup Rápido - Sistema de Ranking Refactorizado

## 🚀 Pasos Críticos para Eliminar Errores de Permisos

### 1️⃣ Desplegar Reglas de Firestore y Storage

**⚠️ IMPORTANTE: Si es la primera vez usando Storage**

Firebase Storage debe estar habilitado antes de desplegar reglas:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto "hadouken-dojo"
3. En el menú lateral: **Build** → **Storage**
4. Si ves **"Get started"**:
   - Click en el botón
   - Acepta las reglas por defecto (las sobrescribiremos)
   - Selecciona ubicación: **nam5** (misma que Firestore)
   - Click **"Done"**
5. Espera 30 segundos a que se active

**Desplegar Reglas:**

```bash
# Opción 1: Solo Firestore (si Storage aún no está habilitado)
firebase deploy --only firestore:rules

# Opción 2: Ambas (si Storage ya está habilitado)
firebase deploy --only firestore:rules,storage:rules
```

**Si usaste Opción 1, después habilita Storage y ejecuta:**

```bash
firebase deploy --only storage:rules
```

**Qué hace esto:**

- Actualiza las reglas de seguridad de Firestore (permite lectura pública de rankings)
- Actualiza las reglas de Storage (permite admins subir avatares)
- Habilita acceso a `leagues/tekken8/players` y `matches` para todos los usuarios

**Tiempo estimado:** 30-60 segundos

---

### 2️⃣ Crear Índices Compuestos en Firestore

**Opción A: Automática (Recomendada)**

1. Abre la aplicación en el navegador (`bun dev`)
2. Abre la consola del navegador (F12)
3. Navega a `/ranking`
4. **Verás un error con un link azul** que dice "The query requires an index"
5. **Click en el link** → Te lleva a Firebase Console
6. Click "Create Index" → Espera 2-3 minutos a que se construya

**Opción B: Manual**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Firestore Database → Indexes
4. Click "Create Index"
5. Agrega estos índices:

**Índice 1: Players**

- Collection ID: `leagues/tekken8/players`
- Campo 1: `currentRank` (Ascending)

**Índice 2: Matches**

- Collection ID: `matches`
- Campo 1: `scheduledDate` (Descending)

---

### 3️⃣ Añadir Jugadores

**Opción A: Carga Individual (Interfaz Visual)**

1. Inicia sesión como admin en la app
2. Ve a `/ranking`
3. Click en el botón flotante rojo (engranaje)
4. Selecciona la pestaña "Jugadores"
5. Completa el formulario:
   - Nickname: `VoidWalker`
   - Email: `voidwalker@example.com`
   - Personaje Principal: `Kazuya`
   - (Opcional) Sube una foto de perfil
6. Click "Añadir Jugador"
7. Repite para más jugadores

**Opción B: Carga por Lotes (JSON)**

1. Descarga el archivo de ejemplo: `docs/sample-players-bulk.json`
2. Modifica los datos según tu liga
3. Ve a `/ranking` → Admin Panel → Pestaña "Lote"
4. Selecciona el archivo JSON
5. Click "Cargar Jugadores"
6. Sistema crea todos los jugadores automáticamente

**Formato JSON:**

```json
[
  {
    "nickname": "Player1",
    "email": "player1@example.com",
    "mainCharacter": "Kazuya",
    "avatarUrl": "https://optional-url.com",
    "stats": {
      "wins": 0,
      "losses": 0
    }
  }
]
```

---

### 4️⃣ Configurar Usuario Admin

**En Firestore Console:**

1. Ve a Firestore Database
2. Navega a `users/{tu_uid}`
3. Edita el documento
4. Agrega/modifica el campo:
   ```
   role: "admin"
   ```
5. Guarda los cambios

**Verificar:**

- Recarga `/ranking`
- Deberías ver el botón flotante rojo (engranaje) en la esquina inferior derecha

---

## 🧪 Testing

### ✅ Verificación del Sistema

1. **Página carga sin errores en consola**

   - No hay errores de permisos
   - No hay errores de índices

2. **Jugadores visibles en el ranking**

   - Top 3 aparecen en el podio
   - Resto aparecen en la lista con avatares

3. **Admin Panel funciona** (si eres admin)

   - Botón flotante rojo visible
   - 3 pestañas: Retos, Jugadores, Lote
   - Puedes crear jugadores y retos

4. **Crear un reto de prueba**

   - Selecciona Retador (rank inferior)
   - Selecciona Defensor (rank superior)
   - Click "Crear Reto"
   - Aparece en "Retos Activos"

5. **Simular un match**
   - Click "INICIAR" en un reto
   - Banner "EN VIVO" aparece en la página pública
   - Actualiza scores (ej. 3-1)
   - Click "FINALIZAR"
   - Si retador ganó: ranks se intercambian
   - Trends actualizadas (flechas ↑↓)

---

## 📋 Checklist Final

- [ ] Reglas desplegadas (`firebase deploy --only firestore:rules,storage:rules`)
- [ ] Índices creados (players: currentRank ASC, matches: scheduledDate DESC)
- [ ] Al menos 5 jugadores añadidos (individual o lote)
- [ ] Usuario configurado como admin (role: "admin")
- [ ] Página `/ranking` carga sin errores
- [ ] Admin Panel accesible (botón flotante rojo)
- [ ] Reto de prueba creado y finalizado exitosamente

---

## 🐛 Troubleshooting Común

### Error: "Could not find rules for the following storage targets"

- **Causa**: Firebase Storage no está habilitado en tu proyecto
- **Solución**:
  1. Ve a Firebase Console → Build → Storage
  2. Click "Get started" para habilitar Storage
  3. Selecciona ubicación **nam5** (misma que Firestore)
  4. Espera 30 segundos
  5. Ejecuta: `firebase deploy --only storage:rules`

### Error: "Missing or insufficient permissions"

- **Causa**: Firestore Rules no desplegadas o no actualizadas
- **Solución**:
  ```bash
  firebase deploy --only firestore:rules
  ```
  Espera 30 segundos y recarga la página

### Error: "The query requires an index"

- **Causa**: Índices compuestos no creados
- **Solución**: Click en el link azul del error → "Create Index" → Espera 2-3 minutos

### No veo el botón de Admin Panel

- **Causa**: Tu usuario no tiene `role: "admin"` en Firestore
- **Solución**: Edita `users/{tu_uid}` en Firestore Console y añade `role: "admin"`

### Dropdowns de jugadores vacíos al crear reto

- **Causa**: No hay jugadores en la base de datos
- **Solución**: Añade jugadores desde Admin Panel → Pestaña "Jugadores" o "Lote"

### Avatar no se sube al crear jugador

- **Causa**: Storage Rules no desplegadas
- **Solución**:
  ```bash
  firebase deploy --only storage:rules
  ```

### Ranks no se intercambian al finalizar match

- **Causa**: Transacción fallando por permisos o validación
- **Solución**:
  1. Verifica que ambos jugadores existen en Firestore
  2. Verifica que retador tiene rank inferior (número mayor)
  3. Revisa consola del navegador para error específico

---

## 📚 Recursos Adicionales

- **Guía Completa**: Ver `docs/RANKING_SYSTEM_GUIDE.md`
- **Ejemplo JSON**: Ver `docs/sample-players-bulk.json`
- **Firestore Rules**: Ver `firestore.rules` (líneas 130-144)
- **Storage Rules**: Ver `storage.rules`

---

## 🆘 Soporte

Si después de seguir estos pasos aún tienes errores:

1. Abre la consola del navegador (F12)
2. Copia el error completo
3. Verifica que completaste los 4 pasos críticos
4. Revisa la sección de Troubleshooting

**Errores comunes resueltos:**

- ✅ Permisos denegados → Desplegar rules
- ✅ Índices faltantes → Crear índices
- ✅ Admin panel no visible → Configurar role
- ✅ Jugadores vacíos → Añadir jugadores
