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
        navigateFallbackAllowlist: [/^\/$/, /^\/habitos$/, /^\/dashboard$/, /^\/criar$/, /^\/editarHabito\/.+$/]
      }
    })
  ],

  // ✅ Adicionado abaixo:
  server: {
    port: 5173,
    strictPort: true, // 👈 Vite não vai trocar a porta sozinho
    proxy: {
      '/progresso': { target: 'http://localhost:3000', changeOrigin: true },
      '/habitos':   { target: 'http://localhost:3000', changeOrigin: true },
      '/registro':  { target: 'http://localhost:3000', changeOrigin: true },
      '/usuario':   { target: 'http://localhost:3000', changeOrigin: true },
      '/categoria': { target: 'http://localhost:3000', changeOrigin: true } 
    }
  }
});
