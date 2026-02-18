import { getAliasImportBase, getAliasPathTarget, getBlocksDir, getThemesDir } from '../core/layout'
import type { FictcnConfig } from '../core/types'
import type { TemplateContext } from './types'

export function createTemplateContext(config: FictcnConfig): TemplateContext {
  return {
    config,
    imports: {
      cn: toAliasImport(config, `${config.libDir}/cn`),
      variants: toAliasImport(config, `${config.libDir}/variants`),
    },
    aliasFor: (relativePath: string) => toAliasImport(config, relativePath),
    uiImport: (componentName: string) => toAliasImport(config, `${config.componentsDir}/${componentName}`),
  }
}

export function resolveTemplatePath(templatePath: string, config: FictcnConfig): string {
  return templatePath
    .replaceAll('{{componentsDir}}', config.componentsDir)
    .replaceAll('{{blocksDir}}', getBlocksDir(config))
    .replaceAll('{{themesDir}}', getThemesDir(config))
    .replaceAll('{{libDir}}', config.libDir)
}

function toAliasImport(config: FictcnConfig, relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/').replace(/\.tsx?$/, '')
  const shouldStripSrcPrefix = getAliasPathTarget(config) === 'src/*'
  const withoutSrc = shouldStripSrcPrefix && normalized.startsWith('src/') ? normalized.slice(4) : normalized
  const base = getAliasImportBase(config.aliases.base)

  if (withoutSrc.length === 0) return base
  return `${base}/${withoutSrc}`
}
