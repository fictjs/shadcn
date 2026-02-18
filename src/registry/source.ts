import { loadConfig } from '../core/config'
import { findProjectRoot } from '../core/project'
import { builtinBlocks, builtinComponents, builtinThemes } from './builtin'
import type { RegistryEntry, RegistryEntryType, RegistryTemplateFile } from './types'

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

export interface RegistryDataset {
  source: string
  components: Record<string, RegistryEntry>
  blocks: Record<string, RegistryEntry>
  themes: Record<string, RegistryEntry>
}

interface RemoteRegistryEntry {
  name?: unknown
  description?: unknown
  type?: unknown
  version?: unknown
  dependencies?: unknown
  registryDependencies?: unknown
  files?: unknown
}

interface RemoteRegistryContainer {
  entries?: unknown
  items?: unknown
}

export async function loadRegistryCatalog(options: RegistrySourceOptions = {}): Promise<RegistryCatalogRecord[]> {
  const dataset = await loadRegistryDataset({
    ...options,
    requireFiles: false,
  })

  const records: RegistryCatalogRecord[] = []
  records.push(...toCatalogRecords(Object.values(dataset.components), 'component'))
  records.push(...toCatalogRecords(Object.values(dataset.blocks), 'block'))
  records.push(...toCatalogRecords(Object.values(dataset.themes), 'theme'))

  return records.sort((left, right) => left.name.localeCompare(right.name))
}

interface RegistryDatasetOptions extends RegistrySourceOptions {
  requireFiles: boolean
}

export async function loadRegistryDataset(options: RegistryDatasetOptions): Promise<RegistryDataset> {
  const source = await resolveRegistrySource(options)
  if (source === 'builtin') {
    return {
      source,
      components: toRegistryMap(builtinComponents),
      blocks: toRegistryMap(builtinBlocks),
      themes: toRegistryMap(builtinThemes),
    }
  }

  const entries = await fetchRemoteRegistryEntries(source, options.requireFiles)
  return {
    source,
    components: toRegistryMap(entries.filter(entry => entry.type === 'ui-component')),
    blocks: toRegistryMap(entries.filter(entry => entry.type === 'block')),
    themes: toRegistryMap(entries.filter(entry => entry.type === 'theme')),
  }
}

export function resolveComponentGraph(dataset: RegistryDataset, componentNames: string[]): RegistryEntry[] {
  return resolveGraph(componentNames, dataset.components, 'component', () => true)
}

export function resolveBlockGraph(dataset: RegistryDataset, blockNames: string[]): RegistryEntry[] {
  return resolveGraph(blockNames, dataset.blocks, 'block', dependency => Boolean(dataset.blocks[dependency]))
}

export function resolveEntryKinds(dataset: RegistryDataset, name: string): RegistryCatalogKind[] {
  const kinds: RegistryCatalogKind[] = []
  if (dataset.components[name]) kinds.push('component')
  if (dataset.blocks[name]) kinds.push('block')
  if (dataset.themes[name]) kinds.push('theme')
  return kinds
}

function toCatalogRecords(entries: RegistryEntry[], kind: RegistryCatalogKind): RegistryCatalogRecord[] {
  return entries.map(entry => ({
    kind,
    name: entry.name,
    description: entry.description,
  }))
}

function toRegistryMap(entries: RegistryEntry[]): Record<string, RegistryEntry> {
  return Object.fromEntries(entries.map(entry => [entry.name, entry]))
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

function resolveGraph(
  names: string[],
  registry: Record<string, RegistryEntry>,
  kindLabel: 'component' | 'block',
  shouldFollowDependency: (dependency: string) => boolean,
): RegistryEntry[] {
  const resolved: RegistryEntry[] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()

  for (const name of names) {
    visit(name)
  }

  return resolved

  function visit(name: string): void {
    if (visited.has(name)) {
      return
    }
    if (visiting.has(name)) {
      throw new Error(`Circular registry ${kindLabel} dependency detected: ${name}`)
    }

    const entry = registry[name]
    if (!entry) {
      throw new Error(`Unknown registry ${kindLabel}: ${name}`)
    }

    visiting.add(name)
    for (const dependency of entry.registryDependencies) {
      if (!shouldFollowDependency(dependency)) {
        continue
      }
      visit(dependency)
    }
    visiting.delete(name)

    visited.add(name)
    resolved.push(entry)
  }
}

async function fetchRemoteRegistryEntries(source: string, requireFiles: boolean): Promise<RegistryEntry[]> {
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
    const normalized = entries
      .map(entry => normalizeRemoteEntry(entry, requireFiles))
      .filter((entry): entry is RegistryEntry => entry !== null)

    if (normalized.length === 0) {
      throw new Error('Remote registry payload did not contain valid entries.')
    }

    return normalized
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

  const container = payload as RemoteRegistryContainer
  if (Array.isArray(container.entries)) {
    return container.entries as RemoteRegistryEntry[]
  }
  if (Array.isArray(container.items)) {
    return container.items as RemoteRegistryEntry[]
  }

  throw new Error('Remote registry payload must provide an "entries" or "items" array.')
}

function normalizeRemoteEntry(entry: RemoteRegistryEntry, requireFiles: boolean): RegistryEntry | null {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const name = normalizeString(entry.name)
  const type = normalizeRemoteEntryType(entry.type)

  if (!name || !type) {
    return null
  }

  const files = normalizeRemoteFiles(entry.files)
  if (requireFiles && files.length === 0) {
    return null
  }

  return {
    name,
    type,
    version: normalizeString(entry.version) ?? '0.0.0',
    description: normalizeString(entry.description) ?? '',
    dependencies: normalizeStringArray(entry.dependencies),
    registryDependencies: normalizeStringArray(entry.registryDependencies),
    files,
  }
}

function normalizeRemoteFiles(value: unknown): RegistryTemplateFile[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(file => normalizeRemoteFile(file))
    .filter((file): file is RegistryTemplateFile => file !== null)
}

function normalizeRemoteFile(value: unknown): RegistryTemplateFile | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const file = value as {
    path?: unknown
    content?: unknown
  }

  const path = normalizeString(file.path)
  if (!path || typeof file.content !== 'string') {
    return null
  }

  const content = file.content
  return {
    path,
    content: () => content,
  }
}

function normalizeRemoteEntryType(value: unknown): RegistryEntryType | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.toLowerCase()
  if (normalized === 'ui-component' || normalized === 'component' || normalized === 'registry:ui') {
    return 'ui-component'
  }
  if (normalized === 'block' || normalized === 'registry:block') {
    return 'block'
  }
  if (normalized === 'theme' || normalized === 'registry:theme' || normalized === 'style') {
    return 'theme'
  }

  return null
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(item => normalizeString(item))
    .filter((item): item is string => item !== null)
}
