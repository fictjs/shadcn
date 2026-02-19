import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const htmlViteFrameworkPath = path.dirname(require.resolve('@storybook/html-vite/package.json'))
const storybookDir = path.dirname(fileURLToPath(import.meta.url))
const generatedRuntimeSrcPath = path.resolve(storybookDir, '../stories/generated/runtime/src')

/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: htmlViteFrameworkPath,
    options: {},
  },
  docs: {
    autodocs: false,
  },
  async viteFinal(baseConfig) {
    const existingAlias = baseConfig.resolve?.alias ?? []
    const aliasArray = Array.isArray(existingAlias)
      ? existingAlias
      : Object.entries(existingAlias).map(([find, replacement]) => ({ find, replacement }))

    return {
      ...baseConfig,
      resolve: {
        ...(baseConfig.resolve ?? {}),
        alias: [...aliasArray, { find: '@', replacement: generatedRuntimeSrcPath }],
      },
      esbuild: {
        ...(baseConfig.esbuild ?? {}),
        jsx: 'automatic',
        jsxImportSource: 'fict',
      },
    }
  },
}

export default config
