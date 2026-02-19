import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG } from '../src/core/constants'
import { builtinBlocks, builtinComponents, builtinThemes } from '../src/registry/builtin'
import { listBuiltinBlockNames, listBuiltinComponentNames, listBuiltinThemeNames } from '../src/registry'

describe('builtin registry scale', () => {
  it('ships 206 builtin entries while preserving core Fict primitives', () => {
    const components = listBuiltinComponentNames()
    const blocks = listBuiltinBlockNames()
    const themes = listBuiltinThemeNames()

    expect(components.length + blocks.length + themes.length).toBe(206)

    expect(components).toContain('button')
    expect(blocks).toContain('auth/login-form')
    expect(themes).toContain('theme-slate')
  })

  it('ships Fict-native templates without Svelte artifacts', () => {
    const templateContext = {
      config: DEFAULT_CONFIG,
      imports: {
        cn: '@/lib/cn',
        variants: '@/lib/variants',
      },
      aliasFor: (relativePath: string) => `@/${relativePath}`,
      uiImport: (componentName: string) => `@/components/ui/${componentName}`,
    }

    const entries = [...builtinComponents, ...builtinBlocks, ...builtinThemes]

    for (const entry of entries) {
      for (const file of entry.files) {
        expect(file.path.endsWith('.svelte')).toBe(false)

        const content = file.content(templateContext)
        expect(content.includes('<script lang="ts">')).toBe(false)
        expect(content.includes('{@render')).toBe(false)
      }
    }
  })

  it('ships richer expanded templates instead of placeholder scaffolds', () => {
    const templateContext = {
      config: DEFAULT_CONFIG,
      imports: {
        cn: '@/lib/cn',
        variants: '@/lib/variants',
      },
      aliasFor: (relativePath: string) => `@/${relativePath}`,
      uiImport: (componentName: string) => `@/components/ui/${componentName}`,
    }

    const expandedComponents = builtinComponents.filter(entry =>
      ['alert', 'data-table', 'input-otp', 'sonner', 'utils'].includes(entry.name),
    )

    expect(expandedComponents.length).toBe(5)

    const renderedComponentSources = expandedComponents
      .flatMap(entry => entry.files)
      .map(file => file.content(templateContext))
      .join('\n')

    expect(renderedComponentSources).toContain('export function AlertTitle')
    expect(renderedComponentSources).toContain('export interface DataTableColumn')
    expect(renderedComponentSources).toContain('export function InputOTPSlot')
    expect(renderedComponentSources).toContain('useSonner')
    expect(renderedComponentSources).toContain('export function cn')

    const expandedBlocks = builtinBlocks.filter(entry => !entry.name.includes('/'))
    expect(expandedBlocks.length).toBeGreaterThan(0)

    for (const entry of expandedBlocks) {
      expect(entry.registryDependencies.length).toBeGreaterThan(0)
      const rendered = entry.files.map(file => file.content(templateContext)).join('\n')
      expect(rendered.includes('data-slot="block-')).toBe(false)
    }
  })
})
