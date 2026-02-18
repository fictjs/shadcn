import path from 'node:path'

import colors from 'picocolors'

import { assertSupportedRegistry, ensureConfigFile, loadConfig, loadLock, saveLock } from '../core/config'
import { hashContent, readTextIfExists, upsertTextFile } from '../core/io'
import { ensureTrailingNewline } from '../core/text'
import { findProjectRoot } from '../core/project'
import type { AddResult, LockEntry } from '../core/types'
import { createTemplateContext, resolveTemplatePath } from '../registry/context'
import { getBuiltinTheme, listBuiltinThemeNames } from '../registry'

export interface ThemeApplyOptions {
  themes: string[]
  cwd?: string
  overwrite?: boolean
  dryRun?: boolean
}

export async function runThemeApply(options: ThemeApplyOptions): Promise<AddResult> {
  if (options.themes.length === 0) {
    throw new Error('Please provide at least one theme name.')
  }

  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  const dryRun = Boolean(options.dryRun)
  assertSupportedRegistry(config)
  if (!dryRun) {
    await ensureConfigFile(projectRoot, config)
  }

  const context = createTemplateContext(config)
  const lock = await loadLock(projectRoot)
  let lockChanged = false

  const added: string[] = []
  const updated: string[] = []
  const skipped: string[] = []

  const globalsCssPath = path.resolve(projectRoot, config.css)
  const globalsCssRaw = (await readTextIfExists(globalsCssPath)) ?? ''
  let nextGlobals = globalsCssRaw

  for (const themeName of options.themes) {
    const entry = getBuiltinTheme(themeName)
    if (!entry) {
      throw new Error(`Unknown theme: ${themeName}. Available themes: ${listBuiltinThemeNames().join(', ')}`)
    }

    const plannedFiles = entry.files.map(file => {
      const relativePath = resolveTemplatePath(file.path, config)
      const content = ensureTrailingNewline(file.content(context))
      return { relativePath, content }
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
      console.log(colors.yellow(`Skipped theme ${entry.name}; conflicting files:`))
      for (const conflict of conflicts) {
        console.log(colors.yellow(`  - ${conflict}`))
      }
      continue
    }

    const fileHashes: Record<string, string> = {}
    for (const file of plannedFiles) {
      if (!dryRun) {
        await upsertTextFile(projectRoot, file.relativePath, file.content)
      }
      fileHashes[file.relativePath] = hashContent(file.content)

      const importPath = toImportPath(config.css, file.relativePath)
      const importLine = `@import "${importPath}";`
      if (!nextGlobals.includes(importLine)) {
        nextGlobals = insertImportLine(nextGlobals, importLine)
      }
    }

    const lockEntry: LockEntry = {
      name: entry.name,
      version: entry.version,
      source: 'builtin',
      installedAt: new Date().toISOString(),
      files: fileHashes,
    }

    if (lock.themes[entry.name]) {
      updated.push(entry.name)
    } else {
      added.push(entry.name)
    }

    if (!dryRun) {
      lock.themes[entry.name] = lockEntry
      lockChanged = true
    }
  }

  if (!dryRun && nextGlobals !== globalsCssRaw && nextGlobals.length > 0) {
    await upsertTextFile(projectRoot, config.css, ensureTrailingNewline(nextGlobals))
  }

  if (!dryRun && lockChanged) {
    await saveLock(projectRoot, lock)
  }

  if (added.length > 0) {
    console.log(colors.green(`${dryRun ? 'Would add themes' : 'Themes added'}: ${added.join(', ')}`))
  }
  if (updated.length > 0) {
    console.log(colors.green(`${dryRun ? 'Would update themes' : 'Themes updated'}: ${updated.join(', ')}`))
  }
  if (skipped.length > 0) {
    console.log(colors.yellow(`${dryRun ? 'Would skip themes' : 'Themes skipped'}: ${skipped.join(', ')}`))
  }

  return { added, updated, skipped }
}

function toImportPath(from: string, to: string): string {
  const relative = path.posix.relative(path.posix.dirname(from), to)
  if (relative.startsWith('.')) return relative
  return `./${relative}`
}

function insertImportLine(globalsCss: string, importLine: string): string {
  const lines = globalsCss.split('\n')
  const anchorIndex = lines.findIndex(line => line.trim() === '@tailwind utilities;')
  if (anchorIndex === -1) {
    lines.unshift(importLine)
    return lines.join('\n')
  }

  lines.splice(anchorIndex + 1, 0, importLine)
  return lines.join('\n')
}
