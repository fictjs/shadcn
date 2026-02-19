import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG } from '../src/core/constants'
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
})
