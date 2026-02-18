import { dirname, resolve } from 'node:path'
import { spawn } from 'node:child_process'

import { exists } from './io'

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

const LOCK_FILE_TO_PM: Array<{ lockFile: string; pm: PackageManager }> = [
  { lockFile: 'pnpm-lock.yaml', pm: 'pnpm' },
  { lockFile: 'package-lock.json', pm: 'npm' },
  { lockFile: 'yarn.lock', pm: 'yarn' },
  { lockFile: 'bun.lockb', pm: 'bun' },
  { lockFile: 'bun.lock', pm: 'bun' },
]

export async function findProjectRoot(startDir: string): Promise<string> {
  let current = resolve(startDir)

  while (true) {
    if (await exists(resolve(current, 'package.json'))) {
      return current
    }

    const parent = dirname(current)
    if (parent === current) {
      return resolve(startDir)
    }
    current = parent
  }
}

export async function detectPackageManager(projectRoot: string): Promise<PackageManager> {
  for (const entry of LOCK_FILE_TO_PM) {
    if (await exists(resolve(projectRoot, entry.lockFile))) {
      return entry.pm
    }
  }

  const userAgent = process.env.npm_config_user_agent ?? ''
  if (userAgent.startsWith('pnpm/')) return 'pnpm'
  if (userAgent.startsWith('yarn/')) return 'yarn'
  if (userAgent.startsWith('bun/')) return 'bun'
  return 'npm'
}

export async function runPackageManagerInstall(
  pm: PackageManager,
  projectRoot: string,
  dependencies: string[],
  dev = false,
): Promise<void> {
  if (dependencies.length === 0) return

  const args = buildInstallArgs(pm, dependencies, dev)

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(pm, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    child.on('exit', code => {
      if (code === 0) {
        resolvePromise()
      } else {
        rejectPromise(new Error(`Dependency installation failed: ${pm} ${args.join(' ')}`))
      }
    })

    child.on('error', error => {
      rejectPromise(error)
    })
  })
}

function buildInstallArgs(pm: PackageManager, dependencies: string[], dev: boolean): string[] {
  switch (pm) {
    case 'pnpm':
      return [dev ? 'add' : 'add', dev ? '-D' : '', ...dependencies].filter(Boolean)
    case 'npm':
      return ['install', dev ? '--save-dev' : '--save', ...dependencies]
    case 'yarn':
      return ['add', dev ? '--dev' : '', ...dependencies].filter(Boolean)
    case 'bun':
      return ['add', dev ? '--dev' : '', ...dependencies].filter(Boolean)
    default:
      return ['install', ...dependencies]
  }
}
