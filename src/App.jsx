
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SystemManagement from './pages/SystemManagement'
import Reservations from './pages/Reservations'
import Info from './pages/Info'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'

function App() {


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path='info' element={<Info />} />
        <Route path='login' element={<Login />} />
        <Route path='signup' element={<Signup />} />
        <Route path='system' element={<SystemManagement />} />
        <Route path='reservations' element={<Reservations />} />
      </Route>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App
