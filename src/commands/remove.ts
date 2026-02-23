import { rm } from 'node:fs/promises'
import path from 'node:path'

import colors from 'picocolors'

import { loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, resolvePathWithinRoot, upsertTextFile } from '../core/io'
import { findProjectRoot } from '../core/project'
import { ensureTrailingNewline } from '../core/text'
import type { FictcnLock, LockEntry } from '../core/types'

type RegistryKind = 'component' | 'block' | 'theme'

interface RemovalTarget {
  kind: RegistryKind
  name: string
  lockEntry: LockEntry
}

export interface RemoveOptions {
  entries: string[]
  cwd?: string
  force?: boolean
  dryRun?: boolean
}

export interface RemoveResult {
  removed: string[]
  skipped: string[]
  missing: string[]
}

export async function runRemove(options: RemoveOptions): Promise<RemoveResult> {
  if (options.entries.length === 0) {
    throw new Error('Please provide at least one installed registry entry name.')
  }

  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  const dryRun = Boolean(options.dryRun)
  const lock = await loadLock(projectRoot)

  const missing = new Set<string>()
  const targets = dedupeTargets(
    options.entries.flatMap(entryName => {
      const resolved = resolveRemovalTargets(lock, entryName)
      if (resolved.length === 0) {
        missing.add(entryName)
      }
      return resolved
    }),
  )

  const removed = new Set<string>()
  const skipped = new Set<string>()
  const removedThemeFiles = new Set<string>()

  for (const target of targets) {
    const conflictPath = await findConflictPath(projectRoot, target.lockEntry, Boolean(options.force))
    if (conflictPath) {
      skipped.add(target.name)
      console.log(
        colors.yellow(
          `Skipped ${target.name}; local changes detected in ${conflictPath}. Use --force to remove anyway.`,
        ),
      )
      continue
    }

    if (!dryRun) {
      for (const relativePath of Object.keys(target.lockEntry.files)) {
        await rm(resolvePathWithinRoot(projectRoot, relativePath), { force: true })
      }

      if (target.kind === 'theme') {
        Object.keys(target.lockEntry.files).forEach(filePath => removedThemeFiles.add(filePath))
      }

      delete lockMapFor(lock, target.kind)[target.name]
    }

    removed.add(target.name)
  }

  if (!dryRun && removed.size > 0) {
    if (removedThemeFiles.size > 0) {
      await removeThemeImports(projectRoot, config.css, Array.from(removedThemeFiles))
    }
    await saveLock(projectRoot, lock)
  }

  if (removed.size > 0) {
    console.log(colors.green(`${dryRun ? 'Would remove' : 'Removed'}: ${Array.from(removed).join(', ')}`))
  }
  if (skipped.size > 0) {
    console.log(colors.yellow(`${dryRun ? 'Would skip removal for' : 'Skipped'}: ${Array.from(skipped).join(', ')}`))
  }
  if (missing.size > 0) {
    console.log(colors.yellow(`Not installed: ${Array.from(missing).join(', ')}`))
  }

  return {
    removed: Array.from(removed).sort((left, right) => left.localeCompare(right)),
    skipped: Array.from(skipped).sort((left, right) => left.localeCompare(right)),
    missing: Array.from(missing).sort((left, right) => left.localeCompare(right)),
  }
}

function resolveRemovalTargets(lock: FictcnLock, entryName: string): RemovalTarget[] {
  const targets: RemovalTarget[] = []

  if (lock.components[entryName]) {
    targets.push({
      kind: 'component',
      name: entryName,
      lockEntry: lock.components[entryName],
    })
  }
  if (lock.blocks[entryName]) {
    targets.push({
      kind: 'block',
      name: entryName,
      lockEntry: lock.blocks[entryName],
    })
  }
  if (lock.themes[entryName]) {
    targets.push({
      kind: 'theme',
      name: entryName,
      lockEntry: lock.themes[entryName],
    })
  }

  return targets
}

function dedupeTargets(targets: RemovalTarget[]): RemovalTarget[] {
  const targetMap = new Map<string, RemovalTarget>()
  for (const target of targets) {
    targetMap.set(`${target.kind}:${target.name}`, target)
  }
  return Array.from(targetMap.values())
}

async function findConflictPath(
  projectRoot: string,
  lockEntry: LockEntry,
  force: boolean,
): Promise<string | null> {
  if (force) {
    return null
  }

  for (const [relativePath, expectedHash] of Object.entries(lockEntry.files)) {
    const current = await readTextIfExists(resolvePathWithinRoot(projectRoot, relativePath))
    if (current === null) {
      continue
    }

    if (hashContent(current) !== expectedHash) {
      return relativePath
    }
  }

  return null
}

function lockMapFor(lock: FictcnLock, kind: RegistryKind): Record<string, LockEntry> {
  if (kind === 'component') return lock.components
  if (kind === 'block') return lock.blocks
  return lock.themes
}

async function removeThemeImports(projectRoot: string, globalsCssPath: string, removedThemeFiles: string[]): Promise<void> {
  const globalsRaw = await readTextIfExists(path.resolve(projectRoot, globalsCssPath))
  if (globalsRaw === null) {
    return
  }

  const importLines = new Set(removedThemeFiles.map(filePath => `@import "${toImportPath(globalsCssPath, filePath)}";`))
  const lines = globalsRaw.split('\n')
  const next = lines.filter(line => !importLines.has(line.trim())).join('\n')

  if (next !== globalsRaw) {
    await upsertTextFile(projectRoot, globalsCssPath, ensureTrailingNewline(next))
  }
}

function toImportPath(from: string, to: string): string {
  const relative = path.posix.relative(path.posix.dirname(from), to)
  if (relative.startsWith('.')) return relative
  return `./${relative}`
}
