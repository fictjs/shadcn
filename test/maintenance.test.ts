import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runBlocksInstall } from '../src/commands/blocks'
import { runDiff } from '../src/commands/diff'
import { runDoctor } from '../src/commands/doctor'
import { runInit } from '../src/commands/init'
import { runList } from '../src/commands/list'
import { runSearch } from '../src/commands/search'
import { runThemeApply } from '../src/commands/theme'
import { runUpdate } from '../src/commands/update'

describe('maintenance commands', () => {
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

    const guardedUpdate = await runUpdate({ cwd, components: ['button'], skipInstall: true })
    expect(guardedUpdate.skipped).toContain('button')

    const forcedUpdate = await runUpdate({ cwd, components: ['button'], force: true, skipInstall: true })
    expect(forcedUpdate.updated).toContain('button')

    const refreshed = await readFile(filePath, 'utf8')
    expect(refreshed).toContain('buttonVariants')
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

    expect(doctor.ok).toBe(true)
    expect(doctor.issues.some(issue => issue.code === 'missing-dependency')).toBe(true)
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
          $schema: 'https://fictjs.dev/schemas/fictcn.schema.json',
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
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{"paths":{"@/*":["src/*"]}}}\n', 'utf8')
    await mkdir(path.join(cwd, 'src/styles'), { recursive: true })
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fictjs.dev/schemas/fictcn.schema.json',
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

  it('parses JSONC tsconfig in doctor checks', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-doctor-jsonc-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fictjs.dev/schemas/fictcn.schema.json',
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
          $schema: 'https://fictjs.dev/schemas/fictcn.schema.json',
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
