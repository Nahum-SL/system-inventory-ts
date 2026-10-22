import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    host: true, // expone el servidor en la red local (para probar con el celular)
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
