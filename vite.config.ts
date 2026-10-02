import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate': el service worker se actualiza solo en segundo plano cuando hay una
      // versión nueva desplegada, sin pedirle al cliente que confirme nada (no es una app
      // crítica tipo banco donde convenga controlar el momento exacto de la actualización).
      registerType: 'autoUpdate',
      // injectRegister: false porque el registro se hace a mano en
      // src/registrarServiceWorker.ts, para poder además revisar actualizaciones de forma
      // periódica mientras la app sigue abierta (ver ese archivo) — el <script> que inyecta
      // 'auto' no deja enganchar esa lógica extra.
      injectRegister: false,
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ferretería Gold',
        short_name: 'Ferretería Gold',
        description: 'Catálogo y pedidos de Ferretería Gold',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        // Mismo navy de marca que usa el resto del sistema (logo, sidebar), para que la
        // pantalla de carga y la barra de estado del navegador combinen con la app instalada.
        theme_color: '#16233B',
        background_color: '#16233B',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // La API (todo lo que no sea un archivo estático del propio build) nunca se cachea
        // acá: el catálogo y el stock deben ser siempre datos frescos, no una copia vieja
        // servida por el service worker. El SW solo existe para habilitar la instalación y
        // cachear los assets estáticos (JS/CSS/imágenes) entre visitas.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
