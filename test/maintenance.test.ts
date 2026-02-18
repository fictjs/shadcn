import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runDiff } from '../src/commands/diff'
import { runDoctor } from '../src/commands/doctor'
import { runInit } from '../src/commands/init'
import { runList } from '../src/commands/list'
import { runSearch } from '../src/commands/search'
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
})
