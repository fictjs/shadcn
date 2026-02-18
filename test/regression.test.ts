import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runBlocksInstall } from '../src/commands/blocks'
import { runThemeApply } from '../src/commands/theme'

describe('regressions', () => {
  it('parses JSONC config and does not rewrite it during add/blocks/theme commands', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-regression-jsonc-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')

    const configPath = path.join(cwd, 'fictcn.json')
    const jsoncConfig = `{
  // keep comments and trailing commas
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
    await writeFile(configPath, jsoncConfig, 'utf8')

    await runAdd({ cwd, components: ['button'], skipInstall: true })
    expect(await readFile(configPath, 'utf8')).toBe(jsoncConfig)

    await runBlocksInstall({ cwd, blocks: ['auth/login-form'], skipInstall: true })
    expect(await readFile(configPath, 'utf8')).toBe(jsoncConfig)

    await runThemeApply({ cwd, themes: ['theme-slate'] })
    expect(await readFile(configPath, 'utf8')).toBe(jsoncConfig)
  })

  it('generates validated-form block without advanced runtime imports', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-regression-validated-form-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')

    await runBlocksInstall({ cwd, blocks: ['forms/validated-form'], skipInstall: true })

    const blockPath = path.join(cwd, 'src/components/blocks/forms/validated-form.tsx')
    const blockSource = await readFile(blockPath, 'utf8')

    expect(blockSource).not.toContain('@fictjs/runtime/advanced')
    expect(blockSource).not.toContain('createSignal(')
    expect(blockSource).toContain('data-form-message')
  })

  it('surfaces actionable config validation errors for malformed fictcn.json', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-regression-config-validation-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          version: 2,
          style: 'unknown-style',
          componentsDir: 123,
          aliases: {
            base: '',
            extra: '@/x',
          },
          unexpected: true,
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    let thrown: Error | undefined
    try {
      await runAdd({ cwd, components: ['button'], skipInstall: true })
    } catch (error) {
      thrown = error as Error
    }

    expect(thrown).toBeInstanceOf(Error)
    expect(thrown?.message).toContain('Invalid fictcn.json')
    expect(thrown?.message).toContain('Field "version" must be 1.')
    expect(thrown?.message).toContain('Field "style" must be "tailwind-css-vars".')
    expect(thrown?.message).toContain('Field "componentsDir" must be a string.')
    expect(thrown?.message).toContain('Unknown field "aliases.extra".')
    expect(thrown?.message).toContain('Field "aliases.base" cannot be empty.')
    expect(thrown?.message).toContain('Unknown field "unexpected".')
  })
})
