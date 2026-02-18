import {
  getBuiltinBlock,
  getBuiltinComponent,
  getBuiltinTheme,
  listBuiltinBlockNames,
  listBuiltinComponentNames,
  listBuiltinThemeNames,
} from '../registry'
import { loadRegistryCatalog, type RegistryCatalogRecord } from '../registry/source'

export type ListType = 'components' | 'blocks' | 'themes' | 'all'

export interface ListOptions {
  json?: boolean
  type?: ListType | string
}

export function runList(options: ListOptions = {}): string {
  const type = normalizeListType(options.type)
  const records = collectRecords(type)

  return formatRecords(records, Boolean(options.json))
}

export interface RegistryListOptions extends ListOptions {
  cwd?: string
  registry?: string
}

export async function runListFromRegistry(options: RegistryListOptions = {}): Promise<string> {
  const type = normalizeListType(options.type)
  const catalog = await loadRegistryCatalog({
    cwd: options.cwd,
    registry: options.registry,
  })
  const records = filterRecordsByType(catalog, type)

  return formatRecords(records, Boolean(options.json))
}

function formatRecords(
  records: Array<{ kind: 'component' | 'block' | 'theme'; name: string; description: string }>,
  json: boolean,
): string {
  if (json) {
    return JSON.stringify(records, null, 2)
  }

  return records
    .map(record => `${record.kind.padEnd(10)} ${record.name.padEnd(24)} ${record.description}`)
    .join('\n')
}

function collectRecords(type: ListType) {
  const records: Array<{ kind: 'component' | 'block' | 'theme'; name: string; description: string }> = []

  if (type === 'components' || type === 'all') {
    for (const name of listBuiltinComponentNames()) {
      const component = getBuiltinComponent(name)
      records.push({ kind: 'component', name, description: component?.description ?? '' })
    }
  }

  if (type === 'blocks' || type === 'all') {
    for (const name of listBuiltinBlockNames()) {
      const block = getBuiltinBlock(name)
      records.push({ kind: 'block', name, description: block?.description ?? '' })
    }
  }

  if (type === 'themes' || type === 'all') {
    for (const name of listBuiltinThemeNames()) {
      const theme = getBuiltinTheme(name)
      records.push({ kind: 'theme', name, description: theme?.description ?? '' })
    }
  }

  return records
}

function filterRecordsByType(records: RegistryCatalogRecord[], type: ListType): RegistryCatalogRecord[] {
  if (type === 'all') {
    return [...records]
  }
  if (type === 'components') {
    return records.filter(record => record.kind === 'component')
  }
  if (type === 'blocks') {
    return records.filter(record => record.kind === 'block')
  }
  return records.filter(record => record.kind === 'theme')
}

function normalizeListType(type: ListOptions['type']): ListType {
  const value = (type ?? 'all').trim()
  switch (value) {
    case 'components':
    case 'blocks':
    case 'themes':
    case 'all':
      return value
    default:
      throw new Error(`Invalid list type "${value}". Expected one of: components, blocks, themes, all.`)
  }
}
