import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },  
  server: {
    host: true, // expone el servidor en la red local (para probar con el celular)
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
