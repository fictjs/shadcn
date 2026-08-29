import type { RegistryEntry } from '../types'

export const navigationComponentRegistry: RegistryEntry[] = [
  {
    name: 'dropdown-menu',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Dropdown menu wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: ['separator'],
    files: [
      {
        path: '{{componentsDir}}/dropdown-menu.tsx',
        content:
          context => `import { DropdownMenu as DropdownMenuPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuRadio = DropdownMenuPrimitive.RadioGroup
export const DropdownMenuSub = DropdownMenuPrimitive.Sub

type GenericProps = {
  class?: string
  inset?: boolean
  children?: unknown
  [key: string]: unknown
}

export function DropdownMenuTrigger(props: GenericProps) {
  return <DropdownMenuPrimitive.Trigger {...props} />
}

export function DropdownMenuContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <DropdownMenuPrimitive.Content
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function DropdownMenuItem(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <DropdownMenuPrimitive.Item
      class={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function DropdownMenuCheckboxItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <DropdownMenuPrimitive.CheckboxItem
      class={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuRadioItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <DropdownMenuPrimitive.RadioItem
      class={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export function DropdownMenuLabel(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return <DropdownMenuPrimitive.Label class={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...rest} />
}

export function DropdownMenuSeparator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <DropdownMenuPrimitive.Separator class={cn('-mx-1 my-1 h-px bg-muted', className)} {...rest} />
}

export function DropdownMenuSubTrigger(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <DropdownMenuPrimitive.SubTrigger
      class={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent data-[state=open]:bg-accent', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function DropdownMenuSubContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <DropdownMenuPrimitive.SubContent
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'context-menu',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Context menu wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: ['separator'],
    files: [
      {
        path: '{{componentsDir}}/context-menu.tsx',
        content: context => `import { ContextMenu as ContextMenuPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuSub = ContextMenuPrimitive.Sub

type GenericProps = {
  class?: string
  inset?: boolean
  children?: unknown
  [key: string]: unknown
}

export function ContextMenuContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <ContextMenuPrimitive.Content
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function ContextMenuItem(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <ContextMenuPrimitive.Item
      class={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function ContextMenuSubTrigger(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <ContextMenuPrimitive.SubTrigger
      class={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent data-[state=open]:bg-accent', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function ContextMenuSubContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <ContextMenuPrimitive.SubContent
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'menubar',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Menubar wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/menubar.tsx',
        content: context => `import { Menubar as MenubarPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Menubar = MenubarPrimitive.Root
export const MenubarMenu = MenubarPrimitive.Menu

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function MenubarTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <MenubarPrimitive.Trigger
      class={cn('flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    />
  )
}

export function MenubarContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <MenubarPrimitive.Content
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function MenubarItem(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <MenubarPrimitive.Item
      class={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'tabs',
    version: '0.3.0',
    type: 'ui-component',
    description: 'Tabs wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/tabs.tsx',
        content: context => `import { Tabs as TabsPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Tabs = TabsPrimitive.Root

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function TabsList(props: GenericProps & { variant?: 'default' | 'line' }) {
  const { class: className, variant = 'default', ...rest } = props
  return (
    <TabsPrimitive.List
      data-variant={variant}
      class={cn(
        'inline-flex h-9 items-center justify-center text-muted-foreground',
        variant === 'default' ? 'rounded-lg bg-muted p-1' : 'gap-4 border-b bg-transparent p-0',
        className,
      )}
      {...rest}
    />
  )
}

export function TabsTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <TabsPrimitive.Trigger
      class={cn('inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm [[data-variant=line]_&]:rounded-none [[data-variant=line]_&]:border-b-2 [[data-variant=line]_&]:border-transparent [[data-variant=line]_&]:px-0 [[data-variant=line]_&]:shadow-none [[data-variant=line]_&][data-state=active]:border-foreground', className)}
      {...rest}
    />
  )
}

export function TabsContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <TabsPrimitive.Content class={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'accordion',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Accordion wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/accordion.tsx',
        content: context => `import { Accordion as AccordionPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Accordion = AccordionPrimitive.Root

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function AccordionItem(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AccordionPrimitive.Item class={cn('border-b', className)} {...rest} />
}

export function AccordionTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <AccordionPrimitive.Trigger
      class={cn('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline', className)}
      {...rest}
    />
  )
}

export function AccordionContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AccordionPrimitive.Content class={cn('overflow-hidden text-sm', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'collapsible',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Collapsible wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/collapsible.tsx',
        content: context => `import { Collapsible as CollapsiblePrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Collapsible = CollapsiblePrimitive.Root

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function CollapsibleTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return <CollapsiblePrimitive.Trigger class={cn('inline-flex items-center justify-center text-sm font-medium', className)} {...rest} />
}

export function CollapsibleContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <CollapsiblePrimitive.Content class={cn('overflow-hidden text-sm', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'navigation-menu',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Navigation menu wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/navigation-menu.tsx',
        content:
          context => `import { NavigationMenu as NavigationMenuPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const NavigationMenu = NavigationMenuPrimitive.Root
export const NavigationMenuItem = NavigationMenuPrimitive.Item

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function NavigationMenuList(props: GenericProps) {
  const { class: className, ...rest } = props
  return <NavigationMenuPrimitive.List class={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)} {...rest} />
}

export function NavigationMenuTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return <NavigationMenuPrimitive.Trigger class={cn('group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', className)} {...rest} />
}

export function NavigationMenuContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <NavigationMenuPrimitive.Content class={cn('left-0 top-0 w-full md:absolute md:w-auto', className)} {...rest} />
}

export function NavigationMenuLink(props: GenericProps) {
  const { class: className, ...rest } = props
  return <NavigationMenuPrimitive.Link class={cn('block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground', className)} {...rest} />
}

export function NavigationMenuIndicator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <NavigationMenuPrimitive.Indicator class={cn('top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden', className)} {...rest} />
}

export function NavigationMenuViewport(props: GenericProps) {
  const { class: className, ...rest } = props
  return <NavigationMenuPrimitive.Viewport class={cn('origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow', className)} {...rest} />
}
`,
      },
    ],
  },
]
