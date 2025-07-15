import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FireHabits',
        short_name: 'FireHabits',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#d32f2f',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        navigateFallback: '/',
        navigateFallbackAllowlist: [/^\/$/, /^\/habitos$/, /^\/dashboard$/, /^\/criar$/, /^\/editar\/.+$/]
      }
    })
  ],

  // ✅ Adicionado abaixo:
  server: {
    proxy: {
      "/progresso": "http://localhost:3000",
      "/habitos": "http://localhost:3000",
      "/registro": "http://localhost:3000",
      "/usuario": "http://localhost:3000",
    },
  }
});
