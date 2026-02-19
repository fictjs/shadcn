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
})
