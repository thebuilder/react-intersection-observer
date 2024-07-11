import { type Options, defineConfig } from "tsup";

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
    entryPoints: ["src/index.tsx"],
    outDir: "dist",
  },
  {
    ...commons,
    entryPoints: { index: "src/test-utils.ts" },
    outDir: "test-utils",
    sourcemap: false,
  },
]);
