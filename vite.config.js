import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import history from "connect-history-api-fallback";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: true,
    configureServer(server) {
      server.middlewares.use(history());
    },
  },
});

// vite.config.js is present and correct.
// Make sure @vitejs/plugin-react is installed in your project dependencies.
// Run: npm install @vitejs/plugin-react --save-dev
