import { listBuiltinComponentNames, getBuiltinComponent } from '../registry'

export function runSearch(query: string): string {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) {
    return ''
  }

  const matches = listBuiltinComponentNames().filter(name => {
    const component = getBuiltinComponent(name)
    return (
      name.toLowerCase().includes(normalized) ||
      (component?.description.toLowerCase().includes(normalized) ?? false)
    )
  })

  return matches
    .map(name => {
      const component = getBuiltinComponent(name)
      return `${name.padEnd(18)} ${component?.description ?? ''}`
    })
    .join('\n')
}
