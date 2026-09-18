import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        escaneo: resolve(__dirname, 'escaneo-remoto.html'),
        privacidad: resolve(__dirname, 'privacidad.html'),
        error404: resolve(__dirname, '404.html')
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // 'script' genera un archivo externo para registrar el SW en vez de un
      // script en línea — necesario porque el CSP de index.html tiene
      // script-src 'self' que bloquea scripts inline (fix crítico #2).
      injectRegister: 'script',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        // Excluir rutas de supabase si las hubiera, aunque el SW usualmente solo intercepta get
        navigateFallback: 'index.html',
      },
      manifest: {
        // filename fuerza que el archivo generado sea manifest.json, que es lo
        // que apunta el <link rel="manifest"> en index.html. Sin esto, vite-pwa
        // genera manifest.webmanifest y la etiqueta devuelve 404 (fix crítico #3).
        filename: 'manifest.json',
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
    setupFiles: ['./vitest.setup.js']
  }
});
