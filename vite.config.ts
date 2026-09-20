import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
