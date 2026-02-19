import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const htmlViteFrameworkPath = path.dirname(require.resolve('@storybook/html-vite/package.json'))

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
    return {
      ...baseConfig,
      esbuild: {
        ...(baseConfig.esbuild ?? {}),
        jsx: 'automatic',
        jsxImportSource: 'fict',
      },
    }
  },
}

export default config
