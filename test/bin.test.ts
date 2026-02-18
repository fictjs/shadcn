import { afterEach, describe, expect, it, vi } from 'vitest'

import { handleCliError } from '../src/bin/fictcn'

describe('bin error handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    process.exitCode = undefined
  })

  it('prints concise message and sets non-zero exit code', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    handleCliError(new Error('boom'))

    expect(spy).toHaveBeenCalledWith('Error: boom')
    expect(process.exitCode).toBe(1)
  })
})
