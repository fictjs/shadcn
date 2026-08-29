import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG, RUNTIME_DEPENDENCIES } from '../src/core/constants'
import { getBuiltinComponent } from '../src/registry'
import { renderRegistryEntryFiles } from '../src/registry/render'
import { builtinBlocks, builtinComponents, builtinThemes } from '../src/registry/builtin'

describe('builtin registry render completeness', () => {
  it('renders every builtin component, block, and theme file successfully', () => {
    const entries = [...builtinComponents, ...builtinBlocks, ...builtinThemes]
    const seen = new Set<string>()
    let totalFiles = 0

    for (const entry of entries) {
      expect(seen.has(entry.name)).toBe(false)
      seen.add(entry.name)

      const renderedFiles = renderRegistryEntryFiles(entry, DEFAULT_CONFIG)
      expect(renderedFiles.length).toBeGreaterThan(0)

      for (const rendered of renderedFiles) {
        totalFiles += 1
        expect(rendered.relativePath.length).toBeGreaterThan(0)
        expect(rendered.relativePath.includes('{{')).toBe(false)
        expect(rendered.content.length).toBeGreaterThan(0)
        expect(rendered.content.endsWith('\n')).toBe(true)
        expect(rendered.hash).toMatch(/^[a-f0-9]{64}$/)
      }
    }

    expect(seen.size).toBe(206)
    expect(totalFiles).toBeGreaterThanOrEqual(206)
  })

  it('keeps non-Radix helpers self-contained', () => {
    const selfContainedEntries = [
      'calendar',
      'combobox',
      'command',
      'resizable',
      'skeleton',
      'toast',
    ]

    for (const name of selfContainedEntries) {
      const entry = getBuiltinComponent(name)
      expect(entry, name).toBeDefined()
      expect(entry?.dependencies).not.toContain('@fictjs/ui-primitives')

      const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
        .map(file => file.content)
        .join('\n')
      expect(source, name).not.toContain("from '@fictjs/ui-primitives'")
    }
  })

  it('renders the Badge API used by website examples', () => {
    const entry = getBuiltinComponent('badge')
    expect(entry).not.toBeNull()
    expect(entry!.dependencies).toContain('@fictjs/radix-ui')
    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')

    expect(source).toContain("import { Slot } from '@fictjs/radix-ui'")
    expect(source).toContain("ghost: 'border-transparent")
    expect(source).toContain("link: 'border-transparent")
    expect(source).toContain('asChild?: boolean')
    expect(source).toContain("return <span class={classValue} data-slot='badge'")
  })

  it('renders the Alert Dialog API used by website examples', () => {
    const entry = getBuiltinComponent('alert-dialog')
    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')

    expect(source).toContain("size?: 'default' | 'sm'")
    expect(source).toContain("size === 'sm' ? 'max-w-xs' : 'max-w-lg'")
    expect(source).toContain('export function AlertDialogMedia')
    expect(source).toContain("variant?: 'default' | 'destructive'")
    expect(source).toContain('buttonVariants({ variant })')
  })

  it('renders the Avatar API used by website examples', () => {
    const entry = getBuiltinComponent('avatar')
    expect(entry?.dependencies).toContain('@fictjs/radix-ui')
    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')

    expect(source).toContain("import { Avatar as AvatarPrimitive } from '@fictjs/radix-ui'")
    expect(source).toContain("size?: 'default' | 'sm' | 'lg'")
    expect(source).toContain("data-slot='avatar-badge'")
    expect(source).toContain('export function AvatarGroup')
    expect(source).toContain('export function AvatarGroupCount')
  })

  it('renders the Card API used by website examples', () => {
    const entry = getBuiltinComponent('card')
    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')

    expect(source).toContain("size?: 'default' | 'sm'")
    expect(source).toContain("data-slot='card'")
    expect(source).toContain("data-slot='card-action'")
    expect(source).toContain('export function CardAction')
  })

  it('renders the Kbd API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('kbd')!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')
    expect(source).toContain("data-slot='kbd'")
    expect(source).toContain('export function KbdGroup')
    expect(source).toContain("data-slot='kbd-group'")
  })

  it('renders the Empty API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('empty')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain("data-slot='empty'")
    expect(source).toContain('export function EmptyHeader')
    expect(source).toContain('export function EmptyMedia')
    expect(source).toContain('export function EmptyContent')
  })

  it('renders the Sonner API used by website examples', () => {
    const toastSource = renderRegistryEntryFiles(getBuiltinComponent('toast')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    const sonnerSource = renderRegistryEntryFiles(getBuiltinComponent('sonner')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(toastSource).toContain("export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'error' | 'promise'")
    expect(toastSource).toContain("export type ToastPosition = 'top-left'")
    expect(toastSource).toContain('action?: ToastActionRecord')
    expect(toastSource).toContain("data-position={position}")
    expect(toastSource).toContain("data-variant={variant}")
    expect(sonnerSource).toContain('ToastActionRecord as SonnerActionRecord')
    expect(sonnerSource).toContain('ToastPosition as SonnerPosition')
  })

  it('renders the Tabs API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('tabs')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain("variant?: 'default' | 'line'")
    expect(source).toContain("data-variant={variant}")
    expect(source).toContain("variant === 'default' ? 'rounded-lg bg-muted p-1'")
    expect(source).toContain('[[data-variant=line]_&][data-state=active]:border-foreground')
  })

  it('renders the Tooltip API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('tooltip')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain('export const TooltipTrigger = TooltipPrimitive.Trigger')
    expect(source).toContain('export const TooltipTriggerEl = TooltipPrimitive.Trigger')
  })

  it('renders the Command dialog API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('command')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain('const open = createSignal(false)')
    expect(source).toContain('return () => context.open() ? (')
    expect(source).toContain("if (!event.defaultPrevented && event.key === 'Escape') context.setOpen(false)")
  })

  it('renders the Field composition API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('field')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain("orientation?: 'vertical' | 'horizontal' | 'responsive'")
    expect(source).toContain("data-slot='field'")
    expect(source).toContain('export function FieldSet')
    expect(source).toContain('export function FieldLegend')
    expect(source).toContain('export function FieldGroup')
    expect(source).toContain('export function FieldContent')
    expect(source).toContain('export function FieldSeparator')
  })

  it('renders the Item API used by website examples', () => {
    const entry = getBuiltinComponent('item')!
    expect(entry.dependencies).toContain('@fictjs/radix-ui')
    const source = renderRegistryEntryFiles(entry, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain("variant?: 'default' | 'outline' | 'muted'")
    expect(source).toContain("size?: 'default' | 'sm' | 'xs'")
    expect(source).toContain("if (asChild) return <Slot.Root data-slot='item'")
    expect(source).toContain('export const ItemMedia = ItemLeading')
    expect(source).toContain('export const ItemActions = ItemTrailing')
    expect(source).toContain('export function ItemGroup')
    expect(source).toContain('export function ItemHeader')
  })

  it('renders the Menubar API used by website examples', () => {
    const source = renderRegistryEntryFiles(getBuiltinComponent('menubar')!, DEFAULT_CONFIG).map(file => file.content).join('\n')
    expect(source).toContain('export const MenubarGroup = MenubarPrimitive.Group')
    expect(source).toContain('export const MenubarRadioGroup = MenubarPrimitive.RadioGroup')
    expect(source).toContain('export const MenubarSub = MenubarPrimitive.Sub')
    expect(source).toContain('export function MenubarCheckboxItem')
    expect(source).toContain('export function MenubarRadioItem')
    expect(source).toContain('export function MenubarSeparator')
    expect(source).toContain('export function MenubarShortcut')
    expect(source).toContain('export function MenubarSubTrigger')
    expect(source).toContain('export function MenubarSubContent')
  })

  it('uses the published Radix umbrella for every primitive-backed component', () => {
    expect(RUNTIME_DEPENDENCIES).toContain('@fictjs/radix-ui')
    expect(RUNTIME_DEPENDENCIES).not.toContain('@fictjs/ui-primitives')

    for (const entry of builtinComponents) {
      const source = renderRegistryEntryFiles(entry, DEFAULT_CONFIG)
        .map(file => file.content)
        .join('\n')

      expect(entry.dependencies, entry.name).not.toContain('@fictjs/ui-primitives')
      expect(source, entry.name).not.toContain("from '@fictjs/ui-primitives'")

      if (source.includes("from '@fictjs/radix-ui'")) {
        expect(entry.dependencies, entry.name).toContain('@fictjs/radix-ui')
      }
      if (entry.dependencies.includes('@fictjs/radix-ui')) {
        expect(source, entry.name).toContain("from '@fictjs/radix-ui'")
      }
    }
  })

  it('supports every Button API used by the website examples', () => {
    const entry = getBuiltinComponent('button')
    expect(entry?.dependencies).toContain('@fictjs/radix-ui')

    const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
      .map(file => file.content)
      .join('\n')
    for (const size of ['xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg']) {
      expect(source).toContain(`${size.includes('-') ? `'${size}'` : size}:`)
    }
    expect(source).toContain('asChild?: boolean')
    expect(source).toContain('<Slot.Root')
    expect(source).toContain("data-slot='button'")
  })
})
