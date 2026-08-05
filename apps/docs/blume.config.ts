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
  seo: {
    // Brand the auto-generated per-page OG cards to the dark instrument look of
    // the custom landing card, so every share image matches. `logo-og.svg` is
    // the horizontal mark with currentColor strokes so Blume paints it in the
    // light `foreground` on the dark background.
    og: {
      logo: "/logo-og.svg",
      palette: {
        accent: "oklch(0.76 0.12 290)",
        background: "#0b0b12",
        foreground: "#f5f3ff",
        muted: "#a6a3be",
        border: "rgb(255 255 255 / 0.1)",
      },
    },
  },
  deployment: {
    output: "static",
  },
  ai: {
    llmsTxt: true,
  },
});
