import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { ensureConfigFile, loadConfig, loadLock, saveLock } from '../src/core/config'
import { DEFAULT_CONFIG, DEFAULT_LOCK } from '../src/core/constants'

describe('core config and io edges', () => {
  it('loads defaults when fictcn.json is missing', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-config-defaults-'))

    const loaded = await loadConfig(cwd)
    expect(loaded).toEqual(DEFAULT_CONFIG)
  })

  it('does not overwrite existing config in ensureConfigFile', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-config-ensure-'))
    const configPath = path.join(cwd, 'fictcn.json')
    const existing = `{
  // custom file should remain untouched
  "version": 1,
  "style": "tailwind-css-vars",
  "componentsDir": "src/components/ui",
  "libDir": "src/lib",
  "css": "src/styles/globals.css",
  "tailwindConfig": "tailwind.config.ts",
  "registry": "builtin",
  "aliases": { "base": "@" }
}
`
    await writeFile(configPath, existing, 'utf8')

    await ensureConfigFile(cwd, DEFAULT_CONFIG)
    expect(await readFile(configPath, 'utf8')).toBe(existing)
  })

  it('rejects non-object config payloads', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-config-non-object-'))
    await writeFile(path.join(cwd, 'fictcn.json'), '[1,2,3]\n', 'utf8')

    await expect(loadConfig(cwd)).rejects.toThrow('Expected an object at the top level.')
  })

  it('rejects invalid registry values in config', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-config-registry-invalid-'))
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
          registry: 'not-a-valid-registry-url',
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await expect(loadConfig(cwd)).rejects.toThrow('Field "registry" must be "builtin" or a valid http(s)/file URL.')
  })

  it('rejects unsupported registry URL protocols in config', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-config-registry-protocol-invalid-'))
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
          registry: 'ftp://example.com/registry.json',
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await expect(loadConfig(cwd)).rejects.toThrow('Field "registry" must be "builtin" or a valid http(s)/file URL.')
  })

  it('surfaces JSONC parse failures with actionable errors', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-config-jsonc-invalid-'))
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `{
  "version": 1,
  "style": "tailwind-css-vars",
  "componentsDir": "src/components/ui",,
}
`,
      'utf8',
    )

    await expect(loadConfig(cwd)).rejects.toThrow('Invalid JSONC file:')
  })

  it('returns default lock structure when lock file is missing', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-lock-defaults-'))

    const lock = await loadLock(cwd)
    expect(lock).toEqual({
      ...DEFAULT_LOCK,
      components: {},
      blocks: {},
      themes: {},
    })
  })

  it('persists lock entries with deterministic key ordering', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-lock-sort-'))
    await saveLock(cwd, {
      ...DEFAULT_LOCK,
      components: {
        zeta: {
          name: 'zeta',
          version: '1.0.0',
          source: 'builtin',
          installedAt: '2026-02-19T00:00:00.000Z',
          files: {},
        },
        alpha: {
          name: 'alpha',
          version: '1.0.0',
          source: 'builtin',
          installedAt: '2026-02-19T00:00:00.000Z',
          files: {},
        },
      },
      blocks: {
        zed: {
          name: 'zed',
          version: '1.0.0',
          source: 'builtin',
          installedAt: '2026-02-19T00:00:00.000Z',
          files: {},
        },
        beta: {
          name: 'beta',
          version: '1.0.0',
          source: 'builtin',
          installedAt: '2026-02-19T00:00:00.000Z',
          files: {},
        },
      },
      themes: {
        'theme-z': {
          name: 'theme-z',
          version: '1.0.0',
          source: 'builtin',
          installedAt: '2026-02-19T00:00:00.000Z',
          files: {},
        },
        'theme-a': {
          name: 'theme-a',
          version: '1.0.0',
          source: 'builtin',
          installedAt: '2026-02-19T00:00:00.000Z',
          files: {},
        },
      },
    })

    const lockRaw = await readFile(path.join(cwd, 'fictcn.lock.json'), 'utf8')
    const parsed = JSON.parse(lockRaw) as {
      components: Record<string, unknown>
      blocks: Record<string, unknown>
      themes: Record<string, unknown>
    }

    expect(Object.keys(parsed.components)).toEqual(['alpha', 'zeta'])
    expect(Object.keys(parsed.blocks)).toEqual(['beta', 'zed'])
    expect(Object.keys(parsed.themes)).toEqual(['theme-a', 'theme-z'])
  })
})
