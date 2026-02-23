import colors from 'picocolors'

import { ensureConfigFile, loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, resolvePathWithinRoot, upsertTextFile } from '../core/io'
import { ensureTrailingNewline } from '../core/text'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import type { AddResult, LockEntry } from '../core/types'
import { createTemplateContext, resolveTemplatePath } from '../registry/context'
import { loadRegistryDataset, resolveComponentGraph } from '../registry/source'

export interface AddOptions {
  components: string[]
  cwd?: string
  overwrite?: boolean
  skipInstall?: boolean
  dryRun?: boolean
}

export async function runAdd(options: AddOptions): Promise<AddResult> {
  if (options.components.length === 0) {
    throw new Error('Please provide at least one component name.')
  }

  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  const dryRun = Boolean(options.dryRun)
  if (!dryRun) {
    await ensureConfigFile(projectRoot, config)
  }

  const registry = await loadRegistryDataset({
    cwd: projectRoot,
    registry: config.registry,
    requireFiles: true,
  })
  const resolved = resolveComponentGraph(registry, options.components)
  const context = createTemplateContext(config)
  const lock = await loadLock(projectRoot)
  let lockChanged = false

  const dependencySet = new Set<string>()
  const added: string[] = []
  const updated: string[] = []
  const skipped: string[] = []

  for (const entry of resolved) {
    const plannedFiles = entry.files.map(file => {
      const relativePath = resolveTemplatePath(file.path, config)
      const content = ensureTrailingNewline(file.content(context))
      return {
        relativePath,
        content,
      }
    })

    const conflictPaths: string[] = []
    if (!options.overwrite) {
      for (const file of plannedFiles) {
        const absolutePath = resolvePathWithinRoot(projectRoot, file.relativePath)
        const existing = await readTextIfExists(absolutePath)
        if (existing !== null && existing !== file.content) {
          conflictPaths.push(file.relativePath)
        }
      }
    }

    if (conflictPaths.length > 0) {
      skipped.push(entry.name)
      console.log(colors.yellow(`Skipped ${entry.name}; conflicting files:`))
      for (const conflictPath of conflictPaths) {
        console.log(colors.yellow(`  - ${conflictPath}`))
      }
      continue
    }

    entry.dependencies.forEach(dependency => dependencySet.add(dependency))

    const fileHashes: Record<string, string> = {}
    for (const file of plannedFiles) {
      if (!dryRun) {
        await upsertTextFile(projectRoot, file.relativePath, file.content)
      }
      fileHashes[file.relativePath] = hashContent(file.content)
    }

    const lockEntry: LockEntry = {
      name: entry.name,
      version: entry.version,
      source: registry.source,
      installedAt: new Date().toISOString(),
      files: fileHashes,
    }

    if (lock.components[entry.name]) {
      updated.push(entry.name)
    } else {
      added.push(entry.name)
    }

    if (!dryRun) {
      lock.components[entry.name] = lockEntry
      lockChanged = true
    }
  }

  if (!dryRun && lockChanged) {
    await saveLock(projectRoot, lock)
  }

  if (!options.skipInstall && !dryRun) {
    const dependencies = Array.from(dependencySet).sort((left, right) => left.localeCompare(right))

    if (dependencies.length > 0) {
      const packageManager = await detectPackageManager(projectRoot)
      console.log(colors.cyan(`Installing component dependencies via ${packageManager}...`))
      await runPackageManagerInstall(packageManager, projectRoot, dependencies, false)
    }
  }

  if (added.length > 0) {
    console.log(colors.green(`${dryRun ? 'Would add' : 'Added'}: ${added.join(', ')}`))
  }
  if (updated.length > 0) {
    console.log(colors.green(`${dryRun ? 'Would update' : 'Updated'}: ${updated.join(', ')}`))
  }
  if (skipped.length > 0) {
    console.log(colors.yellow(`${dryRun ? 'Would skip' : 'Skipped'}: ${skipped.join(', ')}`))
  }

  return { added, updated, skipped }
}
