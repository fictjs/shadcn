import { describe, expect, it } from 'vitest'

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
})
