# Hadouken Dojo - Full Stack Project

## Descripcion General

Este proyecto es una aplicacion web Full Stack moderna y de alto rendimiento construida con el ecosistema de React. Integra una Landing Page inmersiva con experiencias 3D y animaciones avanzadas, junto con un robusto Sistema de Reservas y gestion de usuarios.

La arquitectura esta diseñada para ser escalable, segura y optimizada, utilizando las ultimas tecnologias disponibles en el desarrollo web (React 19, TailwindCSS 4.1, Vite 7).

## Tech Stack

### Core & Build

- **Framework**: React 19
- **Build Tool**: Vite 7 (con optimizacion de chunks manual)
- **Lenguaje**: JavaScript (ESModules)
- **Paquete Manager**: Bun

### Estilos & UI

- **CSS Engine**: TailwindCSS 4.1 (Configuracion nativa CSS-first con `@theme` y `@utility`)
- **Fuentes**: Custom fonts (Tarrget, Modern Negra, Mona Sans)
- **Iconos**: Heroicons

### Animaciones & 3D

- **GSAP**: ScrollTrigger para animaciones basadas en scroll.
- **Framer Motion**: Transiciones de componentes y micro-interacciones.
- **Three.js / React Three Fiber**: Experiencias 3D inmersivas en la Landing Page.
- **Lenis**: Smooth scrolling para una experiencia premium.

### Backend & Data (Serverless)

- **Plataforma**: Firebase
- **Base de Datos**: Cloud Firestore (NoSQL)
- **Autenticacion**: Firebase Auth (Google OAuth)
- **Backend Logic**: Cloud Functions
- **Hosting**: Vercel (Frontend) / Firebase Hosting (Backend/Functions)

### Estado & Data Fetching

- **Server State**: TanStack Query (React Query) v5
- **Formularios**: React Hook Form + Zod (Validacion)
- **Global State**: Context API (Auth, Loading, Responsive)

## Estructura del Proyecto

```
/
├── src/
│   ├── components/      # Componentes reutilizables UI
│   ├── config/          # Configuracion de Firebase y servicios
│   ├── context/         # Contextos globales (Auth, UI)
│   ├── layout/          # Layouts principales (Root, etc.)
│   ├── pages/           # Vistas principales (Home, Reservations, etc.)
│   ├── reservationSys/  # Modulo independiente del Sistema de Reservas
│   │   ├── components/  # Componentes especificos de reservas
│   │   ├── hooks/       # Logica de negocio de reservas
│   │   └── services/    # Capa de servicio para Firestore
│   └── index.css        # Configuracion global de estilos y Tailwind 4
├── functions/           # Cloud Functions (Backend)
├── firestore.rules      # Reglas de seguridad de base de datos
└── vite.config.js       # Configuracion de build y optimizacion
```

## Modulos Principales

### 1. Landing Page (/)

- Experiencia visual de alto impacto.
- Integracion de modelos 3D y video.
- Diseño responsivo con enfoque "Mobile First" pero experiencia "Desktop Premium".

### 2. Sistema de Reservas (/reservations)

- Modulo protegido (requiere autenticacion).
- Gestion de slots de tiempo en tiempo real.
- Feedback visual inmediato (Toast notifications).
- Logica de negocio encapsulada en hooks personalizados.

### 3. Autenticacion & Perfil

- Login social con Google.
- Gestion de perfiles de usuario.
- Rutas protegidas (`PrivateRoute`) y de administrador (`AdminRoute`).

## Seguridad

- **Autenticacion**: Manejada via Firebase Auth con persistencia de sesion.
- **Base de Datos**: Reglas de seguridad (`firestore.rules`) para validar lectura/escritura basada en roles y propiedad del documento.
- **Validacion**: Zod schemas para asegurar la integridad de los datos en el cliente antes de enviarlos.

## Optimizacion (Highlights)

- **Code Splitting**: Configuracion manual de chunks en Vite para separar vendors pesados (Three.js, Firebase).
- **Assets**: Carga diferida y optimizacion de fuentes.
- **Rendering**: Uso de `React.memo` y hooks optimizados para evitar re-renders innecesarios en el sistema de reservas.

## Instalacion y Desarrollo

1. **Instalar dependencias**:

   ```bash
   bun install
   ```

2. **Variables de Entorno**:
   Crear un archivo `.env.local` con las credenciales de Firebase:

   ```env
   VITE_API_KEY=...
   VITE_AUTH_DOMAIN=...
   VITE_PROJECT_ID=...
   ...
   ```

3. **Correr en desarrollo**:

   ```bash
   bun dev
   ```

4. **Build para produccion**:
   ```bash
   bun build
   ```

## Despliegue

El frontend esta configurado para desplegarse en **Vercel** (`vercel.json` incluido).

- **Build Command**: `bun run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite
