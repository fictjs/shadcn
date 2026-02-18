import { builtinRegistry } from './builtin'
import type { RegistryEntry } from './types'

export function listBuiltinComponentNames(): string[] {
  return Object.keys(builtinRegistry).sort((left, right) => left.localeCompare(right))
}

export function getBuiltinComponent(name: string): RegistryEntry | null {
  return builtinRegistry[name] ?? null
}

export function resolveBuiltinComponentGraph(componentNames: string[]): RegistryEntry[] {
  const resolved: RegistryEntry[] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()

  for (const name of componentNames) {
    visit(name, resolved, visiting, visited)
  }

  return resolved
}

function visit(
  name: string,
  resolved: RegistryEntry[],
  visiting: Set<string>,
  visited: Set<string>,
): void {
  if (visited.has(name)) return
  if (visiting.has(name)) {
    throw new Error(`Circular registry dependency detected: ${name}`)
  }

  const entry = builtinRegistry[name]
  if (!entry) {
    throw new Error(`Unknown registry component: ${name}`)
  }

  visiting.add(name)
  for (const dependency of entry.registryDependencies) {
    visit(dependency, resolved, visiting, visited)
  }
  visiting.delete(name)

  visited.add(name)
  resolved.push(entry)
}
