import {
  getBuiltinBlock,
  getBuiltinComponent,
  getBuiltinTheme,
  listBuiltinBlockNames,
  listBuiltinComponentNames,
  listBuiltinThemeNames,
} from '../registry'

export type ListType = 'components' | 'blocks' | 'themes' | 'all'

export interface ListOptions {
  json?: boolean
  type?: ListType | string
}

export function runList(options: ListOptions = {}): string {
  const type = normalizeListType(options.type)
  const records = collectRecords(type)

  if (options.json) {
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
