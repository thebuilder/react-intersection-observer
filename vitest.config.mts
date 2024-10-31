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
      name: "chromium",
      provider: "playwright",
      headless: true,
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
