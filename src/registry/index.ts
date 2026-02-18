import { builtinBlockRegistry, builtinBlocks, builtinRegistry, builtinThemeRegistry, builtinThemes } from './builtin'
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

export function listBuiltinBlockNames(): string[] {
  return Object.keys(builtinBlockRegistry).sort((left, right) => left.localeCompare(right))
}

export function getBuiltinBlock(name: string): RegistryEntry | null {
  return builtinBlockRegistry[name] ?? null
}

export function resolveBuiltinBlockGraph(blockNames: string[]): RegistryEntry[] {
  const resolved: RegistryEntry[] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()

  for (const name of blockNames) {
    visitBlock(name, resolved, visiting, visited)
  }

  return resolved
}

export function listBuiltinThemeNames(): string[] {
  return Object.keys(builtinThemeRegistry).sort((left, right) => left.localeCompare(right))
}

export function getBuiltinTheme(name: string): RegistryEntry | null {
  return builtinThemeRegistry[name] ?? null
}

export function listBuiltinBlocks(): RegistryEntry[] {
  return [...builtinBlocks]
}

export function listBuiltinThemes(): RegistryEntry[] {
  return [...builtinThemes]
}

function visit(
  name: string,
  resolved: RegistryEntry[],
  visiting: Set<string>,
  visited: Set<string>,
  source: Record<string, RegistryEntry> = builtinRegistry,
): void {
  if (visited.has(name)) return
  if (visiting.has(name)) {
    throw new Error(`Circular registry dependency detected: ${name}`)
  }

  const entry = source[name]
  if (!entry) {
    throw new Error(`Unknown registry component: ${name}`)
  }

  visiting.add(name)
  for (const dependency of entry.registryDependencies) {
    visit(dependency, resolved, visiting, visited, source)
  }
  visiting.delete(name)

  visited.add(name)
  resolved.push(entry)
}

function visitBlock(
  name: string,
  resolved: RegistryEntry[],
  visiting: Set<string>,
  visited: Set<string>,
): void {
  if (visited.has(name)) return
  if (visiting.has(name)) {
    throw new Error(`Circular block dependency detected: ${name}`)
  }

  const entry = builtinBlockRegistry[name]
  if (!entry) {
    throw new Error(`Unknown registry block: ${name}`)
  }

  visiting.add(name)
  for (const dependency of entry.registryDependencies) {
    if (builtinBlockRegistry[dependency]) {
      visitBlock(dependency, resolved, visiting, visited)
    }
  }
  visiting.delete(name)

  visited.add(name)
  resolved.push(entry)
}
