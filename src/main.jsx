import { createRoot } from 'react-dom/client'
import './index.css'
import './skeleton-styles.css'
import App from './App.jsx'

// Registrar plugins de GSAP globalmente
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// Providers
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#101010',
            color: '#efefef',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // Emerald 500
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444', // Red 500
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6', // Blue 500
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  </QueryClientProvider>
)
