import { basicComponentRegistry } from './basic'
import { dataComponentRegistry } from './data'
import { feedbackComponentRegistry } from './feedback'
import { formComponentRegistry } from './forms'
import { navigationComponentRegistry } from './navigation'
import { overlayComponentRegistry } from './overlay'
import type { RegistryEntry } from '../types'

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
