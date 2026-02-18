import { builtinBlocks } from './blocks'
import { basicComponentRegistry } from './basic'
import { dataComponentRegistry } from './data'
import { feedbackComponentRegistry } from './feedback'
import { formComponentRegistry } from './forms'
import { navigationComponentRegistry } from './navigation'
import { overlayComponentRegistry } from './overlay'
import { builtinThemes } from './themes'
import type { RegistryEntry } from '../types'

export { builtinBlocks } from './blocks'
export { builtinThemes } from './themes'

export const builtinComponents: RegistryEntry[] = [
  ...basicComponentRegistry,
  ...formComponentRegistry,
  ...overlayComponentRegistry,
  ...navigationComponentRegistry,
  ...feedbackComponentRegistry,
  ...dataComponentRegistry,
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
