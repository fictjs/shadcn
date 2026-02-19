import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'

const ORIGINAL_PATH = process.env.PATH ?? ''
const unixOnlyIt = process.platform === 'win32' ? it.skip : it

describe('runAdd edge cases', () => {
  afterEach(() => {
    process.env.PATH = ORIGINAL_PATH
  })

  it('throws when no component names are provided', async () => {
    await expect(runAdd({ components: [] })).rejects.toThrow(
      'Please provide at least one component name.',
    )
  })

  unixOnlyIt('installs runtime dependencies declared by remote components', async () => {
    const registryRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-add-edge-registry-'))
    const registryPath = path.join(registryRoot, 'index.json')
    await writeFile(
      registryPath,
      `${JSON.stringify(
        [
          {
            name: 'remote-dep-button',
            type: 'ui-component',
            version: '1.0.0',
            dependencies: ['zod', '@tanstack/react-query'],
            registryDependencies: [],
            files: [
              {
                path: '{{componentsDir}}/remote-dep-button.tsx',
                content: 'export function RemoteDepButton() {\\n  return <button>remote</button>\\n}\\n',
              },
            ],
          },
        ],
        null,
        2,
      )}\n`,
      'utf8',
    )

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-add-edge-install-deps-'))
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

    const argsPath = path.join(cwd, 'npm.args')
    const fakeBinDir = await createFakePackageManagerBinary('npm', argsPath, 0)
    process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`

    const result = await runAdd({
      cwd,
      components: ['remote-dep-button'],
    })

    expect(result.added).toContain('remote-dep-button')
    expect(await readFile(argsPath, 'utf8')).toBe('install --save @tanstack/react-query zod')
  })

  unixOnlyIt('deduplicates dependency lists merged from dependencies and devDependencies', async () => {
    const registryRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-add-edge-registry-dedupe-'))
    const registryPath = path.join(registryRoot, 'index.json')
    await writeFile(
      registryPath,
      `${JSON.stringify(
        [
          {
            name: 'remote-dedupe-button',
            type: 'ui-component',
            version: '1.0.0',
            dependencies: ['zod', 'zod', 'zustand'],
            devDependencies: ['zustand', 'zod'],
            registryDependencies: [],
            files: [
              {
                path: '{{componentsDir}}/remote-dedupe-button.tsx',
                content: 'export function RemoteDedupeButton() {\\n  return <button>remote dedupe</button>\\n}\\n',
              },
            ],
          },
        ],
        null,
        2,
      )}\n`,
      'utf8',
    )

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-add-edge-dedupe-project-'))
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

    const argsPath = path.join(cwd, 'npm.args')
    const fakeBinDir = await createFakePackageManagerBinary('npm', argsPath, 0)
    process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`

    const result = await runAdd({
      cwd,
      components: ['remote-dedupe-button'],
    })

    expect(result.added).toContain('remote-dedupe-button')
    expect(await readFile(argsPath, 'utf8')).toBe('install --save zod zustand')
  })
})

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
