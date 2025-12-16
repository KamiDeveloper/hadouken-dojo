# Sistema de Ranking - Estructura Refactorizada

## 📁 Estructura del Proyecto

```
src/
├── pages/
│   ├── Ranking.jsx                      # Componente principal (orquestador)
│   └── ranking-components/              # Componentes UI separados
│       ├── LiveMatchBanner.jsx          # Banner de match en vivo
│       ├── Podium.jsx                   # Podio top 3
│       ├── LadderItem.jsx               # Item del ladder
│       └── AdminPanel.jsx               # Panel de administración
├── hooks/
│   └── ranking/
│       ├── useRankingPlayers.js         # Hook para operaciones de jugadores
│       └── useRankingMatches.js         # Hook para operaciones de matches
└── services/
    └── ranking/
        └── rankingService.js            # Lógica de negocio y validaciones
```

## 🎯 Propósito de la Refactorización

Esta refactorización separa la lógica de datos de los componentes UI, mejorando:

- **Mantenibilidad**: Cada archivo tiene una responsabilidad clara
- **Reutilización**: Los hooks y servicios pueden usarse en otros componentes
- **Testabilidad**: Lógica separada es más fácil de testear
- **Rendimiento**: Optimización de llamadas a base de datos
- **Escalabilidad**: Fácil agregar nuevas características

## 📦 Hooks Personalizados

### useRankingPlayers

Maneja todas las operaciones relacionadas con jugadores:

```javascript
const {
  players, // Lista de jugadores ordenada por rank
  loading, // Estado de carga
  createPlayer, // Crear un jugador
  createPlayersBulk, // Crear múltiples jugadores
  deletePlayer, // Eliminar jugador
  uploadAvatar, // Subir avatar
} = useRankingPlayers();
```

**Características:**

- ✅ Suscripción en tiempo real a Firestore
- ✅ Optimización automática de imágenes
- ✅ Carga por lotes (bulk upload)
- ✅ Manejo de errores integrado

### useRankingMatches

Maneja todas las operaciones relacionadas con matches:

```javascript
const {
  matches, // Todos los matches
  liveMatches, // Matches en vivo
  scheduledMatches, // Matches programados
  completedMatches, // Matches completados
  createMatch, // Crear un match
  updateMatchScore, // Actualizar score
} = useRankingMatches();
```

**Características:**

- ✅ Suscripción en tiempo real a Firestore
- ✅ Filtrado automático por estado
- ✅ Validaciones de reglas de reto
- ✅ Actualización de scores en tiempo real

## 🛠️ Servicios

### rankingService

Contiene toda la lógica de negocio:

```javascript
rankingService.calculateWinRate(wins, losses);
rankingService.validateChallenge(challenger, defender);
rankingService.handleMatchCompletion(matchId, match, score1, score2);
rankingService.getDefaultAvatar();
```

**Funcionalidades:**

- ✅ Cálculo de win rates
- ✅ Validación de retos
- ✅ Transacciones de Firestore para cambios de ranking
- ✅ Lógica de intercambio de posiciones

## 🧩 Componentes UI

### Ranking.jsx (Principal)

Componente orquestador que:

- Usa los hooks para obtener datos
- Pasa datos a componentes hijos
- Maneja estado de UI (admin panel, loading)
- **~190 líneas** (antes: ~1000 líneas)

### LiveMatchBanner.jsx

Muestra el banner de un match en vivo con:

- Información de ambos jugadores
- Score en tiempo real
- Formato del match (BO3, BO5, BO7)

### Podium.jsx

Renderiza el podio animado para los top 3:

- Animaciones de entrada
- Win rate de cada jugador
- Colores personalizados por posición

### LadderItem.jsx

Item individual del ladder con:

- Avatar y stats del jugador
- Indicador de tendencia (UP/DOWN/SAME)
- Animaciones de hover

### AdminPanel.jsx

Panel completo de administración con 3 tabs:

- **Retos**: Crear y gestionar matches
- **Jugadores**: Añadir/eliminar jugadores
- **Lote**: Carga masiva desde JSON

## 🔄 Flujo de Datos

```
                      ┌──────────────────┐
                      │   Firestore DB   │
                      └────────┬─────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
           ┌────────▼──────┐    ┌────────▼──────┐
           │ useRanking    │    │ useRanking    │
           │   Players     │    │   Matches     │
           └────────┬──────┘    └────────┬──────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                      ┌────────▼─────────┐
                      │   Ranking.jsx    │
                      │  (Orquestador)   │
                      └────────┬─────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
      ┌────▼─────┐      ┌──────▼────┐      ┌──────▼────┐
      │  Podium  │      │  Ladder   │      │   Admin   │
      │          │      │   Items   │      │   Panel   │
      └──────────┘      └───────────┘      └───────────┘
```

## 📝 Ventajas de la Nueva Arquitectura

### Antes

- ❌ 1 archivo de ~1000 líneas
- ❌ Lógica mezclada con UI
- ❌ Múltiples llamadas redundantes a DB
- ❌ Difícil de testear
- ❌ Difícil de mantener

### Después

- ✅ Múltiples archivos con responsabilidades claras
- ✅ Lógica separada en hooks y servicios
- ✅ Una sola suscripción por colección
- ✅ Fácil de testear cada parte
- ✅ Fácil de extender y mantener
- ✅ Reutilizable en otros componentes

## 🚀 Cómo Usar

### En el componente Ranking principal:

```javascript
import { useRankingPlayers } from "../hooks/ranking/useRankingPlayers";
import { useRankingMatches } from "../hooks/ranking/useRankingMatches";

const Ranking = () => {
  // Obtener datos
  const { players, loading, createPlayer } = useRankingPlayers();
  const { liveMatches, createMatch } = useRankingMatches();

  // Usar los datos en el componente
  return (
    <div>
      {liveMatches.map((match) => (
        <LiveMatchBanner key={match.id} match={match} players={players} />
      ))}
    </div>
  );
};
```

### En un nuevo componente:

```javascript
// Reutilizar los mismos hooks sin duplicar llamadas
import { useRankingPlayers } from "../hooks/ranking/useRankingPlayers";

const NewComponent = () => {
  const { players } = useRankingPlayers(); // Usa la misma suscripción
  // ...
};
```

## 🔧 Extensibilidad

Para agregar nuevas funcionalidades:

1. **Nueva operación de DB**: Agregar función en el hook correspondiente
2. **Nueva validación**: Agregar en `rankingService.js`
3. **Nuevo componente UI**: Crear en `ranking-components/`
4. **Nueva funcionalidad de admin**: Extender `AdminPanel.jsx`

## 📊 Métricas de Mejora

- **Líneas de código en Ranking.jsx**: 1000+ → ~190 (81% reducción)
- **Archivos separados**: 1 → 9
- **Responsabilidades claramente definidas**: ✅
- **Reutilización de código**: ✅
- **Mantenibilidad**: Alta
- **Testabilidad**: Alta

## 🎨 Beneficios para el Equipo

- **Desarrolladores**: Código más fácil de entender y modificar
- **QA**: Componentes más fáciles de testear individualmente
- **PM**: Features más rápidas de implementar
- **Usuarios**: Mejor rendimiento y experiencia

## 🔮 Próximos Pasos Sugeridos

1. Agregar tests unitarios para hooks y servicios
2. Implementar caché para optimizar aún más
3. Agregar logs y analytics
4. Crear más hooks para otras funcionalidades
5. Documentar APIs de cada módulo

---

**Fecha de refactorización**: 27 de noviembre de 2025  
**Versión**: 2.0
