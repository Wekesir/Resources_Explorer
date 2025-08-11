import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "jquery",
      "datatables.net",
      "datatables.net-buttons",
      "datatables.net-buttons-dt",
      "datatables.net-dt",
    ],
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: 3000,
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /datatables\.net/],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          jquery: "$",
        },
      },
    },
  },
});
