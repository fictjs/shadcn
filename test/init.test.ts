import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { runInit } from '../src/commands/init'
import { CONFIG_FILE } from '../src/core/constants'

describe('runInit', () => {
  it('writes baseline config and utility files', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-init-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })

    const config = await readFile(path.join(cwd, CONFIG_FILE), 'utf8')
    const cnFile = await readFile(path.join(cwd, 'src/lib/cn.ts'), 'utf8')
    const globals = await readFile(path.join(cwd, 'src/styles/globals.css'), 'utf8')
    const tsconfig = await readFile(path.join(cwd, 'tsconfig.json'), 'utf8')

    expect(config).toContain('"style": "tailwind-css-vars"')
    expect(cnFile).toContain('twMerge')
    expect(globals).toContain('@fictcn tokens:start')
    expect(tsconfig).toContain('"@/*"')
  })
})
