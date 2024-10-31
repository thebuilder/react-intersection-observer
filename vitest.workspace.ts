import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "vitest.config.mts",
    test: {
      include: ["src/**/*.test.{ts,tsx}"],
      exclude: ["**/*.browser.test.{ts,tsx}", "**/browser/*.test.{ts,tsx}"],
      name: "jsdom",
      environment: "jsdom",
    },
  },
  {
    extends: "vitest.config.mts",
    test: {
      include: [
        "src/**/*.browser.test.{ts,tsx}",
        "src/**/browser/*.test.{ts,tsx}",
      ],
      name: "browser",
      environment: "node",
      browser: {
        enabled: true,
        name: "chromium",
        provider: "playwright",
        headless: true,
      },
    },
  },
]);
