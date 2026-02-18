import type { FictcnConfig } from '../core/types'

export type RegistryEntryType = 'ui-component' | 'block' | 'theme'

export interface TemplateContext {
  config: FictcnConfig
  imports: {
    cn: string
    variants: string
  }
  aliasFor: (relativePath: string) => string
  uiImport: (componentName: string) => string
}

export interface RegistryTemplateFile {
  path: string
  content: (context: TemplateContext) => string
}

export interface RegistryEntry {
  name: string
  version: string
  type: RegistryEntryType
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: RegistryTemplateFile[]
}
