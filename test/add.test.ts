import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runInit } from '../src/commands/init'
import { LOCK_FILE } from '../src/core/constants'

describe('runAdd', () => {
  it('resolves registry dependencies and writes lock entries', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-add-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    const result = await runAdd({ cwd, components: ['dialog'], skipInstall: true })

    const dialog = await readFile(path.join(cwd, 'src/components/ui/dialog.tsx'), 'utf8')
    const button = await readFile(path.join(cwd, 'src/components/ui/button.tsx'), 'utf8')
    const lockRaw = await readFile(path.join(cwd, LOCK_FILE), 'utf8')

    expect(dialog).toContain('export const Dialog = DialogRoot')
    expect(button).toContain('buttonVariants')
    expect(result.added).toContain('dialog')
    expect(result.added).toContain('button')
    expect(lockRaw).toContain('"dialog"')
    expect(lockRaw).toContain('"button"')
  })

  it('skips conflicting component files without overwrite', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-add-conflict-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    await writeFile(path.join(cwd, 'src/components/ui/button.tsx'), 'user custom content\n', 'utf8')

    const result = await runAdd({ cwd, components: ['button'], skipInstall: true })

    expect(result.skipped).toContain('button')
  })

  it('fails fast when configured registry is unsupported', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-add-registry-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    const configPath = path.join(cwd, 'fictcn.json')
    const configRaw = await readFile(configPath, 'utf8')
    const config = JSON.parse(configRaw) as Record<string, unknown>
    config.registry = 'https://example.com/registry.json'
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

    await expect(runAdd({ cwd, components: ['button'], skipInstall: true })).rejects.toThrow(
      'Unsupported registry',
    )
  })
})
