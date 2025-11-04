# Hadouken Dojo

Aplicación web frontend construida con React y Vite, utilizando React Router para el enrutamiento. Esta app sigue una arquitectura Clean y expandible, separando las rutas públicas de las privadas para una mejor organización y reutilización de componentes.

## Arquitectura de Rutas

La estructura de rutas se basa en principios de Clean Architecture, priorizando la separación de responsabilidades:

- **Rutas públicas**: Accesibles sin autenticación (landing, login, signup).
- **Rutas de aplicación**: Protegidas, accesibles solo después del login, con subrutas anidadas para expandibilidad.

Esto permite una navegación intuitiva, protección de rutas y facilidad para añadir nuevas funcionalidades sin refactorizar el código base.

### Rutas Públicas

Estas rutas son accesibles para todos los usuarios y no requieren autenticación.

- `/` - **Landing Page**: Página de inicio principal, con información general sobre la app, llamadas a acción (como botones para login/signup) y navegación hacia otras secciones.
- `/login` - **Login Page**: Formulario de inicio de sesión. Al autenticarse, redirige a `/app`.
- `/signup` - **Signup Page**: Formulario de registro de nuevos usuarios. Después del registro, puede redirigir a `/login` o directamente a `/app`.

### Rutas de la Aplicación (Privadas)

Estas rutas están protegidas y requieren autenticación. Se anidan bajo `/app` para una estructura jerárquica y reutilizable. Usa un componente de protección de rutas (ej. `PrivateRoute`) para verificar el estado de autenticación antes de renderizar.

- `/app` - **Dashboard**: Página principal de la aplicación después del login. Muestra un resumen, widgets o navegación a subsecciones.
- `/app/profile` - **Perfil de Usuario**: Gestión del perfil personal (editar datos, cambiar contraseña).
- `/app/settings` - **Configuraciones**: Opciones generales de la app (tema, notificaciones, etc.).
- `/app/projects` - **Proyectos**: Lista y gestión de proyectos (ejemplo de subpágina expandible; puedes añadir `/app/projects/:id` para detalles específicos).
- `/app/analytics` - **Análisis**: Dashboard de métricas y reportes.

### Implementación en React Router

Para implementar estas rutas, usa `BrowserRouter`, `Routes` y `Route` de `react-router-dom`. Ejemplo básico en `App.jsx`:

```jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
// ... otros imports

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Rutas Privadas (protegidas) */}
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      {/* Añade más rutas aquí */}
    </Routes>
  );
}
```

- **Protección de Rutas**: Implementa un componente `PrivateRoute` que verifique si el usuario está autenticado (usando contexto o estado global). Si no, redirige a `/login`.
- **Navegación**: Usa `<Link>` o `useNavigate` para transiciones suaves sin recargas.
- **Expandibilidad**: Para añadir nuevas subrutas, simplemente agrega `<Route>` bajo `/app`. Separa componentes en carpetas como `pages/` y `components/` para mantener la arquitectura limpia.

## Instalación y Ejecución

1. Clona el repositorio y navega al directorio:

   ```
   git clone <url-del-repo>
   cd hadouken-dojo
   ```

2. Instala dependencias con Bun:

   ```
   bun install
   ```

3. Ejecuta el servidor de desarrollo:

   ```
   bun run dev
   ```

4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Scripts Disponibles

- `bun run dev`: Inicia el servidor de desarrollo con HMR.
- `bun run build`: Construye la app para producción.
- `bun run lint`: Ejecuta ESLint para verificar el código.
- `bun run preview`: Previsualiza la build de producción.

## Tecnologías Utilizadas

- **React**: Biblioteca para la interfaz de usuario.
- **Vite**: Herramienta de build rápida.
- **React Router**: Para enrutamiento del lado del cliente.
- **ESLint**: Para linting y calidad de código.

Esta estructura asegura que la app sea mantenible, escalable y fácil de extender. Si necesitas añadir más rutas o funcionalidades, ¡házmelo saber!


Arquitectura actual:

Frontend (React) → Vercel
Backend (Functions) → Firebase Hosting
Base de datos → Firestore
Auth → Firebase Authentication
Storage → Firebase Storage