import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  runInit: vi.fn(),
  runAdd: vi.fn(),
  runDiff: vi.fn(),
  runUpdate: vi.fn(),
  runRemove: vi.fn(),
  runDoctor: vi.fn(),
  runList: vi.fn(),
  runListFromRegistry: vi.fn(),
  runSearchFromRegistry: vi.fn(),
  runBlocksInstall: vi.fn(),
  runThemeApply: vi.fn(),
}))

vi.mock('../src/commands/init', () => ({ runInit: mocked.runInit }))
vi.mock('../src/commands/add', () => ({ runAdd: mocked.runAdd }))
vi.mock('../src/commands/diff', () => ({ runDiff: mocked.runDiff }))
vi.mock('../src/commands/update', () => ({ runUpdate: mocked.runUpdate }))
vi.mock('../src/commands/remove', () => ({ runRemove: mocked.runRemove }))
vi.mock('../src/commands/doctor', () => ({ runDoctor: mocked.runDoctor }))
vi.mock('../src/commands/list', () => ({
  runList: mocked.runList,
  runListFromRegistry: mocked.runListFromRegistry,
}))
vi.mock('../src/commands/search', () => ({ runSearchFromRegistry: mocked.runSearchFromRegistry }))
vi.mock('../src/commands/blocks', () => ({ runBlocksInstall: mocked.runBlocksInstall }))
vi.mock('../src/commands/theme', () => ({ runThemeApply: mocked.runThemeApply }))

import { main } from '../src/cli/main'

describe('CLI main command routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.runDiff.mockResolvedValue({ changed: [], patches: [] })
    mocked.runDoctor.mockResolvedValue({ ok: true, issues: [] })
    mocked.runList.mockReturnValue('builtin-list-output')
    mocked.runListFromRegistry.mockResolvedValue('remote-list-output')
    mocked.runSearchFromRegistry.mockResolvedValue('remote-search-output')
    process.exitCode = undefined
  })

  afterEach(() => {
    process.exitCode = undefined
  })

  it('routes add command arguments and flags', async () => {
    await main(['node', 'fictcn', 'add', 'button', 'dialog', '--overwrite', '--skip-install', '--dry-run'])

    expect(mocked.runAdd).toHaveBeenCalledWith({
      components: ['button', 'dialog'],
      overwrite: true,
      skipInstall: true,
      dryRun: true,
    })
  })

  it('routes init and update command flags', async () => {
    await main(['node', 'fictcn', 'init', '--force', '--skip-install', '--dry-run'])
    expect(mocked.runInit).toHaveBeenCalledWith({
      force: true,
      skipInstall: true,
      dryRun: true,
    })

    await main(['node', 'fictcn', 'update', 'button', '--force', '--skip-install', '--dry-run'])
    expect(mocked.runUpdate).toHaveBeenCalledWith({
      components: ['button'],
      force: true,
      skipInstall: true,
      dryRun: true,
    })
  })

  it('routes blocks add and theme apply commands', async () => {
    await main(['node', 'fictcn', 'blocks', 'add', 'auth/login-form', '--overwrite', '--skip-install', '--dry-run'])
    expect(mocked.runBlocksInstall).toHaveBeenCalledWith({
      blocks: ['auth/login-form'],
      overwrite: true,
      skipInstall: true,
      dryRun: true,
    })

    await main(['node', 'fictcn', 'theme', 'apply', 'theme-slate', '--overwrite', '--dry-run'])
    expect(mocked.runThemeApply).toHaveBeenCalledWith({
      themes: ['theme-slate'],
      overwrite: true,
      dryRun: true,
    })
  })

  it('routes remove alias uninstall', async () => {
    await main(['node', 'fictcn', 'uninstall', 'button', 'theme-slate', '--force', '--dry-run'])

    expect(mocked.runRemove).toHaveBeenCalledWith({
      entries: ['button', 'theme-slate'],
      force: true,
      dryRun: true,
    })
  })

  it('prints empty diff hint when no patches are returned', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main(['node', 'fictcn', 'diff', 'button'])

    expect(mocked.runDiff).toHaveBeenCalledWith({ components: ['button'] })
    expect(logSpy).toHaveBeenCalledWith('No registry drift detected.')
    logSpy.mockRestore()
  })

  it('prints diff patches when drift exists', async () => {
    mocked.runDiff.mockResolvedValue({
      changed: ['button'],
      patches: ['@@ -1 +1 @@\n-old\n+new'],
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main(['node', 'fictcn', 'diff', 'button'])

    expect(logSpy).toHaveBeenCalledWith('@@ -1 +1 @@\n-old\n+new')
    logSpy.mockRestore()
  })

  it('prints empty search hint when no remote matches are returned', async () => {
    mocked.runSearchFromRegistry.mockResolvedValue('')
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main(['node', 'fictcn', 'search', 'nope'])

    expect(mocked.runSearchFromRegistry).toHaveBeenCalledWith('nope', {
      registry: undefined,
    })
    expect(logSpy).toHaveBeenCalledWith('No registry entries matched the query.')
    logSpy.mockRestore()
  })

  it('sets non-zero exit code when doctor reports errors', async () => {
    mocked.runDoctor.mockResolvedValue({ ok: false, issues: [] })

    await main(['node', 'fictcn', 'doctor'])

    expect(process.exitCode).toBe(1)
  })

  it('routes remote list command options and prints output', async () => {
    mocked.runListFromRegistry.mockResolvedValue('[{"kind":"component","name":"button"}]')
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main([
      'node',
      'fictcn',
      'list',
      '--type',
      'components',
      '--registry',
      'https://example.com/registry',
      '--json',
    ])

    expect(mocked.runListFromRegistry).toHaveBeenCalledWith({
      json: true,
      type: 'components',
      registry: 'https://example.com/registry',
    })
    expect(logSpy).toHaveBeenCalledWith('[{"kind":"component","name":"button"}]')
    logSpy.mockRestore()
  })

  it('routes blocks list and theme list through builtin listing', async () => {
    mocked.runList
      .mockReturnValueOnce('block-list-output')
      .mockReturnValueOnce('theme-list-output')
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main(['node', 'fictcn', 'blocks', 'list'])
    await main(['node', 'fictcn', 'theme', 'list'])

    expect(mocked.runList).toHaveBeenNthCalledWith(1, { type: 'blocks' })
    expect(mocked.runList).toHaveBeenNthCalledWith(2, { type: 'themes' })
    expect(logSpy).toHaveBeenNthCalledWith(1, 'block-list-output')
    expect(logSpy).toHaveBeenNthCalledWith(2, 'theme-list-output')
    logSpy.mockRestore()
  })
})
