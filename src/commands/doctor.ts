import path from 'node:path'

import colors from 'picocolors'

import { CONFIG_FILE } from '../core/constants'
import { loadConfig } from '../core/config'
import { exists, readJsonFile, readTextIfExists } from '../core/io'
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
  const config = await loadConfig(projectRoot)
  const issues: DoctorIssue[] = []

  if (!(await exists(path.resolve(projectRoot, CONFIG_FILE)))) {
    issues.push({
      level: 'error',
      code: 'missing-config',
      message: 'fictcn.json is missing. Run `fictcn init` first.',
    })
  }

  if (config.registry !== 'builtin') {
    issues.push({
      level: 'error',
      code: 'unsupported-registry',
      message: `Registry ${config.registry} is not currently supported by this CLI version.`,
    })
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
      const tsconfig = JSON.parse(tsconfigRaw) as {
        compilerOptions?: {
          paths?: Record<string, string[]>
        }
      }
      const aliasPathKey = toAliasPathKey(config.aliases.base)
      const alias = tsconfig.compilerOptions?.paths?.[aliasPathKey]
      if (!alias || !alias.includes('src/*')) {
        issues.push({
          level: 'warning',
          code: 'alias-paths',
          message: `tsconfig paths is missing ${aliasPathKey} -> src/* alias.`,
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
    if (!tailwindConfig.includes('src/**/*.{ts,tsx}')) {
      issues.push({
        level: 'warning',
        code: 'tailwind-content',
        message: 'Tailwind content glob is missing src/**/*.{ts,tsx}.',
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
    const packageJson = await readJsonFile<{
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }>(packageJsonPath)

    const dependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    }

    const required = ['@fictjs/ui-primitives', 'class-variance-authority', 'clsx', 'tailwind-merge']
    for (const dependency of required) {
      if (!dependencies[dependency]) {
        issues.push({
          level: 'warning',
          code: 'missing-dependency',
          message: `Missing dependency ${dependency}.`,
        })
      }
    }
  }

  if (issues.length === 0) {
    console.log(colors.green('Doctor check passed.'))
  } else {
    for (const issue of issues) {
      const color = issue.level === 'error' ? colors.red : colors.yellow
      console.log(color(`[${issue.level}] ${issue.code}: ${issue.message}`))
    }
  }

  return {
    ok: issues.every(issue => issue.level !== 'error'),
    issues,
  }
}

function toAliasPathKey(baseAlias: string): string {
  const normalized = baseAlias.trim().replace(/\/+$/, '')
  return normalized.endsWith('/*') ? normalized : `${normalized}/*`
}
