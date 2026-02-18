import { listBuiltinComponentNames, getBuiltinComponent } from '../registry'

export interface ListOptions {
  json?: boolean
}

export function runList(options: ListOptions = {}): string {
  const names = listBuiltinComponentNames()
  if (options.json) {
    return JSON.stringify(
      names.map(name => {
        const component = getBuiltinComponent(name)
        return {
          name,
          description: component?.description ?? '',
        }
      }),
      null,
      2,
    )
  }

  return names
    .map(name => {
      const component = getBuiltinComponent(name)
      return `${name.padEnd(18)} ${component?.description ?? ''}`
    })
    .join('\n')
}
