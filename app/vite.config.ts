import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Attendence-portal-/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Terna Engineering College Attendance Portal',
        short_name: 'Attendance',
        description: 'QR-based attendance portal',
        theme_color: '#5d2fd2',
        background_color: '#f2f2fb',
        display: 'standalone',
        start_url: '/Attendence-portal-/',
        icons: [
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
