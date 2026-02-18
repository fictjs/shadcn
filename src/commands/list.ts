import {
  getBuiltinBlock,
  getBuiltinComponent,
  getBuiltinTheme,
  listBuiltinBlockNames,
  listBuiltinComponentNames,
  listBuiltinThemeNames,
} from '../registry'

export interface ListOptions {
  json?: boolean
  type?: 'components' | 'blocks' | 'themes' | 'all'
}

export function runList(options: ListOptions = {}): string {
  const type = options.type ?? 'all'
  const records = collectRecords(type)

  if (options.json) {
    return JSON.stringify(records, null, 2)
  }

  return records
    .map(record => `${record.kind.padEnd(10)} ${record.name.padEnd(24)} ${record.description}`)
    .join('\n')
}

function collectRecords(type: 'components' | 'blocks' | 'themes' | 'all') {
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
