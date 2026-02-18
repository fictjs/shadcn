import type { RegistryEntry } from '../types'

export const navigationComponentRegistry: RegistryEntry[] = [
  {
    name: 'dropdown-menu',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Dropdown menu wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['separator'],
    files: [
      {
        path: '{{componentsDir}}/dropdown-menu.tsx',
        content: context => `import {
  DropdownMenuRoot,
  DropdownMenuTrigger as PrimitiveDropdownMenuTrigger,
  DropdownMenuContent as PrimitiveDropdownMenuContent,
  DropdownMenuItem as PrimitiveDropdownMenuItem,
  DropdownMenuCheckboxItem as PrimitiveDropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem as PrimitiveDropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger as PrimitiveDropdownMenuSubTrigger,
  DropdownMenuSubContent as PrimitiveDropdownMenuSubContent,
  DropdownMenuLabel as PrimitiveDropdownMenuLabel,
  DropdownMenuSeparator as PrimitiveDropdownMenuSeparator,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const DropdownMenu = DropdownMenuRoot
export const DropdownMenuRadio = DropdownMenuRadioGroup
export { DropdownMenuSub }

type GenericProps = {
  class?: string
  inset?: boolean
  children?: unknown
  [key: string]: unknown
}

export function DropdownMenuTrigger(props: GenericProps) {
  return <PrimitiveDropdownMenuTrigger {...props} />
}

export function DropdownMenuContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveDropdownMenuContent
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function DropdownMenuItem(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <PrimitiveDropdownMenuItem
      class={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function DropdownMenuCheckboxItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <PrimitiveDropdownMenuCheckboxItem
      class={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    >
      {children}
    </PrimitiveDropdownMenuCheckboxItem>
  )
}

export function DropdownMenuRadioItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <PrimitiveDropdownMenuRadioItem
      class={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    >
      {children}
    </PrimitiveDropdownMenuRadioItem>
  )
}

export function DropdownMenuLabel(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return <PrimitiveDropdownMenuLabel class={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...rest} />
}

export function DropdownMenuSeparator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDropdownMenuSeparator class={cn('-mx-1 my-1 h-px bg-muted', className)} {...rest} />
}

export function DropdownMenuSubTrigger(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <PrimitiveDropdownMenuSubTrigger
      class={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent data-[state=open]:bg-accent', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function DropdownMenuSubContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveDropdownMenuSubContent
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
    version: '0.1.0',
    type: 'ui-component',
    description: 'Context menu wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['separator'],
    files: [
      {
        path: '{{componentsDir}}/context-menu.tsx',
        content: context => `import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent as PrimitiveContextMenuContent,
  ContextMenuItem as PrimitiveContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger as PrimitiveContextMenuSubTrigger,
  ContextMenuSubContent as PrimitiveContextMenuSubContent,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const ContextMenu = ContextMenuRoot
export { ContextMenuTrigger, ContextMenuSub }

type GenericProps = {
  class?: string
  inset?: boolean
  children?: unknown
  [key: string]: unknown
}

export function ContextMenuContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveContextMenuContent
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function ContextMenuItem(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <PrimitiveContextMenuItem
      class={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function ContextMenuSubTrigger(props: GenericProps) {
  const { class: className, inset, ...rest } = props
  return (
    <PrimitiveContextMenuSubTrigger
      class={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent data-[state=open]:bg-accent', inset && 'pl-8', className)}
      {...rest}
    />
  )
}

export function ContextMenuSubContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveContextMenuSubContent
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
    version: '0.1.0',
    type: 'ui-component',
    description: 'Menubar wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/menubar.tsx',
        content: context => `import {
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger as PrimitiveMenubarTrigger,
  MenubarContent as PrimitiveMenubarContent,
  MenubarItem as PrimitiveMenubarItem,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Menubar = MenubarRoot
export { MenubarMenu }

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function MenubarTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveMenubarTrigger
      class={cn('flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    />
  )
}

export function MenubarContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveMenubarContent
      class={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function MenubarItem(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveMenubarItem
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
    version: '0.1.0',
    type: 'ui-component',
    description: 'Tabs wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/tabs.tsx',
        content: context => `import {
  TabsRoot,
  TabsList as PrimitiveTabsList,
  TabsTrigger as PrimitiveTabsTrigger,
  TabsContent as PrimitiveTabsContent,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Tabs = TabsRoot

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function TabsList(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveTabsList class={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)} {...rest} />
}

export function TabsTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveTabsTrigger
      class={cn('inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', className)}
      {...rest}
    />
  )
}

export function TabsContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveTabsContent class={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'accordion',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Accordion wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/accordion.tsx',
        content: context => `import {
  AccordionRoot,
  AccordionItem as PrimitiveAccordionItem,
  AccordionTrigger as PrimitiveAccordionTrigger,
  AccordionContent as PrimitiveAccordionContent,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Accordion = AccordionRoot

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function AccordionItem(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAccordionItem class={cn('border-b', className)} {...rest} />
}

export function AccordionTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveAccordionTrigger
      class={cn('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline', className)}
      {...rest}
    />
  )
}

export function AccordionContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAccordionContent class={cn('overflow-hidden text-sm', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'collapsible',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Collapsible wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/collapsible.tsx',
        content: context => `import {
  CollapsibleRoot,
  CollapsibleTrigger as PrimitiveCollapsibleTrigger,
  CollapsibleContent as PrimitiveCollapsibleContent,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Collapsible = CollapsibleRoot

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function CollapsibleTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCollapsibleTrigger class={cn('inline-flex items-center justify-center text-sm font-medium', className)} {...rest} />
}

export function CollapsibleContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCollapsibleContent class={cn('overflow-hidden text-sm', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'navigation-menu',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Navigation menu wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/navigation-menu.tsx',
        content: context => `import {
  NavigationMenuRoot,
  NavigationMenuList as PrimitiveNavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger as PrimitiveNavigationMenuTrigger,
  NavigationMenuContent as PrimitiveNavigationMenuContent,
  NavigationMenuLink as PrimitiveNavigationMenuLink,
  NavigationMenuIndicator as PrimitiveNavigationMenuIndicator,
  NavigationMenuViewport as PrimitiveNavigationMenuViewport,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const NavigationMenu = NavigationMenuRoot
export { NavigationMenuItem }

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function NavigationMenuList(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveNavigationMenuList class={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)} {...rest} />
}

export function NavigationMenuTrigger(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveNavigationMenuTrigger class={cn('group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', className)} {...rest} />
}

export function NavigationMenuContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveNavigationMenuContent class={cn('left-0 top-0 w-full md:absolute md:w-auto', className)} {...rest} />
}

export function NavigationMenuLink(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveNavigationMenuLink class={cn('block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground', className)} {...rest} />
}

export function NavigationMenuIndicator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveNavigationMenuIndicator class={cn('top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden', className)} {...rest} />
}

export function NavigationMenuViewport(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveNavigationMenuViewport class={cn('origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow', className)} {...rest} />
}
`,
      },
    ],
  },
]
