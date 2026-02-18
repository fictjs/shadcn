import path from 'node:path'

import { createPatch } from 'diff'

import { assertSupportedRegistry, loadConfig, loadLock } from '../core/config'
import type { FictcnLock } from '../core/types'
import { readTextIfExists } from '../core/io'
import { findProjectRoot } from '../core/project'
import { getBuiltinBlock, getBuiltinTheme, resolveBuiltinBlockGraph, resolveBuiltinComponentGraph } from '../registry'
import { renderRegistryEntryFiles } from '../registry/render'
import type { RegistryEntry } from '../registry/types'

export interface DiffOptions {
  components?: string[]
  cwd?: string
}

export interface DiffResult {
  changed: string[]
  patches: string[]
}

type RegistryKind = 'component' | 'block' | 'theme'

interface TargetEntry {
  kind: RegistryKind
  entry: RegistryEntry
}

export async function runDiff(options: DiffOptions = {}): Promise<DiffResult> {
  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  assertSupportedRegistry(config)
  const lock = await loadLock(projectRoot)

  const targets = resolveTargetEntries(lock, options.components)

  if (targets.length === 0) {
    return { changed: [], patches: [] }
  }

  const patches: string[] = []
  const changed = new Set<string>()

  for (const target of targets) {
    const renderedFiles = renderRegistryEntryFiles(target.entry, config)

    for (const rendered of renderedFiles) {
      const absolutePath = path.resolve(projectRoot, rendered.relativePath)
      const current = (await readTextIfExists(absolutePath)) ?? ''
      if (current === rendered.content) continue

      changed.add(target.entry.name)
      patches.push(
        createPatch(
          rendered.relativePath,
          current,
          rendered.content,
          'local',
          patchLabelFor(target),
        ),
      )
    }
  }

  return {
    changed: Array.from(changed).sort((left, right) => left.localeCompare(right)),
    patches,
  }
}

function resolveTargetEntries(lock: FictcnLock, names?: string[]): TargetEntry[] {
  const requestedNames = names && names.length > 0 ? names : undefined

  const componentNames =
    requestedNames?.filter(name => resolveNameKinds(name).includes('component')) ??
    Object.keys(lock.components).sort((left, right) => left.localeCompare(right))
  const blockNames =
    requestedNames?.filter(name => resolveNameKinds(name).includes('block')) ??
    Object.keys(lock.blocks).sort((left, right) => left.localeCompare(right))
  const themeNames =
    requestedNames?.filter(name => resolveNameKinds(name).includes('theme')) ??
    Object.keys(lock.themes).sort((left, right) => left.localeCompare(right))

  const targets: TargetEntry[] = []
  for (const entry of resolveBuiltinComponentGraph(componentNames)) {
    targets.push({ kind: 'component', entry })
  }
  for (const entry of resolveBuiltinBlockGraph(blockNames)) {
    targets.push({ kind: 'block', entry })
  }
  for (const name of themeNames) {
    const entry = getBuiltinTheme(name)
    if (!entry) {
      throw new Error(`Unknown registry theme: ${name}`)
    }
    targets.push({ kind: 'theme', entry })
  }

  return targets
}

function resolveNameKinds(name: string): RegistryKind[] {
  const kinds: RegistryKind[] = []
  if (resolveBuiltinComponentGraphSafe(name)) kinds.push('component')
  if (getBuiltinBlock(name)) kinds.push('block')
  if (getBuiltinTheme(name)) kinds.push('theme')

  if (kinds.length === 0) {
    throw new Error(`Unknown registry entry: ${name}`)
  }

  return kinds
}

function resolveBuiltinComponentGraphSafe(name: string): boolean {
  try {
    const entries = resolveBuiltinComponentGraph([name])
    return entries.length > 0 && entries[entries.length - 1]?.name === name
  } catch {
    return false
  }
}

function patchLabelFor(target: TargetEntry): string {
  if (target.kind === 'component') {
    return `registry/${target.entry.name}@${target.entry.version}`
  }
  return `registry/${target.kind}/${target.entry.name}@${target.entry.version}`
}
