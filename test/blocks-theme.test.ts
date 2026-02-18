import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
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

    const loginBlock = await readFile(path.join(cwd, 'src/components/blocks/auth/login-form.tsx'), 'utf8')
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
})
