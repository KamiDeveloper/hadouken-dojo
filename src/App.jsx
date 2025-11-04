import Home from './pages/Home'
import Acceder from './pages/Acceder'
import Perfil from './pages/Perfil'
import CompleteRegistration from './pages/CompleteRegistration'
import SystemManagement from './pages/SystemManagement'
import Reservations from './pages/Reservations'
import Info from './pages/Info'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import { LoadingProvider, useLoading } from './context/LoadingContext'
import SkeletonPage from './components/skeletons/SkeletonPage'

function AppContent() {
  const { isLoading } = useLoading();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path='info' element={<Info />} />
        <Route path='acceder' element={<Acceder />} />
        <Route path='perfil' element={<Perfil />} />
        {/* Rutas antiguas redirigen a la nueva */}
        <Route path='login' element={<Acceder />} />
        <Route path='signup' element={<Acceder />} />
        <Route path='completar-registro' element={<CompleteRegistration />} />
        <Route path='system' element={<SystemManagement />} />
        <Route path='reservations' element={<Reservations />} />
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
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  )
}

export default App
