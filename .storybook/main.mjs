/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/html-vite',
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
