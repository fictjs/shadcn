import path from 'node:path'

import colors from 'picocolors'

import { DEV_DEPENDENCIES, RUNTIME_DEPENDENCIES } from '../core/constants'
import { loadConfig, saveConfig } from '../core/config'
import { exists, readTextIfExists, upsertTextFile } from '../core/io'
import { getAliasPathKey, getAliasPathTarget, getTailwindContentGlobs } from '../core/layout'
import { detectPackageManager, findProjectRoot, runPackageManagerInstall } from '../core/project'
import {
  createCnUtility,
  createGlobalsCss,
  createPostcssConfig,
  createTailwindConfig,
  createTsconfigPathPatch,
  createVariantsUtility,
  patchTailwindConfig,
} from '../core/templates'
import type { FictcnConfig, InitOptions } from '../core/types'

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const projectRoot = await findProjectRoot(cwd)
  const config = await loadConfig(projectRoot)

  await saveConfig(projectRoot, config)

  await upsertTextFile(projectRoot, config.css, createGlobalsCss())
  await upsertTextFile(projectRoot, path.posix.join(config.libDir, 'cn.ts'), createCnUtility())
  await upsertTextFile(
    projectRoot,
    path.posix.join(config.libDir, 'variants.ts'),
    createVariantsUtility(),
  )

  await ensureTsconfigAlias(projectRoot, config)
  await ensureTailwindConfig(projectRoot, config)
  await ensurePostcssConfig(projectRoot)

  if (!options.skipInstall) {
    const packageManager = await detectPackageManager(projectRoot)

    console.log(colors.cyan(`Installing dependencies via ${packageManager}...`))
    await runPackageManagerInstall(packageManager, projectRoot, RUNTIME_DEPENDENCIES, false)
    await runPackageManagerInstall(packageManager, projectRoot, DEV_DEPENDENCIES, true)
  }

  console.log(colors.green('fictcn init completed.'))
}

async function ensureTsconfigAlias(projectRoot: string, config: FictcnConfig): Promise<void> {
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
    await upsertTextFile(projectRoot, 'tsconfig.json', `${JSON.stringify(fallback, null, 2)}\n`)
    return
  }

  const patched = createTsconfigPathPatch(existing, aliasPathKey, aliasPathTarget)
  if (patched === null) {
    console.log(colors.yellow('Warning: could not patch tsconfig.json automatically.'))
    return
  }

  await upsertTextFile(projectRoot, 'tsconfig.json', patched)
}

async function ensureTailwindConfig(projectRoot: string, config: FictcnConfig): Promise<void> {
  const contentGlobs = getTailwindContentGlobs(config)
  const tailwindConfigPath = config.tailwindConfig
  const absolutePath = path.resolve(projectRoot, tailwindConfigPath)
  if (!(await exists(absolutePath))) {
    await upsertTextFile(projectRoot, tailwindConfigPath, createTailwindConfig(contentGlobs))
    return
  }

  const current = await readTextIfExists(absolutePath)
  if (current === null) {
    await upsertTextFile(projectRoot, tailwindConfigPath, createTailwindConfig(contentGlobs))
    return
  }

  await upsertTextFile(projectRoot, tailwindConfigPath, patchTailwindConfig(current, contentGlobs))
}

async function ensurePostcssConfig(projectRoot: string): Promise<void> {
  const candidates = ['postcss.config.js', 'postcss.config.mjs', 'postcss.config.cjs']

  for (const candidate of candidates) {
    if (await exists(path.resolve(projectRoot, candidate))) {
      return
    }
  }

  await upsertTextFile(projectRoot, 'postcss.config.mjs', createPostcssConfig())
}
