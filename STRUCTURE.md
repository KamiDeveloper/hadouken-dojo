# Estructura de Carpetas Recomendada

Este documento describe la estructura de carpetas recomendada para el proyecto **Hadouken Dojo**, una aplicación React frontend siguiendo principios de Clean Architecture. Esta organización promueve la separación de responsabilidades, reutilización de código y facilidad de mantenimiento.

## Principios Generales

- **Separación de capas**: Divide el código en capas lógicas (presentación, dominio, infraestructura).
- **Reutilización**: Componentes y utilidades compartidas en carpetas dedicadas.
- **Escalabilidad**: Estructura que permite añadir nuevas funcionalidades sin refactorizar todo.
- **Convenciones**: Usa nombres en inglés para carpetas y archivos, con PascalCase para componentes.

## Estructura de Carpetas

```
src/
├── assets/                 # Recursos estáticos (imágenes, iconos, fuentes)
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── styles/             # Estilos globales (variables CSS, resets)
├── components/             # Componentes reutilizables (UI genérica)
│   ├── Button/
│   ├── Modal/
│   ├── Header/
│   └── Footer/
├── pages/                  # Páginas principales (vistas de rutas)
│   ├── LandingPage/
│   ├── LoginPage/
│   ├── SignupPage/
│   └── AppPages/           # Subpáginas de la app (dashboard, profile, etc.)
│       ├── Dashboard/
│       ├── Profile/
│       └── Settings/
├── hooks/                  # Hooks personalizados de React
│   ├── useAuth.js
│   └── useApi.js
├── context/                # Contextos de React (estado global)
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── services/               # Lógica de negocio y llamadas a API
│   ├── api/                # Configuración de API (axios, fetch)
│   ├── authService.js      # Servicios de autenticación
│   └── userService.js      # Servicios de usuario
├── utils/                  # Utilidades y helpers
│   ├── constants.js        # Constantes globales
│   ├── helpers.js          # Funciones auxiliares
│   └── validators.js       # Validaciones
├── domain/                 # Lógica de dominio (opcional para apps simples)
│   ├── entities/           # Modelos de datos
│   └── useCases/           # Casos de uso
├── App.jsx                 # Componente principal con rutas
├── main.jsx                # Punto de entrada de la app
└── index.css               # Estilos globales
```

## Descripción de Carpetas

### `assets/`

Contiene recursos estáticos como imágenes, iconos y estilos globales. Usa subcarpetas para organizar por tipo.

### `components/`

Componentes UI reutilizables que no dependen de rutas específicas. Cada componente tiene su propia carpeta con el archivo JSX, CSS y tests si aplica.

- Ejemplo: `Button/Button.jsx`, `Button/Button.css`.

### `pages/`

Páginas que corresponden a rutas de React Router. Cada página es un componente que agrupa otros componentes.

- `LandingPage/`: Página de inicio.
- `AppPages/`: Agrupa las subpáginas protegidas de la app para mejor organización.

### `hooks/`

Hooks personalizados para lógica reutilizable, como manejo de autenticación o llamadas a API.

### `context/`

Contextos de React para estado global (ej. autenticación, tema). Proporciona datos a componentes sin prop drilling.

### `services/`

Lógica de negocio y comunicación con el backend. Incluye configuración de API y servicios específicos.

### `utils/`

Funciones auxiliares, constantes y validaciones que se usan en múltiples partes de la app.

### `domain/` (Opcional)

Para apps más complejas, separa entidades (modelos) y casos de uso siguiendo Clean Architecture.

### Archivos Raíz

- `App.jsx`: Define las rutas con React Router.
- `main.jsx`: Renderiza la app en el DOM.
- `index.css`: Estilos globales aplicados a toda la app.

## Recomendaciones de Implementación

- **Imports**: Usa rutas relativas o alias (ej. `@/components/Button`) configurados en Vite.
- **Tests**: Añade carpetas `__tests__` dentro de cada componente/página.
- **Lazy Loading**: Para rutas, usa `React.lazy` para cargar páginas dinámicamente y mejorar el rendimiento.
- **Protección**: Implementa guards en rutas privadas usando contextos.

Esta estructura es flexible y se puede ajustar según el crecimiento del proyecto. ¡Mantén la consistencia para una codebase limpia!</content>
<parameter name="filePath">c:\Users\medra\OneDrive\Escritorio\Current Projects\HDS Remake\hadouken-dojo\STRUCTURE.md
