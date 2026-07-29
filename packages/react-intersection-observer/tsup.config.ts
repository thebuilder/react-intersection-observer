import { defineConfig, type Options } from "tsup";

const commons: Options = {
  minify: false,
  sourcemap: true,
  dts: true,
  clean: true,
  target: "es2018",
  external: ["react"],
  format: ["esm", "cjs"],
};

export default defineConfig([
  {
    ...commons,
    entry: ["src/index.tsx"],
    outDir: "dist",
  },
  {
    ...commons,
    entry: { index: "src/test-utils.ts" },
    outDir: "test-utils",
    sourcemap: false,
  },
]);
