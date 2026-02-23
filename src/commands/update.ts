import colors from 'picocolors'

import { loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, resolvePathWithinRoot, upsertTextFile } from '../core/io'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import type { FictcnLock, LockEntry } from '../core/types'
import {
  loadRegistryDataset,
  resolveBlockGraph,
  resolveComponentGraph,
  resolveEntryKinds,
  type RegistryDataset,
} from '../registry/source'
import { renderRegistryEntryFiles } from '../registry/render'
import type { RegistryEntry } from '../registry/types'

export interface UpdateOptions {
  components?: string[]
  cwd?: string
  force?: boolean
  skipInstall?: boolean
  dryRun?: boolean
}

export interface UpdateResult {
  updated: string[]
  skipped: string[]
}

type RegistryKind = 'component' | 'block' | 'theme'

interface TargetEntry {
  kind: RegistryKind
  entry: RegistryEntry
}

type ConflictReason = 'missing-lock-hash' | 'hash-mismatch'

interface ConflictDetail {
  relativePath: string
  reason: ConflictReason
}

export async function runUpdate(options: UpdateOptions = {}): Promise<UpdateResult> {
  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  const registry = await loadRegistryDataset({
    cwd: projectRoot,
    registry: config.registry,
    requireFiles: true,
  })
  const dryRun = Boolean(options.dryRun)
  const lock = await loadLock(projectRoot)

  const targets = resolveTargetEntries(lock, options.components, registry)

  if (targets.length === 0) {
    console.log(colors.yellow('No registry entries to update.'))
    return { updated: [], skipped: [] }
  }

  const dependencies = new Set<string>()
  const updated = new Set<string>()
  const skipped = new Set<string>()

  for (const target of targets) {
    target.entry.dependencies.forEach(dependency => dependencies.add(dependency))

    const renderedFiles = renderRegistryEntryFiles(target.entry, config)
    const lockMap = lockMapFor(lock, target.kind)
    const lockEntry = lockMap[target.entry.name]
    const fileHashes: Record<string, string> = {}
    let conflict: ConflictDetail | null = null

    for (const rendered of renderedFiles) {
      const absolutePath = resolvePathWithinRoot(projectRoot, rendered.relativePath)
      const current = await readTextIfExists(absolutePath)
      const lockedHash = lockEntry?.files[rendered.relativePath]

      if (current !== null && current !== rendered.content && !options.force) {
        const currentHash = hashContent(current)
        if (!lockedHash) {
          conflict = {
            relativePath: rendered.relativePath,
            reason: 'missing-lock-hash',
          }
          break
        }
        if (currentHash !== lockedHash) {
          conflict = {
            relativePath: rendered.relativePath,
            reason: 'hash-mismatch',
          }
          break
        }
      }

      fileHashes[rendered.relativePath] = rendered.hash
    }

    if (conflict) {
      skipped.add(target.entry.name)
      console.log(colors.yellow(createConflictMessage(target.entry.name, conflict)))
      continue
    }

    for (const rendered of renderedFiles) {
      if (!dryRun) {
        await upsertTextFile(projectRoot, rendered.relativePath, rendered.content)
      }
      fileHashes[rendered.relativePath] = rendered.hash
    }

    const nextLockEntry: LockEntry = {
      name: target.entry.name,
      version: target.entry.version,
      source: registry.source,
      installedAt: new Date().toISOString(),
      files: fileHashes,
    }

    if (!dryRun) {
      lockMap[target.entry.name] = nextLockEntry
    }
    updated.add(target.entry.name)
  }

  if (!dryRun && updated.size > 0) {
    await saveLock(projectRoot, lock)
  }

  if (!options.skipInstall && !dryRun && dependencies.size > 0) {
    const packageManager = await detectPackageManager(projectRoot)
    await runPackageManagerInstall(
      packageManager,
      projectRoot,
      Array.from(dependencies).sort((left, right) => left.localeCompare(right)),
      false,
    )
  }

  if (updated.size > 0) {
    console.log(colors.green(`${dryRun ? 'Would update' : 'Updated'}: ${Array.from(updated).join(', ')}`))
  }

  return {
    updated: Array.from(updated).sort((left, right) => left.localeCompare(right)),
    skipped: Array.from(skipped).sort((left, right) => left.localeCompare(right)),
  }
}

function resolveTargetEntries(lock: FictcnLock, names: string[] | undefined, registry: RegistryDataset): TargetEntry[] {
  const requestedNames = names && names.length > 0 ? names : undefined

  const componentNames =
    requestedNames?.filter(name => resolveNameKinds(name, registry).includes('component')) ??
    Object.keys(lock.components).sort((left, right) => left.localeCompare(right))
  const blockNames =
    requestedNames?.filter(name => resolveNameKinds(name, registry).includes('block')) ??
    Object.keys(lock.blocks).sort((left, right) => left.localeCompare(right))
  const themeNames =
    requestedNames?.filter(name => resolveNameKinds(name, registry).includes('theme')) ??
    Object.keys(lock.themes).sort((left, right) => left.localeCompare(right))

  const targets: TargetEntry[] = []
  for (const entry of resolveComponentGraph(registry, componentNames)) {
    targets.push({ kind: 'component', entry })
  }
  for (const entry of resolveBlockGraph(registry, blockNames)) {
    targets.push({ kind: 'block', entry })
  }
  for (const name of themeNames) {
    const entry = registry.themes[name]
    if (!entry) {
      throw new Error(`Unknown registry theme: ${name}`)
    }
    targets.push({ kind: 'theme', entry })
  }

  return targets
}

function resolveNameKinds(name: string, registry: RegistryDataset): RegistryKind[] {
  const kinds = resolveEntryKinds(registry, name) as RegistryKind[]

  if (kinds.length === 0) {
    throw new Error(`Unknown registry entry: ${name}`)
  }

  return kinds
}

function lockMapFor(lock: FictcnLock, kind: RegistryKind): Record<string, LockEntry> {
  if (kind === 'component') return lock.components
  if (kind === 'block') return lock.blocks
  return lock.themes
}

function createConflictMessage(entryName: string, conflict: ConflictDetail): string {
  const reason =
    conflict.reason === 'missing-lock-hash'
      ? 'lock metadata is missing for this file'
      : 'local file hash differs from the lock snapshot'

  return `Skipped ${entryName}; local changes detected in ${conflict.relativePath} (${reason}). Run \`fictcn diff ${entryName}\` to inspect or use --force to override.`
}
