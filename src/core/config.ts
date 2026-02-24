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

  const rawLock = await readJsonFile<unknown>(lockPath)
  const lockValidationErrors = validateLock(rawLock)
  if (lockValidationErrors.length > 0) {
    throw createLockValidationError(lockPath, lockValidationErrors)
  }

  const lock = rawLock as FictcnLock
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
  validateProjectRelativePathField(value, 'componentsDir', errors)
  validateProjectRelativePathField(value, 'libDir', errors)
  validateProjectRelativePathField(value, 'css', errors)
  validateProjectRelativePathField(value, 'tailwindConfig', errors)
  validateStringField(value, 'registry', errors, { required: mode === 'full', allowEmpty: false })
  validateRegistryField(value, errors)

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

function validateRegistryField(value: Record<string, unknown>, errors: string[]): void {
  const registry = value.registry
  if (registry === undefined || typeof registry !== 'string') {
    return
  }

  const trimmed = registry.trim()
  if (trimmed.length === 0 || trimmed === 'builtin') {
    return
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    errors.push('Field "registry" must be "builtin" or a valid http(s)/file URL.')
    return
  }

  if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) {
    errors.push('Field "registry" must be "builtin" or a valid http(s)/file URL.')
  }
}

function validateLock(value: unknown): string[] {
  if (!isPlainObject(value)) {
    return ['Expected an object at the top level.']
  }

  const errors: string[] = []
  const allowedTopLevelKeys = new Set(['$schema', 'version', 'registry', 'components', 'blocks', 'themes'])
  for (const key of Object.keys(value)) {
    if (!allowedTopLevelKeys.has(key)) {
      errors.push(`Unknown field "${key}".`)
    }
  }

  validateLiteralField(value, 'version', 1, errors, false)
  validateStringField(value, 'registry', errors, { required: false, allowEmpty: false })
  validateLockSection(value, 'components', errors)
  validateLockSection(value, 'blocks', errors)
  validateLockSection(value, 'themes', errors)

  return errors
}

function validateLockSection(
  value: Record<string, unknown>,
  section: 'components' | 'blocks' | 'themes',
  errors: string[],
): void {
  const sectionValue = value[section]
  if (sectionValue === undefined) {
    return
  }

  if (!isPlainObject(sectionValue)) {
    errors.push(`Field "${section}" must be an object.`)
    return
  }

  for (const [entryKey, entryValue] of Object.entries(sectionValue)) {
    const entryPrefix = `${section}.${entryKey}.`
    if (!isPlainObject(entryValue)) {
      errors.push(`Field "${section}.${entryKey}" must be an object.`)
      continue
    }

    validateStringField(entryValue, 'name', errors, { required: true, allowEmpty: false, pathPrefix: entryPrefix })
    validateStringField(entryValue, 'version', errors, { required: true, allowEmpty: false, pathPrefix: entryPrefix })
    validateStringField(entryValue, 'source', errors, { required: true, allowEmpty: false, pathPrefix: entryPrefix })
    validateStringField(entryValue, 'installedAt', errors, {
      required: true,
      allowEmpty: false,
      pathPrefix: entryPrefix,
    })

    const files = entryValue.files
    if (!isPlainObject(files)) {
      errors.push(`Field "${entryPrefix}files" must be an object.`)
      continue
    }

    for (const [filePath, hash] of Object.entries(files)) {
      if (typeof hash !== 'string' || hash.trim().length === 0) {
        errors.push(`Field "${entryPrefix}files.${filePath}" must be a non-empty string.`)
      }
    }
  }
}

function validateProjectRelativePathField(value: Record<string, unknown>, key: string, errors: string[]): void {
  const fieldValue = value[key]
  if (typeof fieldValue !== 'string') {
    return
  }

  const normalized = fieldValue.replaceAll('\\', '/').trim()
  if (normalized.length === 0) {
    return
  }

  if (normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized)) {
    errors.push(`Field "${key}" must be a project-relative path.`)
    return
  }

  const segments = normalized.split('/').filter(Boolean)
  if (segments.includes('..')) {
    errors.push(`Field "${key}" cannot contain parent-directory traversal ("..").`)
  }
}

function createConfigValidationError(configPath: string, errors: string[]): Error {
  return new Error(`Invalid ${CONFIG_FILE} at ${configPath}:\n${errors.map(error => `- ${error}`).join('\n')}`)
}

function createLockValidationError(lockPath: string, errors: string[]): Error {
  return new Error(`Invalid ${LOCK_FILE} at ${lockPath}:\n${errors.map(error => `- ${error}`).join('\n')}`)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
