import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: ["@vitest/coverage-istanbul"],
  },
  test: {
    environment: "jsdom",
    globals: true,

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
