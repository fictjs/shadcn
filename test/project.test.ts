import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findProjectRoot } from '../src/core/project'

describe('findProjectRoot', () => {
  it('resolves nearest parent containing package.json', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'fictcn-project-root-'))
    const nested = path.join(root, 'src', 'components')
    await mkdir(nested, { recursive: true })
    await writeFile(path.join(root, 'package.json'), '{"name":"sandbox"}\n', 'utf8')

    const projectRoot = await findProjectRoot(nested)
    expect(projectRoot).toBe(root)
  })

  it('throws when package.json cannot be found', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-project-missing-'))

    await expect(findProjectRoot(cwd)).rejects.toThrow('Could not find package.json')
  })
})
