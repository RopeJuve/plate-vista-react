import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

/**
 * Serves msw's service worker at `/mockServiceWorker.js` during `npm run dev` only,
 * for `VITE_USE_MOCKS=true`. Nothing is copied into `public/`, so builds never ship it.
 */
const mswDevWorker = (): Plugin => ({
  name: "msw-dev-worker",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/mockServiceWorker.js", (_req, res) => {
      res.setHeader("Content-Type", "text/javascript");
      res.end(fs.readFileSync(path.resolve(__dirname, "node_modules/msw/lib/mockServiceWorker.js")));
    });
  },
});

export default defineConfig({
  plugins: [react(), mswDevWorker()],
  resolve: {
    // More specific aliases must come first. Linux/Netlify is case-sensitive:
    // `@/components` lives on disk as `src/Components`.
    alias: [
      {
        find: "@/components",
        replacement: path.resolve(__dirname, "./src/Components"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    extensions: [".mjs", ".mts", ".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react/")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/axios")) {
            return "axios";
          }
        },
      },
    },
  },
});
