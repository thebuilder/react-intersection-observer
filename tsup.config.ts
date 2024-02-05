import { defineConfig } from "tsup";

export default defineConfig({
  minify: false,
  sourcemap: true,
  dts: true,
  clean: true,
  target: "es2018",
  external: ["react"],
  format: ["esm", "cjs"],
});
