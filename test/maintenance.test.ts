import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runBlocksInstall } from '../src/commands/blocks'
import { runDiff } from '../src/commands/diff'
import { runDoctor } from '../src/commands/doctor'
import { runInit } from '../src/commands/init'
import { runList } from '../src/commands/list'
import { runRemove } from '../src/commands/remove'
import { runSearch } from '../src/commands/search'
import { runThemeApply } from '../src/commands/theme'
import { runUpdate } from '../src/commands/update'
import { LOCK_FILE } from '../src/core/constants'

describe('maintenance commands', () => {
  it('supports dry-run across mutation commands without writing files', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-dry-run-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true, dryRun: true })
    expect(await fileExists(path.join(cwd, 'fictcn.json'))).toBe(false)
    expect(await fileExists(path.join(cwd, 'src/styles/globals.css'))).toBe(false)

    await runInit({ cwd, skipInstall: true })

    await runAdd({ cwd, components: ['button'], skipInstall: true, dryRun: true })
    expect(await fileExists(path.join(cwd, 'src/components/ui/button.tsx'))).toBe(false)
    expect(await fileExists(path.join(cwd, LOCK_FILE))).toBe(false)

    await runBlocksInstall({ cwd, blocks: ['auth/login-form'], skipInstall: true, dryRun: true })
    expect(await fileExists(path.join(cwd, 'src/components/blocks/auth/login-form.tsx'))).toBe(false)

    const globalsCssPath = path.join(cwd, 'src/styles/globals.css')
    const globalsBefore = await readFile(globalsCssPath, 'utf8')
    await runThemeApply({ cwd, themes: ['theme-slate'], dryRun: true })
    expect(await fileExists(path.join(cwd, 'src/styles/themes/theme-slate.css'))).toBe(false)
    expect(await readFile(globalsCssPath, 'utf8')).toBe(globalsBefore)

    await runAdd({ cwd, components: ['button'], skipInstall: true })
    const lockPath = path.join(cwd, LOCK_FILE)
    const lockBefore = JSON.parse(await readFile(lockPath, 'utf8')) as {
      components: {
        button: {
          installedAt: string
        }
      }
    }
    const installedAtBefore = lockBefore.components.button.installedAt

    await runUpdate({ cwd, components: ['button'], force: true, skipInstall: true, dryRun: true })

    const lockAfter = JSON.parse(await readFile(lockPath, 'utf8')) as {
      components: {
        button: {
          installedAt: string
        }
      }
    }
    expect(lockAfter.components.button.installedAt).toBe(installedAtBefore)
  })

  it('produces diff and supports guarded update flow', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    const filePath = path.join(cwd, 'src/components/ui/button.tsx')
    await writeFile(filePath, 'local edits\n', 'utf8')

    const diff = await runDiff({ cwd, components: ['button'] })
    expect(diff.changed).toContain('button')
    expect(diff.patches.join('\n')).toContain('registry/button@0.1.0')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const guardedUpdate = await runUpdate({ cwd, components: ['button'], skipInstall: true })
    const guardedLogs = logSpy.mock.calls.flat().join('\n')
    logSpy.mockRestore()

    expect(guardedUpdate.skipped).toContain('button')
    expect(guardedLogs).toContain('local changes detected in src/components/ui/button.tsx')
    expect(guardedLogs).toContain('fictcn diff button')

    const forcedUpdate = await runUpdate({
      cwd,
      components: ['button'],
      force: true,
      skipInstall: true,
    })
    expect(forcedUpdate.updated).toContain('button')

    const refreshed = await readFile(filePath, 'utf8')
    expect(refreshed).toContain('buttonVariants')
  })

  it('removes installed entries and cleans lock + theme imports', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-remove-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })
    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const buttonPath = path.join(cwd, 'src/components/ui/button.tsx')
    const themePath = path.join(cwd, 'src/styles/themes/theme-slate.css')
    const globalsPath = path.join(cwd, 'src/styles/globals.css')
    expect(await fileExists(buttonPath)).toBe(true)
    expect(await fileExists(themePath)).toBe(true)

    const removeResult = await runRemove({ cwd, entries: ['button', 'theme-slate'] })
    expect(removeResult.removed).toContain('button')
    expect(removeResult.removed).toContain('theme-slate')

    expect(await fileExists(buttonPath)).toBe(false)
    expect(await fileExists(themePath)).toBe(false)
    const globals = await readFile(globalsPath, 'utf8')
    expect(globals).not.toContain('@import "./themes/theme-slate.css";')

    const lock = JSON.parse(await readFile(path.join(cwd, LOCK_FILE), 'utf8')) as {
      components?: Record<string, unknown>
      themes?: Record<string, unknown>
    }
    expect(lock.components?.button).toBeUndefined()
    expect(lock.themes?.['theme-slate']).toBeUndefined()
  })

  it('guards remove for local edits and supports dry-run previews', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-remove-guarded-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    const buttonPath = path.join(cwd, 'src/components/ui/button.tsx')
    await writeFile(buttonPath, 'local edits\n', 'utf8')

    const guarded = await runRemove({ cwd, entries: ['button'] })
    expect(guarded.skipped).toContain('button')
    expect(await fileExists(buttonPath)).toBe(true)

    const cleanCwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-remove-dry-'))
    await writeFile(path.join(cleanCwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cleanCwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await runInit({ cwd: cleanCwd, skipInstall: true })
    await runAdd({ cwd: cleanCwd, components: ['button'], skipInstall: true })

    const cleanButtonPath = path.join(cleanCwd, 'src/components/ui/button.tsx')
    const cleanLockPath = path.join(cleanCwd, LOCK_FILE)
    const lockBefore = await readFile(cleanLockPath, 'utf8')

    const preview = await runRemove({ cwd: cleanCwd, entries: ['button'], dryRun: true })
    expect(preview.removed).toContain('button')
    expect(await fileExists(cleanButtonPath)).toBe(true)
    expect(await readFile(cleanLockPath, 'utf8')).toBe(lockBefore)
  })

  it('reports stale lock metadata when guarded update cannot verify local edits', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-stale-lock-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    const filePath = path.join(cwd, 'src/components/ui/button.tsx')
    await writeFile(filePath, 'local edits\n', 'utf8')

    const lockPath = path.join(cwd, LOCK_FILE)
    const lock = JSON.parse(await readFile(lockPath, 'utf8')) as {
      components: {
        button?: {
          files?: Record<string, string>
        }
      }
    }

    if (lock.components.button?.files) {
      delete lock.components.button.files['src/components/ui/button.tsx']
    }
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const guardedUpdate = await runUpdate({ cwd, components: ['button'], skipInstall: true })
    const guardedLogs = logSpy.mock.calls.flat().join('\n')
    logSpy.mockRestore()

    expect(guardedUpdate.skipped).toContain('button')
    expect(guardedLogs).toContain('lock metadata is missing for this file')
    expect(guardedLogs).toContain('fictcn diff button')
  })

  it('produces diff and update flow for blocks and themes', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-maintenance-blocks-themes-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runBlocksInstall({ cwd, blocks: ['auth/login-form'], skipInstall: true })
    await runThemeApply({ cwd, themes: ['theme-slate'] })

    const blockPath = path.join(cwd, 'src/components/blocks/auth/login-form.tsx')
    const themePath = path.join(cwd, 'src/styles/themes/theme-slate.css')
    await writeFile(blockPath, 'block edits\n', 'utf8')
    await writeFile(themePath, 'theme edits\n', 'utf8')

    const diff = await runDiff({ cwd })
    expect(diff.changed).toContain('auth/login-form')
    expect(diff.changed).toContain('theme-slate')
    expect(diff.patches.join('\n')).toContain('registry/block/auth/login-form@0.1.0')
    expect(diff.patches.join('\n')).toContain('registry/theme/theme-slate@0.1.0')

    const guardedUpdate = await runUpdate({ cwd, skipInstall: true })
    expect(guardedUpdate.skipped).toContain('auth/login-form')
    expect(guardedUpdate.skipped).toContain('theme-slate')

    const forcedUpdate = await runUpdate({ cwd, force: true, skipInstall: true })
    expect(forcedUpdate.updated).toContain('auth/login-form')
    expect(forcedUpdate.updated).toContain('theme-slate')

    const refreshedBlock = await readFile(blockPath, 'utf8')
    const refreshedTheme = await readFile(themePath, 'utf8')
    expect(refreshedBlock).toContain('export function LoginForm')
    expect(refreshedTheme).toContain('.theme-slate')
  })

  it('lists and searches builtin components and runs doctor checks', async () => {
    const listOutput = runList()
    const searchOutput = runSearch('dialog')

    expect(listOutput).toContain('button')
    expect(searchOutput).toContain('dialog')

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    const doctor = await runDoctor(cwd)

    expect(doctor.ok).toBe(false)
    expect(
      doctor.issues.some(issue => issue.code === 'missing-dependency' && issue.level === 'error'),
    ).toBe(true)
    expect(
      doctor.issues.some(issue => issue.code === 'missing-dev-dependency' && issue.level === 'warning'),
    ).toBe(true)
  })

  it('throws for invalid list type', () => {
    expect(() => runList({ type: 'invalid-type' })).toThrow('Invalid list type')
  })

  it('accepts custom alias base in doctor checks', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-alias-'))
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
            base: '~',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tsconfig.json'),
      `${JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '~/*': ['src/*'],
            },
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(
      path.join(cwd, 'src/styles/globals.css'),
      '@tailwind base;\n/* @fictcn tokens:start */\n:root {}\n/* @fictcn tokens:end */\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "import animate from 'tailwindcss-animate'\nexport default { content: ['./src/**/*.{ts,tsx}'], plugins: [animate] }\n",
      'utf8',
    )

    const doctor = await runDoctor(cwd)

    expect(doctor.issues.some(issue => issue.code === 'alias-paths')).toBe(false)
  })

  it('fails doctor when registry is unsupported', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-registry-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'tsconfig.json'),
      '{"compilerOptions":{"paths":{"@/*":["src/*"]}}}\n',
      'utf8',
    )
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
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
          registry: 'https://example.com/registry.json',
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
      path.join(cwd, 'src/styles/globals.css'),
      '@tailwind base;\n/* @fictcn tokens:start */\n:root {}\n/* @fictcn tokens:end */\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "import animate from 'tailwindcss-animate'\nexport default { content: ['./src/**/*.{ts,tsx}'], plugins: [animate] }\n",
      'utf8',
    )

    const doctor = await runDoctor(cwd)

    expect(doctor.ok).toBe(false)
    expect(
      doctor.issues.some(issue => issue.code === 'unsupported-registry' && issue.level === 'error'),
    ).toBe(true)
  })

  it('reports invalid config as a doctor issue instead of throwing', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-invalid-config-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          version: 2,
          style: 'broken-style',
          aliases: {
            base: '',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const doctor = await runDoctor(cwd)

    expect(doctor.ok).toBe(false)
    expect(doctor.issues.some(issue => issue.code === 'invalid-config' && issue.level === 'error')).toBe(true)
  })

  it('parses JSONC tsconfig in doctor checks', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-jsonc-'))
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
      `{
  // generated by tsc --init
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
    },
  },
}
`,
      'utf8',
    )
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(
      path.join(cwd, 'src/styles/globals.css'),
      '@tailwind base;\n/* @fictcn tokens:start */\n:root {}\n/* @fictcn tokens:end */\n',
      'utf8',
    )
    await writeFile(
      path.join(cwd, 'tailwind.config.ts'),
      "import animate from 'tailwindcss-animate'\nexport default { content: ['./src/**/*.{ts,tsx}'], plugins: [animate] }\n",
      'utf8',
    )

    const doctor = await runDoctor(cwd)

    expect(doctor.issues.some(issue => issue.code === 'tsconfig-parse')).toBe(false)
    expect(doctor.issues.some(issue => issue.code === 'alias-paths')).toBe(false)
  })

  it('keeps init/add/doctor consistent for custom aliases and directories', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-custom-layout-'))
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

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['button'], skipInstall: true })

    const tsconfig = await readFile(path.join(cwd, 'tsconfig.json'), 'utf8')
    const button = await readFile(path.join(cwd, 'custom/ui/button.tsx'), 'utf8')
    const doctor = await runDoctor(cwd)

    expect(tsconfig).toContain('"~/*"')
    expect(tsconfig).toContain('"*"')
    expect(button).toContain("from '~/custom/lib/cn'")
    expect(doctor.issues.some(issue => issue.code === 'alias-paths')).toBe(false)
    expect(doctor.issues.some(issue => issue.code === 'tailwind-content')).toBe(false)
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
