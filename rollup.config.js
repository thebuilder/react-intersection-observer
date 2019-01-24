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

const globals = {
  react: 'React',
}

const getBabelOptions = ({ useESModules }) => ({
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  plugins: [['@babel/transform-runtime', { regenerator: false, useESModules }]],
})

export default [
  pkg.module
    ? {
        input: './src/index.js',
        output: { file: pkg.module, format: 'esm', exports: 'named' },
        external,
        plugins: [babel(getBabelOptions({ useESModules: true }))],
      }
    : null,
  pkg.main
    ? {
        input: './src/index.js',
        output: { file: pkg.main, format: 'cjs', exports: 'named' },
        external,
        plugins: [babel(getBabelOptions({ useESModules: false }))],
      }
    : null,
  pkg.unpkg
    ? {
        input: './src/index.js',
        output: {
          file: pkg.unpkg,
          format: 'umd',
          name: 'ReactIntersectionObserver',
          globals,
          exports: 'named',
        },
        external: Object.keys(globals),
        plugins: [
          resolve(),
          replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
          babel(getBabelOptions({ useESModules: true })),
          commonjs({ include: '**/node_modules/**' }),
          uglify(),
        ],
      }
    : null,
].filter(Boolean)
