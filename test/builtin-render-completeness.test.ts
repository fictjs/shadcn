import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG, RUNTIME_DEPENDENCIES } from '../src/core/constants'
import { getBuiltinComponent } from '../src/registry'
import { renderRegistryEntryFiles } from '../src/registry/render'
import { builtinBlocks, builtinComponents, builtinThemes } from '../src/registry/builtin'

describe('builtin registry render completeness', () => {
  it('renders every builtin component, block, and theme file successfully', () => {
    const entries = [...builtinComponents, ...builtinBlocks, ...builtinThemes]
    const seen = new Set<string>()
    let totalFiles = 0

    for (const entry of entries) {
      expect(seen.has(entry.name)).toBe(false)
      seen.add(entry.name)

      const renderedFiles = renderRegistryEntryFiles(entry, DEFAULT_CONFIG)
      expect(renderedFiles.length).toBeGreaterThan(0)

      for (const rendered of renderedFiles) {
        totalFiles += 1
        expect(rendered.relativePath.length).toBeGreaterThan(0)
        expect(rendered.relativePath.includes('{{')).toBe(false)
        expect(rendered.content.length).toBeGreaterThan(0)
        expect(rendered.content.endsWith('\n')).toBe(true)
        expect(rendered.hash).toMatch(/^[a-f0-9]{64}$/)
      }
    }

    expect(seen.size).toBe(206)
    expect(totalFiles).toBeGreaterThanOrEqual(206)
  })

  it('keeps non-Radix helpers self-contained', () => {
    const selfContainedEntries = [
      'calendar',
      'combobox',
      'command',
      'resizable',
      'skeleton',
      'toast',
    ]

    for (const name of selfContainedEntries) {
      const entry = getBuiltinComponent(name)
      expect(entry, name).toBeDefined()
      expect(entry?.dependencies).not.toContain('@fictjs/ui-primitives')

      const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
        .map(file => file.content)
        .join('\n')
      expect(source, name).not.toContain("from '@fictjs/ui-primitives'")
    }
  })

  it('renders the Badge API used by website examples', () => {
    const entry = getBuiltinComponent('badge')
    expect(entry).not.toBeNull()
    expect(entry!.dependencies).toContain('@fictjs/radix-ui')
    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')

    expect(source).toContain("import { Slot } from '@fictjs/radix-ui'")
    expect(source).toContain("ghost: 'border-transparent")
    expect(source).toContain("link: 'border-transparent")
    expect(source).toContain('asChild?: boolean')
    expect(source).toContain("return <span class={classValue} data-slot='badge'")
  })

  it('uses the published Radix umbrella for every primitive-backed component', () => {
    expect(RUNTIME_DEPENDENCIES).toContain('@fictjs/radix-ui')
    expect(RUNTIME_DEPENDENCIES).not.toContain('@fictjs/ui-primitives')

    for (const entry of builtinComponents) {
      const source = renderRegistryEntryFiles(entry, DEFAULT_CONFIG)
        .map(file => file.content)
        .join('\n')

      expect(entry.dependencies, entry.name).not.toContain('@fictjs/ui-primitives')
      expect(source, entry.name).not.toContain("from '@fictjs/ui-primitives'")

      if (source.includes("from '@fictjs/radix-ui'")) {
        expect(entry.dependencies, entry.name).toContain('@fictjs/radix-ui')
      }
      if (entry.dependencies.includes('@fictjs/radix-ui')) {
        expect(source, entry.name).toContain("from '@fictjs/radix-ui'")
      }
    }
  })

  it('supports every Button API used by the website examples', () => {
    const entry = getBuiltinComponent('button')
    expect(entry?.dependencies).toContain('@fictjs/radix-ui')

    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')
    for (const size of ['xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg']) {
      expect(source).toContain(`${size.includes('-') ? `'${size}'` : size}:`)
    }
    expect(source).toContain('asChild?: boolean')
    expect(source).toContain('<Slot.Root')
    expect(source).toContain("data-slot='button'")
  })
})
