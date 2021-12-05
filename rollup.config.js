import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import path from 'path'

const name = require('./package.json').main.replace(/\.js$/, '')

const bundle = config => ({
  ...config,
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    input: 'src/index.tsx',
    plugins: [
      esbuild(),
      getBabelOutputPlugin({
        configFile: path.resolve(__dirname, 'babel.config.js'),
      }),
    ],
    output: [
      {
        file: `dist/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/index.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    input: 'src/server.tsx',
    plugins: [
      esbuild(),
      getBabelOutputPlugin({
        configFile: path.resolve(__dirname, 'babel.config.js'),
      }),
    ],
    output: [
      {
        file: `dist/server.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/server.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    input: 'src/index.tsx',
    plugins: [dts()],
    output: {
      file: `dist/index.d.ts`,
      format: 'es',
    },
  }),
  bundle({
    input: 'src/server.tsx',
    plugins: [dts()],
    output: {
      file: `dist/server.d.ts`,
      format: 'es',
    },
  }),
]
