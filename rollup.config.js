/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.jsx', '.ts', '.tsx']
const globals = {
  react: 'React',
}

const getBabelOptions = ({ useESModules }) => ({
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  extensions,
  include: ['src/**/*'],
  presets: ['@babel/preset-typescript'],
  plugins: [['@babel/transform-runtime', { regenerator: false, useESModules }]],
})

export default [
  pkg.module
    ? {
        input: './src/index.tsx',
        output: { file: pkg.module, format: 'esm', exports: 'named' },
        external,
        plugins: [
          resolve({ extensions }),
          babel(getBabelOptions({ useESModules: true })),
        ],
      }
    : null,
  pkg.main
    ? {
        input: './src/index.tsx',
        output: { file: pkg.main, format: 'cjs', exports: 'named' },
        external,
        plugins: [
          resolve({ extensions }),
          babel(getBabelOptions({ useESModules: false })),
        ],
      }
    : null,
  pkg.unpkg
    ? {
        input: './src/index.tsx',
        output: {
          file: pkg.unpkg,
          format: 'umd',
          name: 'ReactIntersectionObserver',
          globals,
          exports: 'named',
        },
        external: Object.keys(globals),
        plugins: [
          resolve({ extensions }),
          replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
          babel(getBabelOptions({ useESModules: true })),
          commonjs({ include: '**/node_modules/**' }),
          uglify(),
        ],
      }
    : null,
].filter(Boolean)
