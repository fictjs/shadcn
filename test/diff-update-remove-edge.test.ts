import { chmod, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runBlocksInstall } from '../src/commands/blocks'
import { runDiff } from '../src/commands/diff'
import { runInit } from '../src/commands/init'
import { runRemove } from '../src/commands/remove'
import { runThemeApply } from '../src/commands/theme'
import { runUpdate } from '../src/commands/update'
import { LOCK_FILE } from '../src/core/constants'

describe('diff/update/remove edge behavior', () => {
  const ORIGINAL_PATH = process.env.PATH ?? ''

  it('throws unknown theme errors when lock contains stale theme entries', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-diff-update-theme-stale-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const lockPath = path.join(cwd, LOCK_FILE)
    const lock = JSON.parse(await readFile(lockPath, 'utf8')) as {
      themes: Record<string, unknown>
    }
    lock.themes['theme-does-not-exist'] = lock.themes['theme-slate']
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8')

    await expect(runDiff({ cwd })).rejects.toThrow('Unknown registry theme: theme-does-not-exist')
    await expect(runUpdate({ cwd, skipInstall: true })).rejects.toThrow(
      'Unknown registry theme: theme-does-not-exist',
    )
  })

  it('throws unknown entry errors when requesting an invalid diff/update target', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-diff-update-unknown-entry-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await runInit({ cwd, skipInstall: true })

    await expect(runDiff({ cwd, components: ['entry-missing'] })).rejects.toThrow(
      'Unknown registry entry: entry-missing',
    )
    await expect(runUpdate({ cwd, components: ['entry-missing'], skipInstall: true })).rejects.toThrow(
      'Unknown registry entry: entry-missing',
    )
  })

  it('removes files even with local edits when force is enabled', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remove-force-edits-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    const buttonPath = path.join(cwd, 'src/components/ui/button.tsx')
    await writeFile(buttonPath, 'edited locally\n', 'utf8')

    const result = await runRemove({
      cwd,
      entries: ['button'],
      force: true,
    })
    expect(result.removed).toContain('button')
    expect(await fileExists(buttonPath)).toBe(false)
  })

  it('allows removal when tracked files are already missing and globals.css is absent', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remove-missing-files-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await runInit({ cwd, skipInstall: true })
    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const themeFile = path.join(cwd, 'src/styles/themes/theme-slate.css')
    const globalsFile = path.join(cwd, 'src/styles/globals.css')
    await stat(themeFile)
    await writeFile(globalsFile, '', 'utf8')
    await runRemove({ cwd, entries: ['theme-slate'], force: true })

    await runThemeApply({ cwd, themes: ['theme-slate'] })
    await rm(themeFile, { force: true })
    await rm(globalsFile, { force: true })
    await runRemove({ cwd, entries: ['theme-slate'] })

    expect(await fileExists(themeFile)).toBe(false)
  })

  it('uses lock fallback names for block diffs when no entry list is provided', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-diff-block-fallback-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await runInit({ cwd, skipInstall: true })
    await runBlocksInstall({ cwd, blocks: ['auth/login-form'], skipInstall: true })

    const blockPath = path.join(cwd, 'src/components/blocks/auth/login-form.tsx')
    await writeFile(blockPath, 'local edits\n', 'utf8')

    const diff = await runDiff({ cwd })
    expect(diff.changed).toContain('auth/login-form')
  })

  it('installs dependencies during update when skipInstall=false', async () => {
    const registryRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-update-deps-registry-'))
    const registryPath = path.join(registryRoot, 'index.json')
    await writeFile(
      registryPath,
      `${JSON.stringify(
        [
          {
            name: 'remote-update-card',
            type: 'ui-component',
            version: '1.0.0',
            dependencies: ['zod', '@tanstack/react-query'],
            registryDependencies: [],
            files: [
              {
                path: '{{componentsDir}}/remote-update-card.tsx',
                content: 'export function RemoteUpdateCard() {\\n  return <div>card</div>\\n}\\n',
              },
            ],
          },
        ],
        null,
        2,
      )}\n`,
      'utf8',
    )

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-update-deps-project-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'package-lock.json'), '{}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
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
          registry: pathToFileURL(registryPath).toString(),
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    await runAdd({
      cwd,
      components: ['remote-update-card'],
      skipInstall: true,
    })

    const argsPath = path.join(cwd, 'npm.args')
    const fakeBinDir = await createFakePackageManagerBinary('npm', argsPath, 0)
    process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`
    try {
      const result = await runUpdate({ cwd, components: ['remote-update-card'] })
      expect(result.updated).toContain('remote-update-card')
      expect(await readFile(argsPath, 'utf8')).toBe('install --save @tanstack/react-query zod')
    } finally {
      process.env.PATH = ORIGINAL_PATH
    }
  })
})

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

async function createFakePackageManagerBinary(
  command: 'npm',
  argsOutputPath: string,
  exitCode: number,
): Promise<string> {
  const binDir = await mkdtemp(path.join(tmpdir(), `fictcn-fake-${command}-`))
  const binPath = path.join(binDir, command)
  const script = `#!/usr/bin/env bash
set -eu
printf '%s' "$*" > ${JSON.stringify(argsOutputPath)}
exit ${exitCode}
`

  await writeFile(binPath, script, 'utf8')
  await chmod(binPath, 0o755)
  return binDir
}
