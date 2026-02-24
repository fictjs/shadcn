import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

const REMOTE_REGISTRY_TIMEOUT_MS = readPositiveIntEnv('FICTCN_REGISTRY_TIMEOUT_MS', 10_000)
const REMOTE_REGISTRY_RETRIES = readPositiveIntEnv('FICTCN_REGISTRY_RETRIES', 2)
const REMOTE_REGISTRY_RETRY_DELAY_MS = readPositiveIntEnv('FICTCN_REGISTRY_RETRY_DELAY_MS', 250)
const REMOTE_REGISTRY_CACHE_TTL_MS = readPositiveIntEnv('FICTCN_REGISTRY_CACHE_TTL_MS', 10_000)
const REMOTE_REGISTRY_FETCH_CONCURRENCY = readPositiveIntEnv('FICTCN_REGISTRY_FETCH_CONCURRENCY', 16)
const ALLOWED_REMOTE_PROTOCOLS = new Set(['http:', 'https:', 'file:'])
const ALLOWED_TEMPLATE_PATH_TOKENS = new Set(['componentsDir', 'blocksDir', 'themesDir', 'libDir'])

const remoteRegistryCache = new Map<
  string,
  {
    expiresAt: number
    entries: RemoteRegistryEntry[]
  }
>()

const remoteRegistryFileCache = new Map<
  string,
  {
    expiresAt: number
    content: string
  }
>()

interface RemoteRegistryEntry {
  name?: unknown
  description?: unknown
  type?: unknown
  version?: unknown
  dependencies?: unknown
  devDependencies?: unknown
  registryDependencies?: unknown
  files?: unknown
}

interface RemoteRegistryContainer {
  entries?: unknown
  items?: unknown
}

interface NormalizeRemoteEntryOptions {
  requireFiles: boolean
  registryUrl: string
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
  return resolveGraph(dataset.components, componentNames, 'component', () => true)
}

export function resolveBlockGraph(dataset: RegistryDataset, blockNames: string[]): RegistryEntry[] {
  return resolveGraph(dataset.blocks, blockNames, 'block', dependency => Boolean(dataset.blocks[dependency]))
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
  registry: Record<string, RegistryEntry>,
  names: string[],
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
  const candidates = resolveRegistryUrls(source)
  let lastError: RegistryFetchError | null = null

  for (let index = 0; index < candidates.length; index += 1) {
    const url = candidates[index]
    try {
      return await fetchRemoteRegistryEntriesFromUrl(url, requireFiles)
    } catch (error) {
      const wrapped = toRegistryFetchError(url, error)
      lastError = wrapped

      const hasFallback = index + 1 < candidates.length
      if (hasFallback && wrapped.statusCode === 404) {
        continue
      }

      throw wrapped
    }
  }

  throw (
    lastError ??
    new RegistryFetchError(`Failed to fetch registry from ${source}`, {
      retryable: false,
    })
  )
}

async function fetchRemoteRegistryEntriesFromUrl(url: string, requireFiles: boolean): Promise<RegistryEntry[]> {
  const now = Date.now()
  const cached = remoteRegistryCache.get(url)
  const rawEntries =
    cached && cached.expiresAt > now ? cached.entries : await fetchAndCacheRemoteRegistryEntries(url)

  const normalized = await normalizeRemoteEntries(rawEntries, {
    requireFiles,
    registryUrl: url,
  })

  if (normalized.length === 0) {
    throw new RegistryFetchError('Remote registry payload did not contain valid entries.')
  }

  return normalized
}

async function fetchAndCacheRemoteRegistryEntries(url: string): Promise<RemoteRegistryEntry[]> {
  const entries = await fetchRemoteRegistryEntriesWithRetry(url)
  remoteRegistryCache.set(url, {
    entries,
    expiresAt: Date.now() + REMOTE_REGISTRY_CACHE_TTL_MS,
  })
  return entries
}

async function fetchRemoteRegistryEntriesWithRetry(url: string): Promise<RemoteRegistryEntry[]> {
  let attempt = 0
  let lastError: RegistryFetchError | null = null

  while (attempt <= REMOTE_REGISTRY_RETRIES) {
    try {
      return await fetchRemoteRegistryEntriesOnce(url)
    } catch (error) {
      const wrapped = toRegistryFetchError(url, error)
      lastError = wrapped

      const canRetry = wrapped.retryable && attempt < REMOTE_REGISTRY_RETRIES
      if (!canRetry) {
        throw wrapped
      }

      const delayMs = REMOTE_REGISTRY_RETRY_DELAY_MS * (attempt + 1)
      await wait(delayMs)
      attempt += 1
    }
  }

  throw new RegistryFetchError(`Failed to fetch registry from ${url}`, {
    cause: lastError,
  })
}

async function fetchRemoteRegistryEntriesOnce(url: string): Promise<RemoteRegistryEntry[]> {
  const rawPayload = await fetchRemoteTextOnce(url, 'application/json')
  let payload: unknown
  try {
    payload = JSON.parse(rawPayload) as unknown
  } catch {
    throw new SyntaxError(`Registry response from ${url} is not valid JSON.`)
  }

  return unwrapRemoteEntries(payload)
}

function resolveRegistryUrls(source: string): string[] {
  let parsed: URL
  try {
    parsed = new URL(source)
  } catch {
    throw new Error(`Unsupported registry source "${source}". Use "builtin" or a valid URL.`)
  }

  if (!ALLOWED_REMOTE_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Unsupported registry protocol "${parsed.protocol}". Use http(s) or file URLs.`)
  }

  if (parsed.pathname.endsWith('.json')) {
    return [parsed.toString()]
  }

  const baseWithSlash = parsed.toString().endsWith('/') ? parsed.toString() : `${parsed.toString()}/`
  const indexUrl = new URL('index.json', baseWithSlash).toString()
  const registryUrl = new URL('registry.json', baseWithSlash).toString()

  if (indexUrl === registryUrl) {
    return [indexUrl]
  }

  return [indexUrl, registryUrl]
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

async function normalizeRemoteEntries(
  entries: RemoteRegistryEntry[],
  options: NormalizeRemoteEntryOptions,
): Promise<RegistryEntry[]> {
  const normalized = await mapWithConcurrency(entries, REMOTE_REGISTRY_FETCH_CONCURRENCY, entry => {
    return normalizeRemoteEntry(entry, options)
  })

  return normalized.filter((entry): entry is RegistryEntry => entry !== null)
}

async function normalizeRemoteEntry(
  entry: RemoteRegistryEntry,
  options: NormalizeRemoteEntryOptions,
): Promise<RegistryEntry | null> {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const name = normalizeString(entry.name)
  const type = normalizeRemoteEntryType(entry.type)

  if (!name || !type) {
    return null
  }

  const files = await normalizeRemoteFiles(entry.files, type, options)
  if (options.requireFiles && files.length === 0) {
    return null
  }

  const dependencies = mergeStringArrays(entry.dependencies, entry.devDependencies)

  return {
    name,
    type,
    version: normalizeString(entry.version) ?? '0.0.0',
    description: normalizeString(entry.description) ?? '',
    dependencies,
    registryDependencies: normalizeStringArray(entry.registryDependencies),
    files,
  }
}

async function normalizeRemoteFiles(
  value: unknown,
  entryType: RegistryEntryType,
  options: NormalizeRemoteEntryOptions,
): Promise<RegistryTemplateFile[]> {
  if (!options.requireFiles || !Array.isArray(value)) {
    return []
  }

  const files = await mapWithConcurrency(value, REMOTE_REGISTRY_FETCH_CONCURRENCY, file => {
    return normalizeRemoteFile(file, entryType, options.registryUrl)
  })

  return files.filter((file): file is RegistryTemplateFile => file !== null)
}

async function normalizeRemoteFile(
  value: unknown,
  entryType: RegistryEntryType,
  registryUrl: string,
): Promise<RegistryTemplateFile | null> {
  if (!value || typeof value !== 'object') {
    return null
  }

  const file = value as {
    path?: unknown
    content?: unknown
  }

  const sourcePath = normalizeString(file.path)
  if (!sourcePath) {
    return null
  }

  const targetPath = normalizeRemoteFilePath(sourcePath, entryType)
  const content =
    typeof file.content === 'string' ? file.content : await readRemoteRegistryFile(sourcePath, registryUrl)

  return {
    path: targetPath,
    content: () => content,
  }
}

function normalizeRemoteFilePath(sourcePath: string, entryType: RegistryEntryType): string {
  const normalized = toRemotePathForMapping(sourcePath)
  let mappedPath = normalized

  if (!normalized.includes('{{')) {
    const mappings: Array<{ sourcePrefix: string; targetPrefix: string }> = [
      { sourcePrefix: 'src/lib/registry/ui/', targetPrefix: '{{componentsDir}}/' },
      { sourcePrefix: 'src/lib/registry/blocks/', targetPrefix: '{{blocksDir}}/' },
      { sourcePrefix: 'src/lib/registry/themes/', targetPrefix: '{{themesDir}}/' },
      { sourcePrefix: 'src/lib/registry/styles/', targetPrefix: '{{themesDir}}/' },
      { sourcePrefix: 'src/lib/registry/lib/', targetPrefix: '{{libDir}}/' },
      { sourcePrefix: 'src/lib/registry/hooks/', targetPrefix: '{{libDir}}/hooks/' },
    ]

    for (const mapping of mappings) {
      const suffix = findPathSuffix(normalized, mapping.sourcePrefix)
      if (suffix !== null) {
        mappedPath = `${mapping.targetPrefix}${suffix}`
        break
      }
    }

    const legacyBlockSuffix = findPathSuffix(normalized, 'blocks/')
    if (entryType === 'block' && legacyBlockSuffix !== null) {
      mappedPath = `{{blocksDir}}/${legacyBlockSuffix}`
    }
  }

  return sanitizeRemoteTemplatePath(mappedPath)
}

async function readRemoteRegistryFile(sourcePath: string, registryUrl: string): Promise<string> {
  const fileUrl = resolveRemoteFileUrl(sourcePath, registryUrl)
  const cached = remoteRegistryFileCache.get(fileUrl)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.content
  }

  const content = await fetchRemoteFileContentWithRetry(fileUrl)
  remoteRegistryFileCache.set(fileUrl, {
    content,
    expiresAt: Date.now() + REMOTE_REGISTRY_CACHE_TTL_MS,
  })
  return content
}

function resolveRemoteFileUrl(sourcePath: string, registryUrl: string): string {
  const registry = new URL(registryUrl)
  let resolved: URL

  try {
    resolved = new URL(sourcePath)
  } catch {
    resolved = new URL(sourcePath, registry)
  }

  assertSupportedRemoteFileProtocol(resolved)
  assertRemoteFileAccessAllowed(resolved, registry, sourcePath)

  return resolved.toString()
}

async function fetchRemoteFileContentWithRetry(url: string): Promise<string> {
  let attempt = 0
  let lastError: RegistryFetchError | null = null

  while (attempt <= REMOTE_REGISTRY_RETRIES) {
    try {
      return await fetchRemoteTextOnce(url, 'text/plain,*/*;q=0.9')
    } catch (error) {
      const wrapped = toRegistryFetchError(url, error)
      lastError = wrapped

      const canRetry = wrapped.retryable && attempt < REMOTE_REGISTRY_RETRIES
      if (!canRetry) {
        throw wrapped
      }

      const delayMs = REMOTE_REGISTRY_RETRY_DELAY_MS * (attempt + 1)
      await wait(delayMs)
      attempt += 1
    }
  }

  throw new RegistryFetchError(`Failed to fetch file from ${url}`, {
    cause: lastError,
  })
}

async function fetchRemoteTextOnce(url: string, accept: string): Promise<string> {
  const parsed = new URL(url)
  if (parsed.protocol === 'file:') {
    return readFile(fileURLToPath(parsed), 'utf8')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REMOTE_REGISTRY_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        accept,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new RegistryFetchError(`Failed to fetch registry from ${url}: ${response.status} ${response.statusText}`, {
        statusCode: response.status,
        retryable: isRetryableStatus(response.status),
      })
    }

    return await response.text()
  } catch (error) {
    throw toRegistryFetchError(url, error)
  } finally {
    clearTimeout(timeoutId)
  }
}

function normalizeRemoteEntryType(value: unknown): RegistryEntryType | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.toLowerCase()
  if (
    normalized === 'ui-component' ||
    normalized === 'component' ||
    normalized === 'registry:ui' ||
    normalized === 'registry:hook' ||
    normalized === 'registry:lib' ||
    normalized === 'hook' ||
    normalized === 'lib'
  ) {
    return 'ui-component'
  }
  if (normalized === 'block' || normalized === 'registry:block') {
    return 'block'
  }
  if (normalized === 'theme' || normalized === 'registry:theme' || normalized === 'style' || normalized === 'registry:style') {
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

function mergeStringArrays(...values: unknown[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  for (const value of values) {
    for (const item of normalizeStringArray(value)) {
      if (seen.has(item)) {
        continue
      }
      seen.add(item)
      merged.push(item)
    }
  }

  return merged
}

function toRegistryFetchError(url: string, error: unknown): RegistryFetchError {
  if (error instanceof RegistryFetchError) {
    return error
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new RegistryFetchError(`Timed out fetching registry from ${url}`, {
      cause: error,
      retryable: true,
    })
  }

  if (error instanceof SyntaxError) {
    return new RegistryFetchError(`Registry response from ${url} is not valid JSON.`, {
      cause: error,
    })
  }

  if (isFileNotFoundError(error)) {
    return new RegistryFetchError(`File not found for registry source ${url}.`, {
      cause: error,
    })
  }

  if (error instanceof Error) {
    return new RegistryFetchError(`Failed to fetch registry from ${url}: ${error.message}`, {
      cause: error,
      retryable: isLikelyNetworkError(error),
    })
  }

  return new RegistryFetchError(`Failed to fetch registry from ${url}`, {
    cause: error,
    retryable: isLikelyNetworkError(error),
  })
}

function isRetryableStatus(statusCode: number): boolean {
  return statusCode === 408 || statusCode === 429 || statusCode >= 500
}

function isLikelyNetworkError(error: unknown): boolean {
  return error instanceof TypeError
}

function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  )
}

function wait(delayMs: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, delayMs)
  })
}

async function mapWithConcurrency<T, TResult>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<TResult>,
): Promise<TResult[]> {
  if (items.length === 0) {
    return []
  }

  const workers = Math.max(1, Math.min(concurrency, items.length))
  const results = new Array<TResult>(items.length)
  let index = 0

  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (true) {
        const current = index
        index += 1
        if (current >= items.length) {
          return
        }
        results[current] = await mapper(items[current])
      }
    }),
  )

  return results
}

class RegistryFetchError extends Error {
  readonly retryable: boolean
  readonly statusCode: number | undefined

  constructor(
    message: string,
    options: {
      cause?: unknown
      retryable?: boolean
      statusCode?: number
    } = {},
  ) {
    super(message, {
      cause: options.cause,
    })
    this.name = 'RegistryFetchError'
    this.retryable = Boolean(options.retryable)
    this.statusCode = options.statusCode
  }
}

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
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

function sanitizeRemoteTemplatePath(templatePath: string): string {
  const normalized = templatePath.replaceAll('\\', '/').replace(/^\.\/+/, '')
  if (normalized.length === 0) {
    throw new Error('Remote registry file path cannot be empty.')
  }

  const tokenMatches = normalized.matchAll(/\{\{([^{}]+)\}\}/g)
  let renderedPath = normalized
  for (const match of tokenMatches) {
    const token = match[1]
    if (!ALLOWED_TEMPLATE_PATH_TOKENS.has(token)) {
      throw new Error(`Unsupported template token "${token}" in remote file path "${templatePath}".`)
    }
    renderedPath = renderedPath.replace(match[0], `__${token}__`)
  }

  if (renderedPath.includes('{{') || renderedPath.includes('}}')) {
    throw new Error(`Malformed template token in remote file path "${templatePath}".`)
  }
  if (renderedPath.startsWith('/') || /^[A-Za-z]:\//.test(renderedPath)) {
    throw new Error(`Remote file path must be project-relative: "${templatePath}".`)
  }

  const segments = renderedPath.split('/').filter(Boolean)
  if (segments.includes('..')) {
    throw new Error(`Remote file path cannot traverse parent directories: "${templatePath}".`)
  }

  return normalized
}

function toRemotePathForMapping(sourcePath: string): string {
  const normalized = sourcePath.replaceAll('\\', '/').trim()
  try {
    const parsed = new URL(normalized)
    return decodeURIComponent(parsed.pathname).replace(/^\/+/, '')
  } catch {
    return normalized
  }
}

function findPathSuffix(pathValue: string, sourcePrefix: string): string | null {
  if (pathValue.startsWith(sourcePrefix)) {
    return pathValue.slice(sourcePrefix.length)
  }

  const marker = `/${sourcePrefix}`
  const markerIndex = pathValue.indexOf(marker)
  if (markerIndex === -1) {
    return null
  }

  return pathValue.slice(markerIndex + marker.length)
}

function assertSupportedRemoteFileProtocol(url: URL): void {
  if (ALLOWED_REMOTE_PROTOCOLS.has(url.protocol)) {
    return
  }

  throw new Error(`Unsupported remote file protocol "${url.protocol}".`)
}

function assertRemoteFileAccessAllowed(url: URL, registryUrl: URL, sourcePath: string): void {
  if (url.protocol !== 'file:') {
    if (registryUrl.protocol === 'file:') {
      throw new Error(`Local file registry cannot reference non-file URL "${sourcePath}".`)
    }
    const allowCrossOriginRegistryFiles = readBooleanEnv('FICTCN_ALLOW_CROSS_ORIGIN_REGISTRY_FILES', false)
    if (registryUrl.protocol === 'http:' || registryUrl.protocol === 'https:') {
      if (!allowCrossOriginRegistryFiles && url.origin !== registryUrl.origin) {
        throw new Error(
          `Cross-origin remote file references are not allowed by default ("${sourcePath}"). Set FICTCN_ALLOW_CROSS_ORIGIN_REGISTRY_FILES=1 to enable.`,
        )
      }
    }
    return
  }

  if (registryUrl.protocol !== 'file:') {
    throw new Error(`Remote HTTP registries cannot reference local file URLs ("${sourcePath}").`)
  }

  const registryRootDir = fileURLToPath(new URL('./', registryUrl))
  const candidatePath = fileURLToPath(url)
  const relative = path.relative(registryRootDir, candidatePath)
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return
  }

  throw new Error(`Remote file URL resolves outside the registry root: "${sourcePath}".`)
}
