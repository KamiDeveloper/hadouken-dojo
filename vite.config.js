
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // Mejorar cache busting para evitar errores de chunks obsoletos
    rollupOptions: {
      output: {
        // Generar hashes únicos por contenido
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // Optimizar splitting para mejor caching
        manualChunks: (id) => {
          // Separar vendors grandes para mejor cache
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Otros vendors juntos
            return 'vendor';
          }
        }
      }
    },

    // Chunks más pequeños para mejor loading
    chunkSizeWarningLimit: 1000,

    // Source maps solo en dev para debugging
    sourcemap: false,
  }
})
