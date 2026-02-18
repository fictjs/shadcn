import path from 'node:path'

import colors from 'picocolors'

import { DEV_DEPENDENCIES, RUNTIME_DEPENDENCIES } from '../core/constants'
import { loadConfig, saveConfig } from '../core/config'
import { exists, readJsonFile, readTextIfExists, upsertTextFile } from '../core/io'
import { getAliasPathKey, getAliasPathTarget, getTailwindContentGlobs } from '../core/layout'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import {
  createCnUtility,
  createGlobalsCss,
  createPostcssConfig,
  createTailwindConfig,
  type TailwindConfigModuleFormat,
  createTsconfigPathPatch,
  createVariantsUtility,
  patchTailwindConfig,
} from '../core/templates'
import type { FictcnConfig, InitOptions } from '../core/types'

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)
  const dryRun = Boolean(options.dryRun)

  if (!dryRun) {
    await saveConfig(projectRoot, config)
  }

  if (!dryRun) {
    await upsertTextFile(projectRoot, config.css, createGlobalsCss())
    await upsertTextFile(projectRoot, path.posix.join(config.libDir, 'cn.ts'), createCnUtility())
    await upsertTextFile(
      projectRoot,
      path.posix.join(config.libDir, 'variants.ts'),
      createVariantsUtility(),
    )
  }

  await ensureTsconfigAlias(projectRoot, config, dryRun)
  await ensureTailwindConfig(projectRoot, config, dryRun)
  await ensurePostcssConfig(projectRoot, dryRun)

  if (!options.skipInstall && !dryRun) {
    const packageManager = await detectPackageManager(projectRoot)

    console.log(colors.cyan(`Installing dependencies via ${packageManager}...`))
    await runPackageManagerInstall(packageManager, projectRoot, RUNTIME_DEPENDENCIES, false)
    await runPackageManagerInstall(packageManager, projectRoot, DEV_DEPENDENCIES, true)
  }

  if (dryRun) {
    console.log(colors.green('fictcn init dry-run completed. No files were written.'))
  } else {
    console.log(colors.green('fictcn init completed.'))
  }
}

async function ensureTsconfigAlias(projectRoot: string, config: FictcnConfig, dryRun: boolean): Promise<void> {
  const aliasPathKey = getAliasPathKey(config.aliases.base)
  const aliasPathTarget = getAliasPathTarget(config)
  const tsconfigPath = path.resolve(projectRoot, 'tsconfig.json')
  const existing = await readTextIfExists(tsconfigPath)

  if (existing === null) {
    const fallback = {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          [aliasPathKey]: [aliasPathTarget],
        },
      },
    }
    if (!dryRun) {
      await upsertTextFile(projectRoot, 'tsconfig.json', `${JSON.stringify(fallback, null, 2)}\n`)
    }
    return
  }

  const patched = createTsconfigPathPatch(existing, aliasPathKey, aliasPathTarget)
  if (patched === null) {
    console.log(colors.yellow('Warning: could not patch tsconfig.json automatically.'))
    return
  }

  if (!dryRun) {
    await upsertTextFile(projectRoot, 'tsconfig.json', patched)
  }
}

async function ensureTailwindConfig(projectRoot: string, config: FictcnConfig, dryRun: boolean): Promise<void> {
  const contentGlobs = getTailwindContentGlobs(config)
  const tailwindConfigPath = config.tailwindConfig
  const absolutePath = path.resolve(projectRoot, tailwindConfigPath)
  const packageType = await readPackageModuleType(projectRoot)
  const defaultModuleFormat = inferTailwindModuleFormatFromPath(tailwindConfigPath, packageType)
  if (!(await exists(absolutePath))) {
    if (!dryRun) {
      await upsertTextFile(projectRoot, tailwindConfigPath, createTailwindConfig(contentGlobs, defaultModuleFormat))
    }
    return
  }

  const current = await readTextIfExists(absolutePath)
  if (current === null) {
    if (!dryRun) {
      await upsertTextFile(projectRoot, tailwindConfigPath, createTailwindConfig(contentGlobs, defaultModuleFormat))
    }
    return
  }

  const moduleFormat = detectTailwindModuleFormatFromContent(current) ?? defaultModuleFormat
  if (!dryRun) {
    await upsertTextFile(projectRoot, tailwindConfigPath, patchTailwindConfig(current, contentGlobs, moduleFormat))
  }
}

async function ensurePostcssConfig(projectRoot: string, dryRun: boolean): Promise<void> {
  const candidates = ['postcss.config.js', 'postcss.config.mjs', 'postcss.config.cjs']

  for (const candidate of candidates) {
    if (await exists(path.resolve(projectRoot, candidate))) {
      return
    }
  }

  if (!dryRun) {
    await upsertTextFile(projectRoot, 'postcss.config.mjs', createPostcssConfig())
  }
}

async function readPackageModuleType(projectRoot: string): Promise<'module' | 'commonjs' | undefined> {
  const packageJsonPath = path.resolve(projectRoot, 'package.json')
  if (!(await exists(packageJsonPath))) {
    return undefined
  }

  try {
    const packageJson = await readJsonFile<{ type?: string }>(packageJsonPath)
    if (packageJson.type === 'module') return 'module'
    if (packageJson.type === 'commonjs') return 'commonjs'
  } catch {
    return undefined
  }

  return undefined
}

function inferTailwindModuleFormatFromPath(
  tailwindConfigPath: string,
  packageType: 'module' | 'commonjs' | undefined,
): TailwindConfigModuleFormat {
  const normalized = tailwindConfigPath.toLowerCase()

  if (normalized.endsWith('.cjs') || normalized.endsWith('.cts')) {
    return 'cjs'
  }
  if (normalized.endsWith('.mjs') || normalized.endsWith('.mts') || normalized.endsWith('.ts')) {
    return 'esm'
  }
  if (normalized.endsWith('.js')) {
    return packageType === 'module' ? 'esm' : 'cjs'
  }

  return packageType === 'module' ? 'esm' : 'cjs'
}

function detectTailwindModuleFormatFromContent(content: string): TailwindConfigModuleFormat | null {
  if (/\bmodule\.exports\b/.test(content) || /\brequire\s*\(/.test(content)) {
    return 'cjs'
  }
  if (/\bexport\s+default\b/.test(content) || /\bimport\s+/.test(content)) {
    return 'esm'
  }
  return null
}
