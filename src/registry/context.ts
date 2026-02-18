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
  return templatePath.replaceAll('{{componentsDir}}', config.componentsDir).replaceAll('{{libDir}}', config.libDir)
}

function toAliasImport(config: FictcnConfig, relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/').replace(/\.tsx?$/, '')
  const withoutSrc = normalized.startsWith('src/') ? normalized.slice(4) : normalized
  const base = config.aliases.base.replace(/\/$/, '')

  if (withoutSrc.length === 0) return base
  return `${base}/${withoutSrc}`
}
