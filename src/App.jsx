import Home from './pages/Home'
import GetStarted from './pages/GetStarted'
import Profile from './pages/Profile'
import CompleteRegistration from './pages/CompleteRegistration'
import SystemManagement from './pages/SystemManagement'
import Reservations from './pages/Reservations'
import Ranking from './pages/Ranking'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import { LoadingProvider, useLoading } from './context/LoadingContext'
import { ResponsiveProvider } from './context/ResponsiveContext'
import SkeletonPage from './components/skeletons/SkeletonPage'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

function AppContent() {
  const { isLoading } = useLoading();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        {/* Rutas públicas */}
        <Route index element={<Home />} />
        <Route path='ranking' element={<Ranking />} />
        <Route path='getstarted' element={<GetStarted />} />

        {/* Rutas antiguas redirigen a la nueva */}
        <Route path='login' element={<GetStarted />} />
        <Route path='signup' element={<GetStarted />} />

        {/* Ruta de completar registro (accesible para OAuth users) */}
        <Route path='completar-registro' element={<CompleteRegistration />} />

        {/* Rutas protegidas - Requieren autenticación */}
        <Route path='profile' element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path='reservations' element={
          <PrivateRoute>
            <Reservations />
          </PrivateRoute>
        } />

        {/* Rutas de administrador - Requieren rol admin */}
        <Route path='system' element={
          <AdminRoute>
            <SystemManagement />
          </AdminRoute>
        } />
      </Route>
    )
  )

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <RouterProvider router={router} />
  )
}

function App() {
  return (
    <ResponsiveProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </ResponsiveProvider>
  )
}

export default App
