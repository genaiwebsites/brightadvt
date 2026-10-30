import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  workers: 1,
  webServer: [
    {
      command: "npx vite preview --port 4173",
      cwd: "./reference",
      url: "http://localhost:4173",
      reuseExistingServer: true,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "npx astro preview --port 4321",
      url: "http://localhost:4321",
      reuseExistingServer: true,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
  use: {
    browserName: "chromium",
  },
});

