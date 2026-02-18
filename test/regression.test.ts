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
})
