import {
  getBuiltinBlock,
  getBuiltinComponent,
  getBuiltinTheme,
  listBuiltinBlockNames,
  listBuiltinComponentNames,
  listBuiltinThemeNames,
} from '../registry'
import { loadRegistryCatalog } from '../registry/source'

export function runSearch(query: string): string {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) {
    return ''
  }

  const records: Array<{ kind: string; name: string; description: string }> = [
    ...listBuiltinComponentNames().map(name => ({
      kind: 'component',
      name,
      description: getBuiltinComponent(name)?.description ?? '',
    })),
    ...listBuiltinBlockNames().map(name => ({
      kind: 'block',
      name,
      description: getBuiltinBlock(name)?.description ?? '',
    })),
    ...listBuiltinThemeNames().map(name => ({
      kind: 'theme',
      name,
      description: getBuiltinTheme(name)?.description ?? '',
    })),
  ]

  const matches = records.filter(record => {
    return (
      record.name.toLowerCase().includes(normalized) ||
      record.description.toLowerCase().includes(normalized)
    )
  })

  return matches
    .map(record => `${record.kind.padEnd(10)} ${record.name.padEnd(24)} ${record.description}`)
    .join('\n')
}

export interface RegistrySearchOptions {
  cwd?: string
  registry?: string
}

export async function runSearchFromRegistry(query: string, options: RegistrySearchOptions = {}): Promise<string> {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) {
    return ''
  }

  const records = await loadRegistryCatalog({
    cwd: options.cwd,
    registry: options.registry,
  })

  const matches = records.filter(record => {
    return (
      record.name.toLowerCase().includes(normalized) ||
      record.description.toLowerCase().includes(normalized)
    )
  })

  return matches
    .map(record => `${record.kind.padEnd(10)} ${record.name.padEnd(24)} ${record.description}`)
    .join('\n')
}
