import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // expone el servidor en la red local (para probar con el celular)
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
