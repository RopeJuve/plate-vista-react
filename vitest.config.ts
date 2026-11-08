import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    // Same order as vite.config.ts: `@/components` lives on disk as `src/Components`.
    alias: [
      { find: "@/components", replacement: path.resolve(__dirname, "./src/Components") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  test: {
    // The REST client's base URL; msw handlers match any origin, so the value only has to be absolute.
    env: { VITE_VERCEL_API_URL: "http://localhost/api/v1" },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          setupFiles: ["./src/test/setupMsw.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./src/test/setup.ts"],
        },
      },
    ],
  },
});
