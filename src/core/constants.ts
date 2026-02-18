import type { FictcnConfig, FictcnLock } from './types'

export const CONFIG_FILE = 'fictcn.json'
export const LOCK_FILE = 'fictcn.lock.json'

export const DEFAULT_CONFIG: FictcnConfig = {
  $schema: 'https://fictjs.dev/schemas/fictcn.schema.json',
  version: 1,
  style: 'tailwind-css-vars',
  componentsDir: 'src/components/ui',
  libDir: 'src/lib',
  css: 'src/styles/globals.css',
  tailwindConfig: 'tailwind.config.ts',
  registry: 'builtin',
  aliases: {
    base: '@',
  },
}

export const DEFAULT_LOCK: FictcnLock = {
  $schema: 'https://fictjs.dev/schemas/fictcn-lock.schema.json',
  version: 1,
  registry: 'builtin',
  components: {},
  blocks: {},
  themes: {},
}

export const RUNTIME_DEPENDENCIES = ['@fictjs/ui-primitives', 'class-variance-authority', 'clsx', 'tailwind-merge']

export const DEV_DEPENDENCIES = ['autoprefixer', 'postcss', 'tailwindcss', 'tailwindcss-animate']
