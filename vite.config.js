import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuración para evitar problemas de permisos con OneDrive
  cacheDir: path.join(process.env.TEMP || '/tmp', '.vite-cache'),
  server: {
    host: true,
    port: 3000,
  },
  // Suprimir warnings de Babel sobre archivos grandes
  build: {
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Suprimir logs de optimización
      logLevel: 'error',
    },
  },
})
