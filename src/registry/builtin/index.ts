import { builtinBlocks as coreBuiltinBlocks } from './blocks'
import { basicComponentRegistry } from './basic'
import { dataComponentRegistry } from './data'
import { expandedBlockRegistry, expandedComponentRegistry, expandedThemeRegistry } from './expanded'
import { feedbackComponentRegistry } from './feedback'
import { formComponentRegistry } from './forms'
import { navigationComponentRegistry } from './navigation'
import { overlayComponentRegistry } from './overlay'
import { builtinThemes as coreBuiltinThemes } from './themes'
import type { RegistryEntry } from '../types'

export { builtinBlocks as coreBuiltinBlocks } from './blocks'
export { builtinThemes as coreBuiltinThemes } from './themes'

export const builtinBlocks: RegistryEntry[] = [...coreBuiltinBlocks, ...expandedBlockRegistry]
export const builtinThemes: RegistryEntry[] = [...coreBuiltinThemes, ...expandedThemeRegistry]

export const builtinComponents: RegistryEntry[] = [
  ...basicComponentRegistry,
  ...formComponentRegistry,
  ...overlayComponentRegistry,
  ...navigationComponentRegistry,
  ...feedbackComponentRegistry,
  ...dataComponentRegistry,
  ...expandedComponentRegistry,
]

export const builtinRegistry: Record<string, RegistryEntry> = Object.fromEntries(
  builtinComponents.map(entry => [entry.name, entry]),
)

export const builtinBlockRegistry: Record<string, RegistryEntry> = Object.fromEntries(
  builtinBlocks.map(entry => [entry.name, entry]),
)

export const builtinThemeRegistry: Record<string, RegistryEntry> = Object.fromEntries(
  builtinThemes.map(entry => [entry.name, entry]),
)
