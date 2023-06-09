import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Radio Hermon",
        short_name: "Radio Hermon",
        description: "Un rocío que desciende de lo alto",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        lang: "en",
        scope: "/",
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
        theme_color: "#ffffff",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
