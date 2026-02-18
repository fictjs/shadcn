import path from 'node:path'

import { CONFIG_FILE, DEFAULT_CONFIG, LOCK_FILE, DEFAULT_LOCK } from './constants'
import { exists, readJsonFile, readJsoncFile, sortRecord, writeJsonFile } from './io'
import type { FictcnConfig, FictcnLock } from './types'

export async function loadConfig(projectRoot: string): Promise<FictcnConfig> {
  const configPath = path.resolve(projectRoot, CONFIG_FILE)
  if (!(await exists(configPath))) {
    return { ...DEFAULT_CONFIG }
  }

  const rawConfig = await readJsoncFile<unknown>(configPath)
  const partialValidationErrors = validateConfig(rawConfig, 'partial')
  if (partialValidationErrors.length > 0) {
    throw createConfigValidationError(configPath, partialValidationErrors)
  }

  const config = rawConfig as Partial<FictcnConfig>
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    aliases: {
      ...DEFAULT_CONFIG.aliases,
      ...config.aliases,
    },
  }

  const fullValidationErrors = validateConfig(mergedConfig, 'full')
  if (fullValidationErrors.length > 0) {
    throw createConfigValidationError(configPath, fullValidationErrors)
  }

  return mergedConfig
}

export async function ensureConfigFile(projectRoot: string, config: FictcnConfig): Promise<void> {
  const configPath = path.resolve(projectRoot, CONFIG_FILE)
  if (await exists(configPath)) return
  await saveConfig(projectRoot, config)
}

export async function saveConfig(projectRoot: string, config: FictcnConfig): Promise<void> {
  const configPath = path.resolve(projectRoot, CONFIG_FILE)
  await writeJsonFile(configPath, {
    ...config,
    aliases: sortRecord(config.aliases),
  })
}

export function assertSupportedRegistry(config: FictcnConfig): void {
  if (config.registry !== 'builtin') {
    throw new Error(`Unsupported registry "${config.registry}". Only "builtin" is currently supported.`)
  }
}

export async function loadLock(projectRoot: string): Promise<FictcnLock> {
  const lockPath = path.resolve(projectRoot, LOCK_FILE)
  if (!(await exists(lockPath))) {
    return {
      ...DEFAULT_LOCK,
      components: {},
      blocks: {},
      themes: {},
    }
  }

  const lock = await readJsonFile<FictcnLock>(lockPath)
  return {
    ...DEFAULT_LOCK,
    ...lock,
    components: lock.components ?? {},
    blocks: lock.blocks ?? {},
    themes: lock.themes ?? {},
  }
}

export async function saveLock(projectRoot: string, lock: FictcnLock): Promise<void> {
  const lockPath = path.resolve(projectRoot, LOCK_FILE)
  await writeJsonFile(lockPath, {
    ...lock,
    components: sortRecord(lock.components),
    blocks: sortRecord(lock.blocks),
    themes: sortRecord(lock.themes),
  })
}

type ValidationMode = 'partial' | 'full'

function validateConfig(value: unknown, mode: ValidationMode): string[] {
  if (!isPlainObject(value)) {
    return ['Expected an object at the top level.']
  }

  const errors: string[] = []
  const allowedTopLevelKeys = new Set([
    '$schema',
    'version',
    'style',
    'componentsDir',
    'libDir',
    'css',
    'tailwindConfig',
    'registry',
    'aliases',
  ])

  for (const key of Object.keys(value)) {
    if (!allowedTopLevelKeys.has(key)) {
      errors.push(`Unknown field "${key}".`)
    }
  }

  validateStringField(value, '$schema', errors, {
    required: false,
    allowEmpty: false,
  })
  validateLiteralField(value, 'version', 1, errors, mode === 'full')
  validateLiteralField(value, 'style', 'tailwind-css-vars', errors, mode === 'full')
  validateStringField(value, 'componentsDir', errors, { required: mode === 'full', allowEmpty: false })
  validateStringField(value, 'libDir', errors, { required: mode === 'full', allowEmpty: false })
  validateStringField(value, 'css', errors, { required: mode === 'full', allowEmpty: false })
  validateStringField(value, 'tailwindConfig', errors, { required: mode === 'full', allowEmpty: false })
  validateStringField(value, 'registry', errors, { required: mode === 'full', allowEmpty: false })

  const aliasesValue = value.aliases
  if (aliasesValue === undefined) {
    if (mode === 'full') {
      errors.push('Missing required field "aliases".')
    }
  } else if (!isPlainObject(aliasesValue)) {
    errors.push('Field "aliases" must be an object.')
  } else {
    const allowedAliasKeys = new Set(['base'])
    for (const key of Object.keys(aliasesValue)) {
      if (!allowedAliasKeys.has(key)) {
        errors.push(`Unknown field "aliases.${key}".`)
      }
    }

    validateStringField(aliasesValue, 'base', errors, {
      required: mode === 'full',
      allowEmpty: false,
      pathPrefix: 'aliases.',
    })
  }

  return errors
}

function validateStringField(
  value: Record<string, unknown>,
  key: string,
  errors: string[],
  options: {
    required: boolean
    allowEmpty: boolean
    pathPrefix?: string
  },
): void {
  const path = `${options.pathPrefix ?? ''}${key}`
  const fieldValue = value[key]
  if (fieldValue === undefined) {
    if (options.required) {
      errors.push(`Missing required field "${path}".`)
    }
    return
  }

  if (typeof fieldValue !== 'string') {
    errors.push(`Field "${path}" must be a string.`)
    return
  }

  if (!options.allowEmpty && fieldValue.trim().length === 0) {
    errors.push(`Field "${path}" cannot be empty.`)
  }
}

function validateLiteralField(
  value: Record<string, unknown>,
  key: string,
  expected: string | number,
  errors: string[],
  required: boolean,
): void {
  const fieldValue = value[key]
  if (fieldValue === undefined) {
    if (required) {
      errors.push(`Missing required field "${key}".`)
    }
    return
  }

  if (fieldValue !== expected) {
    errors.push(`Field "${key}" must be ${JSON.stringify(expected)}.`)
  }
}

function createConfigValidationError(configPath: string, errors: string[]): Error {
  return new Error(`Invalid ${CONFIG_FILE} at ${configPath}:\n${errors.map(error => `- ${error}`).join('\n')}`)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
