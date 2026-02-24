import path from 'node:path'

import { parse, type ParseError } from 'jsonc-parser'
import colors from 'picocolors'

import { CONFIG_FILE, DEFAULT_CONFIG, DEV_DEPENDENCIES, LOCK_FILE, RUNTIME_DEPENDENCIES } from '../core/constants'
import { loadConfig, loadLock } from '../core/config'
import { exists, readJsonFile, readTextIfExists } from '../core/io'
import { getAliasPathKey, getAliasPathTarget, getTailwindContentGlobs } from '../core/layout'
import { findProjectRoot } from '../core/project'

export interface DoctorIssue {
  level: 'error' | 'warning'
  code: string
  message: string
}

export interface DoctorResult {
  ok: boolean
  issues: DoctorIssue[]
}

export async function runDoctor(cwd = process.cwd()): Promise<DoctorResult> {
  const projectRoot = await findProjectRoot(cwd)
  const issues: DoctorIssue[] = []
  const configPath = path.resolve(projectRoot, CONFIG_FILE)
  let config = { ...DEFAULT_CONFIG }

  if (!(await exists(configPath))) {
    issues.push({
      level: 'error',
      code: 'missing-config',
      message: 'fictcn.json is missing. Run `fictcn init` first.',
    })
  } else {
    try {
      config = await loadConfig(projectRoot)
    } catch (error) {
      issues.push({
        level: 'error',
        code: 'invalid-config',
        message: error instanceof Error ? error.message : String(error),
      })

      printIssues(issues)
      return {
        ok: false,
        issues,
      }
    }
  }

  if (config.registry !== 'builtin') {
    issues.push({
      level: 'warning',
      code: 'remote-registry',
      message: `Using remote registry ${config.registry}. Ensure network access and a compatible registry index for add/diff/update commands.`,
    })

    try {
      const registryUrl = new URL(config.registry)
      if (registryUrl.protocol === 'file:') {
        issues.push({
          level: 'warning',
          code: 'file-registry',
          message:
            'Using a local file:// registry. Ensure the registry path is trusted and controlled by your team.',
        })
      }
    } catch {
      // ignore parse errors; config validation handles invalid registry formats
    }

    if (readBooleanEnv('FICTCN_ALLOW_CROSS_ORIGIN_REGISTRY_FILES', false)) {
      issues.push({
        level: 'warning',
        code: 'cross-origin-registry-files',
        message:
          'FICTCN_ALLOW_CROSS_ORIGIN_REGISTRY_FILES is enabled. HTTP registries may fetch template files from other origins.',
      })
    }
  }

  const tsconfigRaw = await readTextIfExists(path.resolve(projectRoot, 'tsconfig.json'))
  if (!tsconfigRaw) {
    issues.push({
      level: 'error',
      code: 'missing-tsconfig',
      message: 'tsconfig.json is missing.',
    })
  } else {
    try {
      const parseErrors: ParseError[] = []
      const parsed = parse(tsconfigRaw, parseErrors, {
        allowTrailingComma: true,
        disallowComments: false,
      })

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parseErrors.length > 0) {
        throw new Error('invalid-tsconfig-jsonc')
      }

      const tsconfig = parsed as {
        compilerOptions?: {
          paths?: Record<string, string[]>
        }
      }
      const aliasPathKey = getAliasPathKey(config.aliases.base)
      const aliasPathTarget = getAliasPathTarget(config)
      const alias = tsconfig.compilerOptions?.paths?.[aliasPathKey]
      if (!alias || !alias.includes(aliasPathTarget)) {
        issues.push({
          level: 'error',
          code: 'alias-paths',
          message: `tsconfig paths is missing ${aliasPathKey} -> ${aliasPathTarget} alias.`,
        })
      }
    } catch {
      issues.push({
        level: 'warning',
        code: 'tsconfig-parse',
        message: 'Could not parse tsconfig.json to validate alias setup.',
      })
    }
  }

  const globalsCss = await readTextIfExists(path.resolve(projectRoot, config.css))
  if (!globalsCss) {
    issues.push({
      level: 'error',
      code: 'missing-globals-css',
      message: `Missing base CSS file at ${config.css}.`,
    })
  } else if (!globalsCss.includes('@fictcn tokens:start')) {
    issues.push({
      level: 'warning',
      code: 'missing-css-tokens',
      message: 'Base CSS does not include the generated token block.',
    })
  }

  const tailwindConfig = await readTextIfExists(path.resolve(projectRoot, config.tailwindConfig))
  if (!tailwindConfig) {
    issues.push({
      level: 'error',
      code: 'missing-tailwind-config',
      message: `Missing Tailwind config at ${config.tailwindConfig}.`,
    })
  } else {
    const missingContentGlobs = getTailwindContentGlobs(config).filter(glob => {
      return !(tailwindConfig.includes(`'${glob}'`) || tailwindConfig.includes(`"${glob}"`))
    })
    if (missingContentGlobs.length > 0) {
      issues.push({
        level: 'warning',
        code: 'tailwind-content',
        message: `Tailwind content globs are missing: ${missingContentGlobs.join(', ')}.`,
      })
    }
    if (!tailwindConfig.includes('tailwindcss-animate')) {
      issues.push({
        level: 'warning',
        code: 'tailwind-plugin',
        message: 'tailwindcss-animate plugin is missing from tailwind config.',
      })
    }
  }

  const packageJsonPath = path.resolve(projectRoot, 'package.json')
  if (await exists(packageJsonPath)) {
    try {
      const packageJson = await readJsonFile<{
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }>(packageJsonPath)

      const dependencies = {
        ...(packageJson.dependencies ?? {}),
        ...(packageJson.devDependencies ?? {}),
      }

      for (const dependency of RUNTIME_DEPENDENCIES) {
        if (!dependencies[dependency]) {
          issues.push({
            level: 'error',
            code: 'missing-dependency',
            message: `Missing dependency ${dependency}.`,
          })
        }
      }

      for (const dependency of DEV_DEPENDENCIES) {
        if (!dependencies[dependency]) {
          issues.push({
            level: 'warning',
            code: 'missing-dev-dependency',
            message: `Missing development dependency ${dependency}.`,
          })
        }
      }
    } catch (error) {
      issues.push({
        level: 'warning',
        code: 'package-json-parse',
        message: `Could not parse package.json to validate dependencies: ${
          error instanceof Error ? error.message : String(error)
        }`,
      })
    }
  }

  const lockPath = path.resolve(projectRoot, LOCK_FILE)
  if (await exists(lockPath)) {
    try {
      await loadLock(projectRoot)
    } catch (error) {
      issues.push({
        level: 'error',
        code: 'invalid-lock',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  printIssues(issues)

  return {
    ok: issues.every(issue => issue.level !== 'error'),
    issues,
  }
}

function printIssues(issues: DoctorIssue[]): void {
  if (issues.length === 0) {
    console.log(colors.green('Doctor check passed.'))
    return
  }

  for (const issue of issues) {
    const color = issue.level === 'error' ? colors.red : colors.yellow
    console.log(color(`[${issue.level}] ${issue.code}: ${issue.message}`))
  }
}

function readBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }

  const normalized = raw.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  return fallback
}
