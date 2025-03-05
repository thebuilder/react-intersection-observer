import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: ["@vitest/coverage-istanbul", "react", "react-dom/test-utils"],
  },
  test: {
    environment: "node",
    globals: true,
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    coverage: {
      provider: "istanbul",
      include: ["src/**"],
      exclude: [
        "**/__tests__",
        "**/*.test.{ts,tsx}",
        "**/*.{story,stories}.tsx",
      ],
    },
  },
});
