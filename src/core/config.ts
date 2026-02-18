import path from 'node:path'

import { CONFIG_FILE, DEFAULT_CONFIG, LOCK_FILE, DEFAULT_LOCK } from './constants'
import { exists, readJsonFile, readJsoncFile, sortRecord, writeJsonFile } from './io'
import type { FictcnConfig, FictcnLock } from './types'

export async function loadConfig(projectRoot: string): Promise<FictcnConfig> {
  const configPath = path.resolve(projectRoot, CONFIG_FILE)
  if (!(await exists(configPath))) {
    return { ...DEFAULT_CONFIG }
  }

  const config = await readJsoncFile<Partial<FictcnConfig>>(configPath)
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`Invalid ${CONFIG_FILE}: expected an object.`)
  }

  return {
    ...DEFAULT_CONFIG,
    ...config,
    aliases: {
      ...DEFAULT_CONFIG.aliases,
      ...config.aliases,
    },
  }
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
