import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index:
        process.env.REACT_MAJOR === "19"
          ? "./entry-react19.jsx"
          : "./entry-legacy.jsx",
    },
  },
  output: {
    distPath: { root: "dist" },
    filename: { js: "[name].js" },
  },
  performance: {
    chunkSplit: { strategy: "all-in-one" },
  },
});
