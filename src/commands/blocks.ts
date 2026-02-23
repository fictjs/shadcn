import colors from 'picocolors'

import { runAdd } from './add'
import { ensureConfigFile, loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, resolvePathWithinRoot, upsertTextFile } from '../core/io'
import { ensureTrailingNewline } from '../core/text'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import type { AddResult, LockEntry } from '../core/types'
import { createTemplateContext, resolveTemplatePath } from '../registry/context'
import { loadRegistryDataset, resolveBlockGraph } from '../registry/source'

export interface BlockInstallOptions {
  blocks: string[]
  cwd?: string
  overwrite?: boolean
  skipInstall?: boolean
  dryRun?: boolean
}

export async function runBlocksInstall(options: BlockInstallOptions): Promise<AddResult> {
  if (options.blocks.length === 0) {
    throw new Error('Please provide at least one block name.')
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
  const entries = resolveBlockGraph(registry, options.blocks)
  const componentDependencies = Array.from(
    new Set(
      entries.flatMap(entry => entry.registryDependencies).filter(dependency => Boolean(registry.components[dependency])),
    ),
  ).sort((left, right) => left.localeCompare(right))

  if (componentDependencies.length > 0) {
    await runAdd({
      cwd: projectRoot,
      components: componentDependencies,
      overwrite: options.overwrite,
      skipInstall: options.skipInstall,
      dryRun,
    })
  }

  const context = createTemplateContext(config)
  const lock = await loadLock(projectRoot)
  let lockChanged = false
  const dependencySet = new Set<string>()
  const added: string[] = []
  const updated: string[] = []
  const skipped: string[] = []

  for (const entry of entries) {
    const plannedFiles = entry.files.map(file => {
      const relativePath = resolveTemplatePath(file.path, config)
      const content = ensureTrailingNewline(file.content(context))
      return {
        relativePath,
        content,
      }
    })

    const conflicts: string[] = []
    if (!options.overwrite) {
      for (const file of plannedFiles) {
        const existing = await readTextIfExists(resolvePathWithinRoot(projectRoot, file.relativePath))
        if (existing !== null && existing !== file.content) {
          conflicts.push(file.relativePath)
        }
      }
    }

    if (conflicts.length > 0) {
      skipped.push(entry.name)
      console.log(colors.yellow(`Skipped block ${entry.name}; conflicting files:`))
      for (const conflict of conflicts) {
        console.log(colors.yellow(`  - ${conflict}`))
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

    if (lock.blocks[entry.name]) {
      updated.push(entry.name)
    } else {
      added.push(entry.name)
    }

    if (!dryRun) {
      lock.blocks[entry.name] = lockEntry
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
      await runPackageManagerInstall(packageManager, projectRoot, dependencies, false)
    }
  }

  if (added.length > 0) {
    console.log(colors.green(`${dryRun ? 'Would add blocks' : 'Blocks added'}: ${added.join(', ')}`))
  }
  if (updated.length > 0) {
    console.log(colors.green(`${dryRun ? 'Would update blocks' : 'Blocks updated'}: ${updated.join(', ')}`))
  }
  if (skipped.length > 0) {
    console.log(colors.yellow(`${dryRun ? 'Would skip blocks' : 'Blocks skipped'}: ${skipped.join(', ')}`))
  }

  return { added, updated, skipped }
}
