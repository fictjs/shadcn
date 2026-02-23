import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { DEV_DEPENDENCIES, RUNTIME_DEPENDENCIES } from '../src/core/constants'
import { runDoctor } from '../src/commands/doctor'

describe('runDoctor edge coverage', () => {
  it('returns ok=true and prints success message for healthy setup', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-healthy-'))
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(
      path.join(cwd, 'package.json'),
      `${JSON.stringify(
        {
          name: 'sandbox',
          dependencies: Object.fromEntries(RUNTIME_DEPENDENCIES.map(name => [name, '1.0.0'])),
          devDependencies: Object.fromEntries(DEV_DEPENDENCIES.map(name => [name, '1.0.0'])),
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'fictcn.json'),
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
      path.join(cwd, 'tsconfig.json'),
      '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["src/*"]}}}\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'src/styles/globals.css'),
      '@tailwind base;\n/* @fictcn tokens:start */\n:root {}\n/* @fictcn tokens:end */\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "import animate from 'tailwindcss-animate'\nexport default { content: ['./src/components/ui/**/*.{ts,tsx}','./src/components/blocks/**/*.{ts,tsx}','./src/lib/**/*.{ts,tsx}'], plugins: [animate] }\n",
      'utf8',
    )

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const result = await runDoctor(cwd)
    const logs = logSpy.mock.calls.flat().join('\n')
    logSpy.mockRestore()

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
    expect(logs).toContain('Doctor check passed.')
  })

  it('reports missing tsconfig, globals css, and tailwind config', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-missing-files-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
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

    const result = await runDoctor(cwd)

    expect(result.issues.some(issue => issue.code === 'missing-tsconfig')).toBe(true)
    expect(result.issues.some(issue => issue.code === 'missing-globals-css')).toBe(true)
    expect(result.issues.some(issue => issue.code === 'missing-tailwind-config')).toBe(true)
  })

  it('reports missing-config when fictcn.json is absent', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-missing-config-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')

    const result = await runDoctor(cwd)
    expect(result.issues.some(issue => issue.code === 'missing-config')).toBe(true)
  })

  it('reports tsconfig parse warning for invalid JSONC payloads', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-tsconfig-invalid-'))
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
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
    await writeFile(path.join(cwd, 'tsconfig.json'), '{ invalid json }\n', 'utf8')
    await writeFile(
      path.join(cwd, 'src/styles/globals.css'),
      '@tailwind base;\n/* @fictcn tokens:start */\n:root {}\n/* @fictcn tokens:end */\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "import animate from 'tailwindcss-animate'\nexport default { content: ['./src/components/ui/**/*.{ts,tsx}','./src/components/blocks/**/*.{ts,tsx}','./src/lib/**/*.{ts,tsx}'], plugins: [animate] }\n",
      'utf8',
    )

    const result = await runDoctor(cwd)
    expect(result.issues.some(issue => issue.code === 'tsconfig-parse')).toBe(true)
  })

  it('reports package-json-parse warning for invalid package.json payloads', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-package-json-invalid-'))
    await writeFile(path.join(cwd, 'package.json'), '{ invalid json }\n', 'utf8')

    const result = await runDoctor(cwd)
    expect(result.issues.some(issue => issue.code === 'package-json-parse' && issue.level === 'warning')).toBe(true)
  })

  it('reports alias-paths when tsconfig paths are present but missing the expected alias', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-alias-missing-'))
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
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
      path.join(cwd, 'tsconfig.json'),
      '{"compilerOptions":{"baseUrl":".","paths":{"~/*":["src/*"]}}}\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'src/styles/globals.css'),
      '@tailwind base;\n/* @fictcn tokens:start */\n:root {}\n/* @fictcn tokens:end */\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "import animate from 'tailwindcss-animate'\nexport default { content: ['./src/components/ui/**/*.{ts,tsx}','./src/components/blocks/**/*.{ts,tsx}','./src/lib/**/*.{ts,tsx}'], plugins: [animate] }\n",
      'utf8',
    )

    const result = await runDoctor(cwd)
    expect(result.issues.some(issue => issue.code === 'alias-paths')).toBe(true)
  })

  it('flags missing tailwind animate plugin and missing token block', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-missing-plugin-'))
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
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
      path.join(cwd, 'tsconfig.json'),
      '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["src/*"]}}}\n',
      'utf8',
    )
    await writeFile(path.join(cwd, 'src/styles/globals.css'), '@tailwind base;\n', 'utf8')
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "export default { content: ['./src/components/ui/**/*.{ts,tsx}','./src/components/blocks/**/*.{ts,tsx}','./src/lib/**/*.{ts,tsx}'], plugins: [] }\n",
      'utf8',
    )

    const result = await runDoctor(cwd)

    expect(result.issues.some(issue => issue.code === 'missing-css-tokens')).toBe(true)
    expect(result.issues.some(issue => issue.code === 'tailwind-plugin')).toBe(true)
  })
})
