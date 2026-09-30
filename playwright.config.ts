import { defineConfig, devices } from "@playwright/test";

const appUrl = "http://127.0.0.1:4173";
const apiUrl = "http://127.0.0.1:5099";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: appUrl,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "node e2e/mock-server.mjs",
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
      url: appUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_DEVELOPMENT_URL: `${apiUrl}/api/v1`,
        VITE_DEVELOPMENT_WS_URL: "ws://127.0.0.1:5099/ws",
        VITE_PLATE_VISTA_URL: appUrl,
      },
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
