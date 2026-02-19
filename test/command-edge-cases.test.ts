import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runDiff } from '../src/commands/diff'
import { runInit } from '../src/commands/init'
import { runListFromRegistry } from '../src/commands/list'
import { runRemove } from '../src/commands/remove'
import { runSearch, runSearchFromRegistry } from '../src/commands/search'
import { runThemeApply } from '../src/commands/theme'
import { runUpdate } from '../src/commands/update'

describe('command edge cases', () => {
  it('returns an empty diff when no entries are installed', async () => {
    const cwd = await createWorkspace('fictcn-edge-diff-empty-')
    await runInit({ cwd, skipInstall: true })

    const result = await runDiff({ cwd })
    expect(result).toEqual({
      changed: [],
      patches: [],
    })
  })

  it('fails fast when diff is requested for an unknown entry', async () => {
    const cwd = await createWorkspace('fictcn-edge-diff-unknown-')
    await runInit({ cwd, skipInstall: true })

    await expect(runDiff({ cwd, components: ['does-not-exist'] })).rejects.toThrow(
      'Unknown registry entry: does-not-exist',
    )
  })

  it('reports update no-op when lock has no installed entries', async () => {
    const cwd = await createWorkspace('fictcn-edge-update-empty-')
    await runInit({ cwd, skipInstall: true })

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const result = await runUpdate({ cwd, skipInstall: true })
    const logs = logSpy.mock.calls.flat().join('\n')
    logSpy.mockRestore()

    expect(result).toEqual({
      updated: [],
      skipped: [],
    })
    expect(logs).toContain('No registry entries to update.')
  })

  it('rejects remove with an empty target list', async () => {
    await expect(runRemove({ entries: [] })).rejects.toThrow(
      'Please provide at least one installed registry entry name.',
    )
  })

  it('deduplicates remove targets and reports missing entries', async () => {
    const cwd = await createWorkspace('fictcn-edge-remove-dedupe-')
    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    const result = await runRemove({
      cwd,
      entries: ['button', 'button', 'not-installed'],
    })

    expect(result.removed).toEqual(['button'])
    expect(result.missing).toEqual(['not-installed'])
    expect(await fileExists(path.join(cwd, 'src/components/ui/button.tsx'))).toBe(false)
  })

  it('surfaces available themes when applying an unknown theme', async () => {
    const cwd = await createWorkspace('fictcn-edge-theme-unknown-')
    await runInit({ cwd, skipInstall: true })

    await expect(runThemeApply({ cwd, themes: ['theme-missing'] })).rejects.toThrow(
      'Unknown theme: theme-missing. Available themes:',
    )
  })

  it('skips conflicting themes unless overwrite is enabled', async () => {
    const cwd = await createWorkspace('fictcn-edge-theme-overwrite-')
    await runInit({ cwd, skipInstall: true })
    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const themePath = path.join(cwd, 'src/styles/themes/theme-slate.css')
    await writeFile(themePath, 'local theme edits\n', 'utf8')

    const skipped = await runThemeApply({ cwd, themes: ['theme-slate'] })
    expect(skipped.skipped).toContain('theme-slate')
    expect(await readFile(themePath, 'utf8')).toBe('local theme edits\n')

    const updated = await runThemeApply({ cwd, themes: ['theme-slate'], overwrite: true })
    expect(updated.updated).toContain('theme-slate')
    expect(await readFile(themePath, 'utf8')).toContain('.theme-slate')
  })

  it('returns empty search output for blank queries', async () => {
    expect(runSearch('   ')).toBe('')
    await expect(
      runSearchFromRegistry('   ', {
        registry: 'http://127.0.0.1:1/registry',
      }),
    ).resolves.toBe('')
  })

  it('filters remote list output by blocks', async () => {
    const registryRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-edge-registry-filter-'))
    const registryPath = path.join(registryRoot, 'registry.json')
    await writeFile(
      registryPath,
      `${JSON.stringify(
        {
          entries: [
            { name: 'alpha-button', type: 'ui-component', description: 'component' },
            { name: 'beta-block', type: 'block', description: 'block' },
            { name: 'gamma-theme', type: 'theme', description: 'theme' },
          ],
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const output = await runListFromRegistry({
      registry: `file://${registryPath}`,
      type: 'blocks',
    })
    expect(output).toContain('beta-block')
    expect(output).not.toContain('alpha-button')
    expect(output).not.toContain('gamma-theme')
  })
})

async function createWorkspace(prefix: string): Promise<string> {
  const cwd = await mkdtemp(path.join(tmpdir(), prefix))
  await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
  await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
  return cwd
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}
