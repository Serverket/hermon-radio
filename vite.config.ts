import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "robots.txt",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
        "android-chrome-192x192-m.png",
        "android-chrome-512x512-m.png",
        "cover.png",
        "charlie-brown.svg",
        "programs/**/*.{png,jpg,jpeg,webp}",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,webp}"],
        globIgnores: ["**/node_modules/**"],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        navigateFallbackAllowlist: [/^\/$/, /^\/[^.]*$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:woff2?|ttf|otf|eot)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "local-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/overlay/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/(app\d*\.sonicpanelradio\.com|cdn\.|cdnjs\.cloudflare\.com|unpkg\.com|jsdelivr\.net)/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdn-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "Radio Hermon",
        short_name: "Radio Hermon",
        description: "Un rocío que desciende de lo alto",
        start_url: "/",
        id: "/",
        display: "standalone",
        background_color: "#ffffff",
        lang: "es",
        scope: "/",
        categories: ["entertainment", "music"],
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-192x192-m.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/android-chrome-512x512-m.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        theme_color: "#02e1ba",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
