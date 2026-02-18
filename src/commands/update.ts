import path from 'node:path'

import colors from 'picocolors'

import { loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, upsertTextFile } from '../core/io'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import type { LockEntry } from '../core/types'
import { resolveBuiltinComponentGraph } from '../registry'
import { renderComponentFiles } from '../registry/render'

export interface UpdateOptions {
  components?: string[]
  cwd?: string
  force?: boolean
  skipInstall?: boolean
}

export interface UpdateResult {
  updated: string[]
  skipped: string[]
}

export async function runUpdate(options: UpdateOptions = {}): Promise<UpdateResult> {
  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  const lock = await loadLock(projectRoot)

  const targetComponents =
    options.components && options.components.length > 0
      ? options.components
      : Object.keys(lock.components).sort((left, right) => left.localeCompare(right))

  if (targetComponents.length === 0) {
    console.log(colors.yellow('No components to update.'))
    return { updated: [], skipped: [] }
  }

  const entries = resolveBuiltinComponentGraph(targetComponents)
  const dependencies = new Set<string>()
  const updated = new Set<string>()
  const skipped = new Set<string>()

  for (const entry of entries) {
    entry.dependencies.forEach(dependency => dependencies.add(dependency))

    const renderedFiles = renderComponentFiles(entry.name, config)
    const lockEntry = lock.components[entry.name]
    const fileHashes: Record<string, string> = {}
    let hasConflict = false

    for (const rendered of renderedFiles) {
      const absolutePath = path.resolve(projectRoot, rendered.relativePath)
      const current = await readTextIfExists(absolutePath)
      const lockedHash = lockEntry?.files[rendered.relativePath]

      if (current !== null && current !== rendered.content && !options.force) {
        const currentHash = hashContent(current)
        if (!lockedHash || currentHash !== lockedHash) {
          hasConflict = true
          break
        }
      }

      fileHashes[rendered.relativePath] = rendered.hash
    }

    if (hasConflict) {
      skipped.add(entry.name)
      console.log(colors.yellow(`Skipped ${entry.name}; local changes detected (use --force to override).`))
      continue
    }

    for (const rendered of renderedFiles) {
      await upsertTextFile(projectRoot, rendered.relativePath, rendered.content)
      fileHashes[rendered.relativePath] = rendered.hash
    }

    const nextLockEntry: LockEntry = {
      name: entry.name,
      version: entry.version,
      source: 'builtin',
      installedAt: new Date().toISOString(),
      files: fileHashes,
    }

    lock.components[entry.name] = nextLockEntry
    updated.add(entry.name)
  }

  await saveLock(projectRoot, lock)

  if (!options.skipInstall && dependencies.size > 0) {
    const packageManager = await detectPackageManager(projectRoot)
    await runPackageManagerInstall(
      packageManager,
      projectRoot,
      Array.from(dependencies).sort((left, right) => left.localeCompare(right)),
      false,
    )
  }

  if (updated.size > 0) {
    console.log(colors.green(`Updated: ${Array.from(updated).join(', ')}`))
  }

  return {
    updated: Array.from(updated).sort((left, right) => left.localeCompare(right)),
    skipped: Array.from(skipped).sort((left, right) => left.localeCompare(right)),
  }
}
