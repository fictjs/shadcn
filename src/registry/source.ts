import { loadConfig } from '../core/config'
import { findProjectRoot } from '../core/project'
import { builtinBlocks, builtinComponents, builtinThemes } from './builtin'
import type { RegistryEntry } from './types'

export type RegistryCatalogKind = 'component' | 'block' | 'theme'

export interface RegistryCatalogRecord {
  kind: RegistryCatalogKind
  name: string
  description: string
}

export interface RegistrySourceOptions {
  cwd?: string
  registry?: string
}

interface RemoteRegistryEntry {
  name: string
  description?: string
  type?: string
}

export async function loadRegistryCatalog(options: RegistrySourceOptions = {}): Promise<RegistryCatalogRecord[]> {
  const source = await resolveRegistrySource(options)
  if (source === 'builtin') {
    return collectBuiltinCatalog()
  }

  return fetchRemoteRegistryCatalog(source)
}

function collectBuiltinCatalog(): RegistryCatalogRecord[] {
  const records: RegistryCatalogRecord[] = []
  records.push(...toCatalogRecords(builtinComponents, 'component'))
  records.push(...toCatalogRecords(builtinBlocks, 'block'))
  records.push(...toCatalogRecords(builtinThemes, 'theme'))
  return records.sort((left, right) => left.name.localeCompare(right.name))
}

function toCatalogRecords(entries: RegistryEntry[], kind: RegistryCatalogKind): RegistryCatalogRecord[] {
  return entries.map(entry => ({
    kind,
    name: entry.name,
    description: entry.description,
  }))
}

async function resolveRegistrySource(options: RegistrySourceOptions): Promise<string> {
  if (typeof options.registry === 'string' && options.registry.trim().length > 0) {
    return options.registry.trim()
  }

  const cwd = options.cwd ?? process.cwd()
  let projectRoot: string
  try {
    projectRoot = await findProjectRoot(cwd)
  } catch {
    return 'builtin'
  }

  const config = await loadConfig(projectRoot)
  return config.registry
}

async function fetchRemoteRegistryCatalog(source: string): Promise<RegistryCatalogRecord[]> {
  const url = resolveRegistryUrl(source)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch registry from ${url}: ${response.status} ${response.statusText}`)
    }

    const payload = (await response.json()) as unknown
    const entries = unwrapRemoteEntries(payload)
    return entries
      .map(entry => normalizeRemoteEntry(entry))
      .filter((entry): entry is RegistryCatalogRecord => entry !== null)
      .sort((left, right) => left.name.localeCompare(right.name))
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timed out fetching registry from ${url}`, {
        cause: error,
      })
    }
    throw new Error(`Failed to fetch registry from ${url}`, {
      cause: error,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

function resolveRegistryUrl(source: string): string {
  let parsed: URL
  try {
    parsed = new URL(source)
  } catch {
    throw new Error(`Unsupported registry source "${source}". Use "builtin" or a valid URL.`)
  }

  if (parsed.pathname.endsWith('.json')) {
    return parsed.toString()
  }

  const baseWithSlash = parsed.toString().endsWith('/') ? parsed.toString() : `${parsed.toString()}/`
  return new URL('index.json', baseWithSlash).toString()
}

function unwrapRemoteEntries(payload: unknown): RemoteRegistryEntry[] {
  if (Array.isArray(payload)) {
    return payload as RemoteRegistryEntry[]
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Remote registry payload must be an array or an object containing an array field.')
  }

  const container = payload as {
    entries?: unknown
    items?: unknown
  }

  if (Array.isArray(container.entries)) {
    return container.entries as RemoteRegistryEntry[]
  }
  if (Array.isArray(container.items)) {
    return container.items as RemoteRegistryEntry[]
  }

  throw new Error('Remote registry payload must provide an "entries" or "items" array.')
}

function normalizeRemoteEntry(entry: RemoteRegistryEntry): RegistryCatalogRecord | null {
  if (!entry || typeof entry !== 'object') {
    return null
  }
  if (typeof entry.name !== 'string' || entry.name.trim().length === 0) {
    return null
  }

  const kind = normalizeRemoteKind(entry.type)
  if (!kind) {
    return null
  }

  return {
    kind,
    name: entry.name.trim(),
    description: typeof entry.description === 'string' ? entry.description : '',
  }
}

function normalizeRemoteKind(value: string | undefined): RegistryCatalogKind | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.toLowerCase()
  if (normalized === 'ui-component' || normalized === 'component' || normalized === 'registry:ui') {
    return 'component'
  }
  if (normalized === 'block' || normalized === 'registry:block') {
    return 'block'
  }
  if (normalized === 'theme' || normalized === 'registry:theme' || normalized === 'style') {
    return 'theme'
  }
  return null
}
