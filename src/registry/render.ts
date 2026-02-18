import type { FictcnConfig } from '../core/types'
import { hashContent } from '../core/io'
import { createTemplateContext, resolveTemplatePath } from './context'
import { getBuiltinComponent } from './index'

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

  const context = createTemplateContext(config)

  return component.files.map(file => {
    const relativePath = resolveTemplatePath(file.path, config)
    const content = normalizeNewLine(file.content(context))
    return {
      component: component.name,
      relativePath,
      content,
      hash: hashContent(content),
    }
  })
}

function normalizeNewLine(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`
}
