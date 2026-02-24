import { chmod, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { runInit } from '../src/commands/init'
import { CONFIG_FILE } from '../src/core/constants'

describe('runInit', () => {
  const ORIGINAL_PATH = process.env.PATH ?? ''
  const unixOnlyIt = process.platform === 'win32' ? it.skip : it
  it('writes baseline config and utility files', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })

    const config = await readFile(path.join(cwd, CONFIG_FILE), 'utf8')
    const cnFile = await readFile(path.join(cwd, 'src/lib/cn.ts'), 'utf8')
    const globals = await readFile(path.join(cwd, 'src/styles/globals.css'), 'utf8')
    const postcss = await readFile(path.join(cwd, 'postcss.config.mjs'), 'utf8')
    const tsconfig = await readFile(path.join(cwd, 'tsconfig.json'), 'utf8')

    expect(config).toContain('"style": "tailwind-css-vars"')
    expect(cnFile).toContain('twMerge')
    expect(globals).toContain('@fictcn tokens:start')
    expect(postcss).toContain("'@tailwindcss/postcss'")
    expect(postcss).not.toContain('tailwindcss: {}')
    expect(tsconfig).toContain('"@/*"')
  })

  it('preserves existing config values on re-init', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-existing-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, CONFIG_FILE),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'custom/ui',
          libDir: 'custom/lib',
          css: 'custom/styles.css',
          tailwindConfig: 'tailwind.custom.ts',
          registry: 'builtin',
          aliases: {
            base: '~',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const config = await readFile(path.join(cwd, CONFIG_FILE), 'utf8')
    const cnFile = await readFile(path.join(cwd, 'custom/lib/cn.ts'), 'utf8')
    const globals = await readFile(path.join(cwd, 'custom/styles.css'), 'utf8')
    const tailwindConfig = await readFile(path.join(cwd, 'tailwind.custom.ts'), 'utf8')
    const tsconfig = await readFile(path.join(cwd, 'tsconfig.json'), 'utf8')

    expect(config).toContain('"componentsDir": "custom/ui"')
    expect(config).toContain('"aliases": {\n    "base": "~"\n  }')
    expect(cnFile).toContain('twMerge')
    expect(globals).toContain('@fictcn tokens:start')
    expect(tailwindConfig).toContain('tailwindcss-animate')
    expect(tailwindConfig).not.toContain("'./src/**/*.{ts,tsx}'")
    expect(tailwindConfig).toContain("'./custom/ui/**/*.{ts,tsx}'")
    expect(tailwindConfig).toContain("'./custom/blocks/**/*.{ts,tsx}'")
    expect(tailwindConfig).toContain("'./custom/lib/**/*.{ts,tsx}'")
    expect(tsconfig).toContain('"~/*"')
    expect(tsconfig).toContain('"*"')
  })

  it('does not rewrite existing JSONC config files during init', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-config-jsonc-preserve-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    const configPath = path.join(cwd, CONFIG_FILE)
    const configWithComments = `{
  // keep this comment
  "$schema": "https://fict.js.org/schemas/fictcn.schema.json",
  "version": 1,
  "style": "tailwind-css-vars",
  "componentsDir": "src/components/ui",
  "libDir": "src/lib",
  "css": "src/styles/globals.css",
  "tailwindConfig": "tailwind.config.ts",
  "registry": "builtin",
  "aliases": {
    "base": "@",
  },
}
`
    await writeFile(configPath, configWithComments, 'utf8')

    await runInit({ cwd, skipInstall: true })

    expect(await readFile(configPath, 'utf8')).toBe(configWithComments)
  })

  it('does not overwrite existing scaffold files without force', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-no-force-overwrite-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await mkdir(path.join(cwd, 'src/lib'), { recursive: true })
    await writeFile(path.join(cwd, 'src/styles/globals.css'), '/* keep me */\n', 'utf8')
    await writeFile(path.join(cwd, 'src/lib/cn.ts'), 'export const keepCn = true\n', 'utf8')
    await writeFile(path.join(cwd, 'src/lib/variants.ts'), 'export const keepVariants = true\n', 'utf8')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await runInit({ cwd, skipInstall: true })
    const logs = logSpy.mock.calls.flat().join('\n')
    logSpy.mockRestore()

    expect(await readFile(path.join(cwd, 'src/styles/globals.css'), 'utf8')).toBe('/* keep me */\n')
    expect(await readFile(path.join(cwd, 'src/lib/cn.ts'), 'utf8')).toBe('export const keepCn = true\n')
    expect(await readFile(path.join(cwd, 'src/lib/variants.ts'), 'utf8')).toBe('export const keepVariants = true\n')
    expect(logs).toContain('rerun with --force to overwrite')
  })

  it('overwrites existing scaffold files when force is enabled', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-force-overwrite-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await mkdir(path.join(cwd, 'src/lib'), { recursive: true })
    await writeFile(path.join(cwd, 'src/styles/globals.css'), '/* keep me */\n', 'utf8')
    await writeFile(path.join(cwd, 'src/lib/cn.ts'), 'export const keepCn = true\n', 'utf8')
    await writeFile(path.join(cwd, 'src/lib/variants.ts'), 'export const keepVariants = true\n', 'utf8')

    await runInit({ cwd, skipInstall: true, force: true })

    expect(await readFile(path.join(cwd, 'src/styles/globals.css'), 'utf8')).toContain('@fictcn tokens:start')
    expect(await readFile(path.join(cwd, 'src/lib/cn.ts'), 'utf8')).toContain('twMerge')
    expect(await readFile(path.join(cwd, 'src/lib/variants.ts'), 'utf8')).toContain('cva')
  })

  it('patches tsconfig JSONC with comments and trailing commas', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-jsonc-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'tsconfig.json'),
      `{
  // generated by tsc --init
  "compilerOptions": {
    "target": "ES2022",
  },
}
`,
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const tsconfig = await readFile(path.join(cwd, 'tsconfig.json'), 'utf8')
    expect(tsconfig).toContain('"@/*"')
    expect(tsconfig).toContain('"src/*"')
  })

  it('patches CommonJS tailwind config without injecting ESM syntax', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-tailwind-cjs-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, CONFIG_FILE),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.cjs',
          registry: 'builtin',
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.cjs'),
      "module.exports = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] }\n",
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const tailwindConfig = await readFile(path.join(cwd, 'tailwind.config.cjs'), 'utf8')
    expect(tailwindConfig).toContain('module.exports')
    expect(tailwindConfig).toContain("require('tailwindcss-animate')")
    expect(tailwindConfig).not.toContain("import animate from 'tailwindcss-animate'")
    expect(tailwindConfig).toContain("'./src/components/ui/**/*.{ts,tsx}'")
  })

  it('creates CommonJS tailwind config for .js when package type is commonjs', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-tailwind-js-cjs-'))
    await writeFile(
      path.join(cwd, 'package.json'),
      '{"name":"sandbox","type":"commonjs"}\n',
      'utf8',
    )
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, CONFIG_FILE),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.js',
          registry: 'builtin',
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const tailwindConfig = await readFile(path.join(cwd, 'tailwind.config.js'), 'utf8')
    expect(tailwindConfig).toContain('module.exports = config')
    expect(tailwindConfig).toContain("require('tailwindcss-animate')")
    expect(tailwindConfig).not.toContain("import animate from 'tailwindcss-animate'")
  })

  it('creates fallback tsconfig when tsconfig.json is missing', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-no-tsconfig-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })

    const tsconfig = await readFile(path.join(cwd, 'tsconfig.json'), 'utf8')
    expect(tsconfig).toContain('"baseUrl": "."')
    expect(tsconfig).toContain('"@/*"')
    expect(tsconfig).toContain('"src/*"')
  })

  it('warns when tsconfig cannot be patched automatically', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-tsconfig-warn-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{ invalid json }\n', 'utf8')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await runInit({ cwd, skipInstall: true })
    const logs = logSpy.mock.calls.flat().join('\n')
    logSpy.mockRestore()

    expect(logs).toContain('Warning: could not patch tsconfig.json automatically.')
  })

  it('falls back to CJS tailwind format for unknown extension when package.json is unreadable', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-tailwind-unknown-ext-'))
    await writeFile(path.join(cwd, 'package.json'), '{\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, CONFIG_FILE),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.custom',
          registry: 'builtin',
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const tailwindConfig = await readFile(path.join(cwd, 'tailwind.custom'), 'utf8')
    expect(tailwindConfig).toContain('module.exports = config')
    expect(tailwindConfig).toContain("require('tailwindcss-animate')")
    expect(tailwindConfig).not.toContain("import animate from 'tailwindcss-animate'")
  })

  it('infers ESM patching when existing tailwind config has no explicit module syntax', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-tailwind-format-fallback-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox","type":"module"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, CONFIG_FILE),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
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
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "const config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] }\n",
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const tailwindConfig = await readFile(path.join(cwd, 'tailwind.config.ts'), 'utf8')
    expect(tailwindConfig).toContain("import animate from 'tailwindcss-animate'")
    expect(tailwindConfig).toContain('plugins: [animate]')
  })

  it('keeps existing postcss config files unchanged', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-existing-postcss-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(path.join(cwd, 'postcss.config.js'), 'module.exports = { plugins: {} }\n', 'utf8')

    await runInit({ cwd, skipInstall: true })

    await expect(readFile(path.join(cwd, 'postcss.config.mjs'), 'utf8')).rejects.toThrow()
    expect(await readFile(path.join(cwd, 'postcss.config.js'), 'utf8')).toBe(
      'module.exports = { plugins: {} }\n',
    )
  })

  it('detects existing ESM tailwind config format from content', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-tailwind-existing-esm-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox","type":"module"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "export default { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] }\n",
      'utf8',
    )

    await runInit({ cwd, skipInstall: true })

    const tailwindConfig = await readFile(path.join(cwd, 'tailwind.config.ts'), 'utf8')
    expect(tailwindConfig).toContain("import animate from 'tailwindcss-animate'")
    expect(tailwindConfig).toContain('plugins: [animate]')
  })

  unixOnlyIt('installs runtime and dev dependencies when skipInstall is false', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-install-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'package-lock.json'), '{}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    const argsPath = path.join(cwd, 'npm.args')
    const fakeBinDir = await createFakePackageManagerBinary('npm', argsPath, 0)
    process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`

    try {
      await runInit({ cwd })
      const calls = (await readFile(argsPath, 'utf8'))
        .trim()
        .split('\n')
        .filter(Boolean)

      expect(calls.length).toBe(2)
      expect(calls[0]).toContain('install --save')
      expect(calls[1]).toContain('install --save-dev')
    } finally {
      process.env.PATH = ORIGINAL_PATH
    }
  })
})

async function createFakePackageManagerBinary(
  command: 'npm',
  argsOutputPath: string,
  exitCode: number,
): Promise<string> {
  const binDir = await mkdtemp(path.join(tmpdir(), `fictcn-fake-${command}-`))
  const binPath = path.join(binDir, command)
  const script = `#!/usr/bin/env bash
set -eu
printf '%s\\n' "$*" >> ${JSON.stringify(argsOutputPath)}
exit ${exitCode}
`

  await writeFile(binPath, script, 'utf8')
  await chmod(binPath, 0o755)
  return binDir
}
