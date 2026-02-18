import path from 'node:path'

import colors from 'picocolors'

import { assertSupportedRegistry, loadConfig, loadLock, saveConfig, saveLock } from '../core/config'
import { hashContent, readTextIfExists, upsertTextFile } from '../core/io'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import type { AddResult, LockEntry } from '../core/types'
import { createTemplateContext, resolveTemplatePath } from '../registry/context'
import { resolveBuiltinComponentGraph } from '../registry'

export interface AddOptions {
  components: string[]
  cwd?: string
  overwrite?: boolean
  skipInstall?: boolean
}

export async function runAdd(options: AddOptions): Promise<AddResult> {
  if (options.components.length === 0) {
    throw new Error('Please provide at least one component name.')
  }

  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  assertSupportedRegistry(config)
  await saveConfig(projectRoot, config)

  const resolved = resolveBuiltinComponentGraph(options.components)
  const context = createTemplateContext(config)
  const lock = await loadLock(projectRoot)

  const dependencySet = new Set<string>()
  const added: string[] = []
  const updated: string[] = []
  const skipped: string[] = []

  for (const entry of resolved) {
    entry.dependencies.forEach(dependency => dependencySet.add(dependency))

    const plannedFiles = entry.files.map(file => {
      const relativePath = resolveTemplatePath(file.path, config)
      const content = normalizeNewLine(file.content(context))
      return {
        relativePath,
        content,
      }
    })

    const conflictPaths: string[] = []
    if (!options.overwrite) {
      for (const file of plannedFiles) {
        const absolutePath = path.resolve(projectRoot, file.relativePath)
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

    if (lock.components[entry.name]) {
      updated.push(entry.name)
    } else {
      added.push(entry.name)
    }

    lock.components[entry.name] = lockEntry
  }

  await saveLock(projectRoot, lock)

  if (!options.skipInstall) {
    const dependencies = Array.from(dependencySet).sort((left, right) => left.localeCompare(right))

    if (dependencies.length > 0) {
      const packageManager = await detectPackageManager(projectRoot)
      console.log(colors.cyan(`Installing component dependencies via ${packageManager}...`))
      await runPackageManagerInstall(packageManager, projectRoot, dependencies, false)
    }
  }

  if (added.length > 0) {
    console.log(colors.green(`Added: ${added.join(', ')}`))
  }
  if (updated.length > 0) {
    console.log(colors.green(`Updated: ${updated.join(', ')}`))
  }
  if (skipped.length > 0) {
    console.log(colors.yellow(`Skipped: ${skipped.join(', ')}`))
  }

  return { added, updated, skipped }
}

function normalizeNewLine(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`
}
