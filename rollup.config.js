/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
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
  {
    input: './src/index.tsx',
    output: { file: 'dist/' + pkg.module, format: 'esm', exports: 'named' },
    external,
    plugins: [
      resolve({ extensions }),
      babel(getBabelOptions({ useESModules: true })),
    ],
  },
  {
    input: './src/index.tsx',
    output: { file: 'dist/' + pkg.main, format: 'cjs', exports: 'named' },
    external,
    plugins: [
      resolve({ extensions }),
      babel(getBabelOptions({ useESModules: false })),
    ],
  },
  {
    input: './src/index.tsx',
    output: {
      file: 'dist/' + pkg.unpkg,
      format: 'umd',
      name: 'ReactIntersectionObserver',
      globals,
      exports: 'named',
      sourcemap: true,
    },
    external: Object.keys(globals),
    plugins: [
      resolve({ extensions }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      babel(getBabelOptions({ useESModules: true })),
      commonjs({ include: '**/node_modules/**' }),
      terser(),
    ],
  },
]
