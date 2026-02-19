import { describe, expect, it, vi } from 'vitest'

import {
  createPostcssConfig,
  createTailwindConfig,
  createTsconfigPathPatch,
  patchTailwindConfig,
} from '../src/core/templates'

describe('template helpers', () => {
  it('creates postcss config using @tailwindcss/postcss', () => {
    const config = createPostcssConfig()
    expect(config).toContain("'@tailwindcss/postcss'")
    expect(config).toContain('autoprefixer')
  })

  it('creates both ESM and CJS tailwind configs', () => {
    const esm = createTailwindConfig(['./src/a.tsx'], 'esm')
    const cjs = createTailwindConfig(['./src/b.tsx'], 'cjs')

    expect(esm).toContain("import animate from 'tailwindcss-animate'")
    expect(esm).toContain("content: ['./src/a.tsx']")
    expect(cjs).toContain("plugins: [require('tailwindcss-animate')]")
    expect(cjs).toContain("content: ['./src/b.tsx']")
  })

  it('patches tsconfig paths when compilerOptions are missing', () => {
    const patched = createTsconfigPathPatch('{}', '~/*', '*')
    expect(patched).not.toBeNull()
    expect(patched).toContain('"compilerOptions"')
    expect(patched).toContain('"baseUrl": "."')
    expect(patched).toContain('"~/*"')
    expect(patched).toContain('"*"')
  })

  it('returns null for invalid tsconfig JSON', () => {
    const patched = createTsconfigPathPatch('{ invalid json }')
    expect(patched).toBeNull()
  })

  it('returns null when jsonc parser throws unexpectedly', async () => {
    vi.resetModules()
    vi.doMock('jsonc-parser', () => ({
      parse: () => {
        throw new Error('parse crash')
      },
    }))

    try {
      const mod = await import('../src/core/templates')
      expect(mod.createTsconfigPathPatch('{"compilerOptions":{}}')).toBeNull()
    } finally {
      vi.doUnmock('jsonc-parser')
    }
  })

  it('injects plugins array when missing from tailwind config', () => {
    const patchedEsm = patchTailwindConfig(
      "const config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, darkMode: ['class'] }",
      ['./src/components/ui/**/*.{ts,tsx}'],
      'esm',
    )
    expect(patchedEsm).toContain("import animate from 'tailwindcss-animate'")
    expect(patchedEsm).toContain('plugins: [animate]')
    expect(patchedEsm).toContain("'./src/components/ui/**/*.{ts,tsx}'")

    const patchedCjs = patchTailwindConfig(
      "module.exports = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, darkMode: ['class'] }",
      ['./src/components/ui/**/*.{ts,tsx}'],
      'cjs',
    )
    expect(patchedCjs).toContain("plugins: [require('tailwindcss-animate')]")
    expect(patchedCjs).toContain("'./src/components/ui/**/*.{ts,tsx}'")
  })
})
