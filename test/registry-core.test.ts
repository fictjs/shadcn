import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG } from '../src/core/constants'
import { createTemplateContext, resolveTemplatePath } from '../src/registry/context'
import {
  getBuiltinBlock,
  getBuiltinComponent,
  getBuiltinTheme,
  listBuiltinBlockNames,
  listBuiltinBlocks,
  listBuiltinComponentNames,
  listBuiltinThemeNames,
  listBuiltinThemes,
  resolveBuiltinBlockGraph,
  resolveBuiltinComponentGraph,
} from '../src/registry/index'
import { renderComponentFiles, renderRegistryEntryFiles } from '../src/registry/render'
import type { RegistryEntry } from '../src/registry/types'

describe('registry core helpers', () => {
  it('lists and resolves builtin components with dependency ordering', () => {
    const names = listBuiltinComponentNames()
    expect(names.length).toBeGreaterThan(0)
    expect(names).toContain('button')
    expect(names).toEqual([...names].sort((left, right) => left.localeCompare(right)))

    const resolved = resolveBuiltinComponentGraph(['dialog']).map(entry => entry.name)
    expect(resolved).toContain('button')
    expect(resolved).toContain('dialog')
    expect(resolved.indexOf('button')).toBeLessThan(resolved.indexOf('dialog'))

    expect(getBuiltinComponent('not-present')).toBeNull()
    expect(() => resolveBuiltinComponentGraph(['missing-component'])).toThrow(
      'Unknown registry component: missing-component',
    )
  })

  it('lists and resolves builtin blocks/themes and keeps exported arrays immutable', () => {
    const blockNames = listBuiltinBlockNames()
    const themeNames = listBuiltinThemeNames()
    expect(blockNames).toContain('auth/login-form')
    expect(themeNames).toContain('theme-slate')

    const resolvedBlocks = resolveBuiltinBlockGraph(['auth/login-form']).map(entry => entry.name)
    expect(resolvedBlocks).toContain('auth/login-form')
    expect(() => resolveBuiltinBlockGraph(['missing-block'])).toThrow('Unknown registry block: missing-block')

    expect(getBuiltinBlock('not-present')).toBeNull()
    expect(getBuiltinTheme('not-present')).toBeNull()

    const exportedBlocks = listBuiltinBlocks()
    const exportedThemes = listBuiltinThemes()
    const blockLength = exportedBlocks.length
    const themeLength = exportedThemes.length
    exportedBlocks.pop()
    exportedThemes.pop()

    expect(listBuiltinBlocks().length).toBe(blockLength)
    expect(listBuiltinThemes().length).toBe(themeLength)
  })

  it('builds template context aliases and resolves template placeholders', () => {
    const context = createTemplateContext(DEFAULT_CONFIG)

    expect(context.imports.cn).toBe('@/lib/cn')
    expect(context.imports.variants).toBe('@/lib/variants')
    expect(context.uiImport('button')).toBe('@/components/ui/button')
    expect(context.aliasFor('src/lib/helpers.ts')).toBe('@/lib/helpers')
    expect(context.aliasFor('')).toBe('@')

    expect(
      resolveTemplatePath(
        '{{componentsDir}}/button.tsx|{{blocksDir}}/card.tsx|{{themesDir}}/theme.css|{{libDir}}/utils.ts',
        DEFAULT_CONFIG,
      ),
    ).toBe('src/components/ui/button.tsx|src/components/blocks/card.tsx|src/styles/themes/theme.css|src/lib/utils.ts')
  })

  it('renders registry files with normalized paths, trailing newlines, and hashes', () => {
    const renderedButton = renderComponentFiles('button', DEFAULT_CONFIG)
    expect(renderedButton.length).toBeGreaterThan(0)
    expect(renderedButton.every(file => file.relativePath.includes('button'))).toBe(true)
    expect(renderedButton.every(file => file.content.endsWith('\n'))).toBe(true)
    expect(renderedButton.every(file => file.hash.length === 64)).toBe(true)

    const customEntry: RegistryEntry = {
      name: 'custom-util',
      type: 'ui-component',
      version: '1.0.0',
      description: 'custom entry',
      dependencies: [],
      registryDependencies: [],
      files: [
        {
          path: '{{libDir}}/custom-util.ts',
          content: () => 'export const customUtil = true',
        },
      ],
    }

    const renderedCustom = renderRegistryEntryFiles(customEntry, DEFAULT_CONFIG)
    expect(renderedCustom).toHaveLength(1)
    expect(renderedCustom[0].relativePath).toBe('src/lib/custom-util.ts')
    expect(renderedCustom[0].content).toBe('export const customUtil = true\n')
    expect(renderedCustom[0].hash).toHaveLength(64)

    expect(() => renderComponentFiles('missing-component', DEFAULT_CONFIG)).toThrow(
      'Unknown registry component: missing-component',
    )
  })
})
