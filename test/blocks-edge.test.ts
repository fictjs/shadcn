import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

import { runBlocksInstall } from '../src/commands/blocks'
import { runInit } from '../src/commands/init'

const ORIGINAL_PATH = process.env.PATH ?? ''
const unixOnlyIt = process.platform === 'win32' ? it.skip : it

describe('runBlocksInstall edge cases', () => {
  afterEach(() => {
    process.env.PATH = ORIGINAL_PATH
  })

  it('throws when block list is empty', async () => {
    await expect(runBlocksInstall({ blocks: [] })).rejects.toThrow('Please provide at least one block name.')
  })

  it('marks reinstalled blocks as updated and skips conflicts', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-blocks-edge-update-skip-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })

    const initial = await runBlocksInstall({
      cwd,
      blocks: ['auth/login-form'],
      skipInstall: true,
    })
    expect(initial.added).toContain('auth/login-form')

    const updated = await runBlocksInstall({
      cwd,
      blocks: ['auth/login-form'],
      skipInstall: true,
    })
    expect(updated.updated).toContain('auth/login-form')

    const blockPath = path.join(cwd, 'src/components/blocks/auth/login-form.tsx')
    await writeFile(blockPath, 'local edits\n', 'utf8')

    const skipped = await runBlocksInstall({
      cwd,
      blocks: ['auth/login-form'],
      skipInstall: true,
    })
    expect(skipped.skipped).toContain('auth/login-form')
  })

  unixOnlyIt('installs runtime dependencies declared by remote blocks', async () => {
    const registryRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-blocks-edge-registry-'))
    const registryIndex = path.join(registryRoot, 'index.json')
    await writeFile(
      registryIndex,
      `${JSON.stringify(
        [
          {
            name: 'remote-dep-block',
            type: 'block',
            version: '1.0.0',
            dependencies: ['zod', '@tanstack/table-core'],
            registryDependencies: [],
            files: [
              {
                path: '{{blocksDir}}/remote-dep-block.tsx',
                content: 'export function RemoteDepBlock() {\\n  return <div>remote</div>\\n}\\n',
              },
            ],
          },
        ],
        null,
        2,
      )}\n`,
      'utf8',
    )

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-blocks-edge-install-deps-'))
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
          registry: pathToFileURL(registryIndex).toString(),
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

    const result = await runBlocksInstall({
      cwd,
      blocks: ['remote-dep-block'],
    })

    expect(result.added).toContain('remote-dep-block')
    expect(await readFile(argsPath, 'utf8')).toBe('install --save @tanstack/table-core zod')
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
