import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        // Excluir rutas de supabase si las hubiera, aunque el SW usualmente solo intercepta get
        navigateFallback: 'index.html',
      },
      manifest: {
        name: "BiblioNexo",
        short_name: "BiblioNexo",
        start_url: "/",
        display: "standalone",
        background_color: "#F7F4EB",
        theme_color: "#7A431D",
        icons: [
          {
            src: "/icono-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icono-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icono-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  }
});
