import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'bin/fictcn': 'src/bin/fictcn.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    target: 'node18',
    outDir: 'dist',
    shims: false,
    minify: false,
  },
])
