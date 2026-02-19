import { chmod, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { detectPackageManager, runPackageManagerInstall } from '../src/core/project'

const ORIGINAL_USER_AGENT = process.env.npm_config_user_agent
const ORIGINAL_PATH = process.env.PATH ?? ''
const unixOnlyIt = process.platform === 'win32' ? it.skip : it

describe('detectPackageManager', () => {
  afterEach(() => {
    process.env.npm_config_user_agent = ORIGINAL_USER_AGENT
  })

  it('prefers lockfile detection in deterministic order', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-lock-priority-'))

    await writeFile(path.join(cwd, 'package-lock.json'), '{}\n', 'utf8')
    await writeFile(path.join(cwd, 'pnpm-lock.yaml'), 'lockfileVersion: "9.0"\n', 'utf8')

    await expect(detectPackageManager(cwd)).resolves.toBe('pnpm')
  })

  it('falls back to npm user agent when no lockfile exists', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-ua-npm-'))
    process.env.npm_config_user_agent = 'npm/10.9.4 node/v22.22.0 linux x64'

    await expect(detectPackageManager(cwd)).resolves.toBe('npm')
  })

  it('falls back to yarn user agent when no lockfile exists', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-ua-yarn-'))
    process.env.npm_config_user_agent = 'yarn/4.6.0 npm/? node/v22.22.0'

    await expect(detectPackageManager(cwd)).resolves.toBe('yarn')
  })

  it('falls back to bun user agent when no lockfile exists', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-ua-bun-'))
    process.env.npm_config_user_agent = 'bun/1.2.22 npm/? node/v22.22.0'

    await expect(detectPackageManager(cwd)).resolves.toBe('bun')
  })

  it('defaults to npm when lockfile and user agent are absent', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-default-'))
    delete process.env.npm_config_user_agent

    await expect(detectPackageManager(cwd)).resolves.toBe('npm')
  })
})

describe('runPackageManagerInstall', () => {
  afterEach(() => {
    process.env.PATH = ORIGINAL_PATH
  })

  unixOnlyIt('uses expected install args for each package manager and mode', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-run-args-'))

    const cases: Array<{
      pm: 'pnpm' | 'npm' | 'yarn' | 'bun'
      dev: boolean
      expected: string
    }> = [
      { pm: 'pnpm', dev: false, expected: 'add alpha bravo' },
      { pm: 'pnpm', dev: true, expected: 'add -D alpha bravo' },
      { pm: 'npm', dev: false, expected: 'install --save alpha bravo' },
      { pm: 'npm', dev: true, expected: 'install --save-dev alpha bravo' },
      { pm: 'yarn', dev: false, expected: 'add alpha bravo' },
      { pm: 'yarn', dev: true, expected: 'add --dev alpha bravo' },
      { pm: 'bun', dev: false, expected: 'add alpha bravo' },
      { pm: 'bun', dev: true, expected: 'add --dev alpha bravo' },
    ]

    for (const testCase of cases) {
      const argsPath = path.join(cwd, `${testCase.pm}-${testCase.dev ? 'dev' : 'runtime'}.args`)
      const fakeBinDir = await createFakePackageManagerBinary(testCase.pm, argsPath, 0)
      process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`

      await runPackageManagerInstall(testCase.pm, cwd, ['alpha', 'bravo'], testCase.dev)

      const actualArgs = (await readFile(argsPath, 'utf8')).trim()
      expect(actualArgs).toBe(testCase.expected)
    }
  })

  unixOnlyIt('skips spawn when dependency list is empty', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-run-empty-'))
    const argsPath = path.join(cwd, 'npm.args')
    const fakeBinDir = await createFakePackageManagerBinary('npm', argsPath, 0)
    process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`

    await runPackageManagerInstall('npm', cwd, [], false)
    expect(await fileExists(argsPath)).toBe(false)
  })

  unixOnlyIt('throws actionable error when install exits non-zero', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-pm-run-failure-'))
    const argsPath = path.join(cwd, 'npm.args')
    const fakeBinDir = await createFakePackageManagerBinary('npm', argsPath, 1)
    process.env.PATH = `${fakeBinDir}${path.delimiter}${ORIGINAL_PATH}`

    await expect(runPackageManagerInstall('npm', cwd, ['alpha'], false)).rejects.toThrow(
      'Dependency installation failed: npm install --save alpha',
    )
  })
})

async function createFakePackageManagerBinary(
  command: 'pnpm' | 'npm' | 'yarn' | 'bun',
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

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}
