import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'
import * as ts from 'typescript'

import { runAdd } from '../src/commands/add'
import { runBlocksInstall } from '../src/commands/blocks'
import { runDiff } from '../src/commands/diff'
import { runInit } from '../src/commands/init'
import { runRemove } from '../src/commands/remove'
import { runThemeApply } from '../src/commands/theme'
import { runUpdate } from '../src/commands/update'
import { LOCK_FILE } from '../src/core/constants'

describe('expanded registry entries', () => {
  it('installs expanded components, blocks, and themes with usable templates', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-expanded-install-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })

    const addResult = await runAdd({
      cwd,
      components: ['alert', 'calendar', 'chart', 'command', 'data-table', 'drawer', 'input-otp', 'sidebar', 'sonner', 'utils'],
      skipInstall: true,
    })

    expect(addResult.added).toContain('alert')
    expect(addResult.added).toContain('command')
    expect(addResult.added).toContain('input-otp')
    expect(addResult.added).toContain('sonner')
    expect(addResult.added).toContain('utils')
    expect(addResult.added).toContain('sheet')
    expect(addResult.added).toContain('table')
    expect(addResult.added).toContain('toast')

    const alertSource = await readFile(path.join(cwd, 'src/components/ui/alert.tsx'), 'utf8')
    const commandSource = await readFile(path.join(cwd, 'src/components/ui/command.tsx'), 'utf8')
    const inputOtpSource = await readFile(path.join(cwd, 'src/components/ui/input-otp.tsx'), 'utf8')
    const chartSource = await readFile(path.join(cwd, 'src/components/ui/chart.tsx'), 'utf8')
    const drawerSource = await readFile(path.join(cwd, 'src/components/ui/drawer.tsx'), 'utf8')
    const utilsSource = await readFile(path.join(cwd, 'src/lib/utils.ts'), 'utf8')

    expect(alertSource).toContain('export function AlertTitle')
    expect(commandSource).toContain('CommandPaletteRoot')
    expect(inputOtpSource).toContain('export function InputOTPSlot')
    expect(chartSource).toContain('export interface ChartPoint')
    expect(drawerSource).toContain('Sheet as Drawer')
    expect(utilsSource).toContain('export function cn')

    assertTranspileOk(alertSource, 'alert.tsx')
    assertTranspileOk(commandSource, 'command.tsx')
    assertTranspileOk(inputOtpSource, 'input-otp.tsx')
    assertTranspileOk(chartSource, 'chart.tsx')

    const blockResult = await runBlocksInstall({
      cwd,
      blocks: ['calendar-01', 'chart-area-default', 'dashboard-01', 'login-01', 'otp-01', 'sidebar-01'],
      skipInstall: true,
    })

    expect(blockResult.added).toContain('calendar-01')
    expect(blockResult.added).toContain('chart-area-default')
    expect(blockResult.added).toContain('dashboard-01')
    expect(blockResult.added).toContain('login-01')
    expect(blockResult.added).toContain('otp-01')
    expect(blockResult.added).toContain('sidebar-01')

    const calendarBlock = await readFile(path.join(cwd, 'src/components/blocks/calendar-01.tsx'), 'utf8')
    const chartBlock = await readFile(path.join(cwd, 'src/components/blocks/chart-area-default.tsx'), 'utf8')
    const dashboardBlock = await readFile(path.join(cwd, 'src/components/blocks/dashboard-01.tsx'), 'utf8')

    expect(calendarBlock).toContain('export function Calendar01Block')
    expect(chartBlock).toContain('export function ChartAreaDefaultBlock')
    expect(dashboardBlock).toContain('export function Dashboard01Block')

    assertTranspileOk(calendarBlock, 'calendar-01.tsx')
    assertTranspileOk(chartBlock, 'chart-area-default.tsx')
    assertTranspileOk(dashboardBlock, 'dashboard-01.tsx')

    const themeResult = await runThemeApply({ cwd, themes: ['init'] })
    expect(themeResult.added).toContain('init')

    const initTheme = await readFile(path.join(cwd, 'src/styles/themes/init.css'), 'utf8')
    const globals = await readFile(path.join(cwd, 'src/styles/globals.css'), 'utf8')
    const lockRaw = await readFile(path.join(cwd, LOCK_FILE), 'utf8')

    expect(initTheme).toContain('Expanded built-in theme tokens')
    expect(globals).toContain('@import "./themes/init.css";')
    expect(lockRaw).toContain('"alert"')
    expect(lockRaw).toContain('"calendar-01"')
    expect(lockRaw).toContain('"init"')
  })

  it('supports diff, guarded update, forced update, and remove for expanded entries', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-expanded-maintenance-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')

    await runInit({ cwd, skipInstall: true })
    await runAdd({ cwd, components: ['alert'], skipInstall: true })
    await runBlocksInstall({ cwd, blocks: ['calendar-01'], skipInstall: true })
    await runThemeApply({ cwd, themes: ['init'] })

    const alertPath = path.join(cwd, 'src/components/ui/alert.tsx')
    await writeFile(alertPath, 'local edits\n', 'utf8')

    const diff = await runDiff({ cwd, components: ['alert'] })
    expect(diff.changed).toContain('alert')
    expect(diff.patches.join('\n')).toContain('registry/alert@0.3.0')

    const guardedUpdate = await runUpdate({ cwd, components: ['alert'], skipInstall: true })
    expect(guardedUpdate.skipped).toContain('alert')

    const forcedUpdate = await runUpdate({ cwd, components: ['alert'], force: true, skipInstall: true })
    expect(forcedUpdate.updated).toContain('alert')

    const refreshedAlert = await readFile(alertPath, 'utf8')
    expect(refreshedAlert).toContain('alertVariants')

    const removeResult = await runRemove({ cwd, entries: ['alert', 'calendar-01', 'init'] })
    expect(removeResult.removed).toContain('alert')
    expect(removeResult.removed).toContain('calendar-01')
    expect(removeResult.removed).toContain('init')

    expect(await fileExists(path.join(cwd, 'src/components/ui/alert.tsx'))).toBe(false)
    expect(await fileExists(path.join(cwd, 'src/components/blocks/calendar-01.tsx'))).toBe(false)
    expect(await fileExists(path.join(cwd, 'src/styles/themes/init.css'))).toBe(false)
  })
})

function assertTranspileOk(source: string, fileName: string): void {
  const result = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      jsxImportSource: 'fict',
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  })

  const diagnostics = (result.diagnostics ?? []).filter(
    diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
  )

  if (diagnostics.length === 0) {
    return
  }

  const messages = diagnostics
    .map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    .join('\n')

  throw new Error(`Failed to transpile ${fileName}:\n${messages}`)
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}
