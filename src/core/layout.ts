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
