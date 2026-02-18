import path from 'node:path'

import { createPatch } from 'diff'

import { assertSupportedRegistry, loadConfig, loadLock } from '../core/config'
import { readTextIfExists } from '../core/io'
import { findProjectRoot } from '../core/project'
import { resolveBuiltinComponentGraph } from '../registry'
import { renderComponentFiles } from '../registry/render'

export interface DiffOptions {
  components?: string[]
  cwd?: string
}

export interface DiffResult {
  changed: string[]
  patches: string[]
}

export async function runDiff(options: DiffOptions = {}): Promise<DiffResult> {
  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  assertSupportedRegistry(config)
  const lock = await loadLock(projectRoot)

  const targetComponents =
    options.components && options.components.length > 0
      ? options.components
      : Object.keys(lock.components).sort((left, right) => left.localeCompare(right))

  if (targetComponents.length === 0) {
    return { changed: [], patches: [] }
  }

  const entries = resolveBuiltinComponentGraph(targetComponents)
  const patches: string[] = []
  const changed = new Set<string>()

  for (const entry of entries) {
    const renderedFiles = renderComponentFiles(entry.name, config)

    for (const rendered of renderedFiles) {
      const absolutePath = path.resolve(projectRoot, rendered.relativePath)
      const current = (await readTextIfExists(absolutePath)) ?? ''
      if (current === rendered.content) continue

      changed.add(entry.name)
      patches.push(
        createPatch(
          rendered.relativePath,
          current,
          rendered.content,
          'local',
          `registry/${entry.name}@${entry.version}`,
        ),
      )
    }
  }

  return {
    changed: Array.from(changed).sort((left, right) => left.localeCompare(right)),
    patches,
  }
}
