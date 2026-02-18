import path from 'node:path'

import type { FictcnConfig } from './types'

export function getAliasPathKey(baseAlias: string): string {
  const normalized = normalizeRelativePath(baseAlias).replace(/\/+$/, '')
  return normalized.endsWith('/*') ? normalized : `${normalized}/*`
}

export function getAliasImportBase(baseAlias: string): string {
  const key = getAliasPathKey(baseAlias)
  return key.slice(0, -2)
}

export function getAliasPathTarget(config: FictcnConfig): string {
  return shouldUseSrcAliasTarget(config) ? 'src/*' : '*'
}

export function getTailwindContentGlobs(config: FictcnConfig): string[] {
  const directories = [config.componentsDir, getBlocksDir(config), config.libDir]
  return Array.from(new Set(directories.map(directory => `./${normalizeRelativePath(directory)}/**/*.{ts,tsx}`)))
}

export function getBlocksDir(config: FictcnConfig): string {
  const normalizedComponentsDir = normalizeRelativePath(config.componentsDir)
  const baseDir = normalizedComponentsDir.endsWith('/ui')
    ? path.posix.dirname(normalizedComponentsDir)
    : normalizedComponentsDir
  return `${baseDir}/blocks`
}

export function getThemesDir(config: FictcnConfig): string {
  const normalizedCssPath = normalizeRelativePath(config.css)
  const stylesDir = path.posix.dirname(normalizedCssPath)
  return `${stylesDir}/themes`
}

function shouldUseSrcAliasTarget(config: FictcnConfig): boolean {
  return [config.componentsDir, config.libDir].every(isSrcScopedPath)
}

function isSrcScopedPath(value: string): boolean {
  const normalized = normalizeRelativePath(value)
  return normalized === 'src' || normalized.startsWith('src/')
}

function normalizeRelativePath(value: string): string {
  return value.trim().replaceAll('\\', '/').replace(/^\.\/+/, '').replace(/\/+$/, '')
}
