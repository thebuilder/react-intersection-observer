import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: ["@vitest/coverage-istanbul", "react", "react-dom/test-utils"],
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.ssr.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.ssr.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
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
