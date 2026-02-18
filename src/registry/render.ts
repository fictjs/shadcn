import type { FictcnConfig } from '../core/types'
import { hashContent } from '../core/io'
import { ensureTrailingNewline } from '../core/text'
import { createTemplateContext, resolveTemplatePath } from './context'
import { getBuiltinComponent } from './index'
import type { RegistryEntry } from './types'

export interface RenderedRegistryFile {
  component: string
  relativePath: string
  content: string
  hash: string
}

export function renderComponentFiles(componentName: string, config: FictcnConfig): RenderedRegistryFile[] {
  const component = getBuiltinComponent(componentName)
  if (!component) {
    throw new Error(`Unknown registry component: ${componentName}`)
  }

  return renderRegistryEntryFiles(component, config)
}

export function renderRegistryEntryFiles(entry: RegistryEntry, config: FictcnConfig): RenderedRegistryFile[] {
  const context = createTemplateContext(config)

  return entry.files.map(file => {
    const relativePath = resolveTemplatePath(file.path, config)
    const content = ensureTrailingNewline(file.content(context))
    return {
      component: entry.name,
      relativePath,
      content,
      hash: hashContent(content),
    }
  })
}
