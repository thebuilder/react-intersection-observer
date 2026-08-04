import { defineConfig } from "blume";

import { githubReleaseChangelogSource } from "./sources/github-releases";

export default defineConfig({
  title: "React Intersection Observer",
  description:
    "A lightweight React implementation of the Intersection Observer API.",
  logo: {
    image: "/logo-horizontal.svg",
    // The horizontal mark already carries the wordmark, so hide the extra text
    // label the header would otherwise render beside it (empty string = hidden).
    text: "",
  },
  analytics: {
    vercel: true,
  },
  github: {
    owner: "thebuilder",
    repo: "react-intersection-observer",
    dir: "apps/docs",
  },
  content: {
    sources: [
      { type: "filesystem", root: "docs" },
      {
        type: "custom",
        source: githubReleaseChangelogSource({
          owner: "thebuilder",
          repo: "react-intersection-observer",
        }),
      },
    ],
  },
  navigation: {
    tabs: [
      { label: "Docs", path: "/", href: "/overview" },
      { label: "Changelog", path: "/changelog", href: "/changelog" },
    ],
  },
  theme: {
    accent: {
      light: "oklch(0.6 0.15 290)",
      dark: "oklch(0.76 0.12 290)",
    },
    mode: "system",
  },
  deployment: {
    output: "static",
  },
  ai: {
    llmsTxt: true,
  },
});
