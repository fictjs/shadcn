import path from 'node:path'

import colors from 'picocolors'

import { runAdd } from './add'
import { assertSupportedRegistry, ensureConfigFile, loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, upsertTextFile } from '../core/io'
import { ensureTrailingNewline } from '../core/text'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import type { AddResult, LockEntry } from '../core/types'
import { createTemplateContext, resolveTemplatePath } from '../registry/context'
import { resolveBuiltinBlockGraph } from '../registry'

export interface BlockInstallOptions {
  blocks: string[]
  cwd?: string
  overwrite?: boolean
  skipInstall?: boolean
}

export async function runBlocksInstall(options: BlockInstallOptions): Promise<AddResult> {
  if (options.blocks.length === 0) {
    throw new Error('Please provide at least one block name.')
  }

  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  assertSupportedRegistry(config)
  await ensureConfigFile(projectRoot, config)

  const entries = resolveBuiltinBlockGraph(options.blocks)
  const componentDependencies = Array.from(
    new Set(entries.flatMap(entry => entry.registryDependencies)),
  ).sort((left, right) => left.localeCompare(right))

  if (componentDependencies.length > 0) {
    await runAdd({
      cwd: projectRoot,
      components: componentDependencies,
      overwrite: options.overwrite,
      skipInstall: options.skipInstall,
    })
  }

  const context = createTemplateContext(config)
  const lock = await loadLock(projectRoot)
  const dependencySet = new Set<string>()
  const added: string[] = []
  const updated: string[] = []
  const skipped: string[] = []

  for (const entry of entries) {
    entry.dependencies.forEach(dependency => dependencySet.add(dependency))

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
        const existing = await readTextIfExists(path.resolve(projectRoot, file.relativePath))
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

    const fileHashes: Record<string, string> = {}
    for (const file of plannedFiles) {
      await upsertTextFile(projectRoot, file.relativePath, file.content)
      fileHashes[file.relativePath] = hashContent(file.content)
    }

    const lockEntry: LockEntry = {
      name: entry.name,
      version: entry.version,
      source: 'builtin',
      installedAt: new Date().toISOString(),
      files: fileHashes,
    }

    if (lock.blocks[entry.name]) {
      updated.push(entry.name)
    } else {
      added.push(entry.name)
    }

    lock.blocks[entry.name] = lockEntry
  }

  await saveLock(projectRoot, lock)

  if (!options.skipInstall) {
    const dependencies = Array.from(dependencySet).sort((left, right) => left.localeCompare(right))
    if (dependencies.length > 0) {
      const packageManager = await detectPackageManager(projectRoot)
      await runPackageManagerInstall(packageManager, projectRoot, dependencies, false)
    }
  }

  if (added.length > 0) {
    console.log(colors.green(`Blocks added: ${added.join(', ')}`))
  }
  if (updated.length > 0) {
    console.log(colors.green(`Blocks updated: ${updated.join(', ')}`))
  }
  if (skipped.length > 0) {
    console.log(colors.yellow(`Blocks skipped: ${skipped.join(', ')}`))
  }

  return { added, updated, skipped }
}
