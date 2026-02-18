import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { runBlocksInstall } from '../src/commands/blocks'
import { runInit } from '../src/commands/init'
import { runThemeApply } from '../src/commands/theme'
import { LOCK_FILE } from '../src/core/constants'

describe('blocks and themes', () => {
  it('installs block files with dependent ui components and applies themes', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-blocks-theme-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runBlocksInstall({ cwd, blocks: ['auth/login-form'], skipInstall: true })

    const loginBlock = await readFile(
      path.join(cwd, 'src/components/blocks/auth/login-form.tsx'),
      'utf8',
    )
    const buttonComponent = await readFile(path.join(cwd, 'src/components/ui/button.tsx'), 'utf8')

    expect(loginBlock).toContain('export function LoginForm')
    expect(buttonComponent).toContain('buttonVariants')

    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const themeCss = await readFile(path.join(cwd, 'src/styles/themes/theme-slate.css'), 'utf8')
    const globalsCss = await readFile(path.join(cwd, 'src/styles/globals.css'), 'utf8')
    const lock = await readFile(path.join(cwd, LOCK_FILE), 'utf8')

    expect(themeCss).toContain('.theme-slate')
    expect(globalsCss).toContain('@import "./themes/theme-slate.css";')
    expect(lock).toContain('"auth/login-form"')
    expect(lock).toContain('"theme-slate"')
  })

  it('installs blocks and themes under custom configured directories', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-blocks-theme-custom-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
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
    await mkdir(path.join(cwd, 'custom'), { recursive: true })

    await runInit({ cwd, skipInstall: true })
    await runBlocksInstall({ cwd, blocks: ['auth/login-form'], skipInstall: true })
    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const loginBlock = await readFile(path.join(cwd, 'custom/blocks/auth/login-form.tsx'), 'utf8')
    const buttonComponent = await readFile(path.join(cwd, 'custom/ui/button.tsx'), 'utf8')
    const themeCss = await readFile(path.join(cwd, 'custom/themes/theme-slate.css'), 'utf8')
    const globalsCss = await readFile(path.join(cwd, 'custom/styles.css'), 'utf8')

    expect(loginBlock).toContain("from '~/custom/ui/button'")
    expect(buttonComponent).toContain("from '~/custom/lib/cn'")
    expect(themeCss).toContain('.theme-slate')
    expect(globalsCss).toContain('@import "./themes/theme-slate.css";')
  })
})
