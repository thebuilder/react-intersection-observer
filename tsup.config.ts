import { defineConfig } from 'tsup';

export default defineConfig({
  minify: false,
  sourcemap: true,
  dts: true,
  clean: true,
  target: 'esnext',
  external: ['react'],
  format: ['esm', 'cjs'],
});
