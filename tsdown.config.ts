import { defineConfig } from 'tsdown/config'
import treeShakeable from 'rollup-plugin-tree-shakeable'
import terser from '@rollup/plugin-terser'

export default defineConfig([
  {
    entry: `src/index.js`,
    platform: `neutral`,
    sourcemap: `inline`,
    dts: false,
    publint: true,
    plugins: [
      terser({
        mangle: {
          properties: {
            regex: `^_[^_]+`,
          },
        },
      }),
      treeShakeable(),
    ],
  },
  {
    entry: `src/index.d.ts`,
    dts: { emitDtsOnly: true },
  },
])
