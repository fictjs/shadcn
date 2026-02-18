import type { RegistryEntry } from '../types'

export const overlayComponentRegistry: RegistryEntry[] = [
  {
    name: 'dialog',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Dialog primitives with styled wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['button'],
    files: [
      {
        path: '{{componentsDir}}/dialog.tsx',
        content: context => `import {
  DialogRoot,
  DialogPortal,
  DialogTrigger,
  DialogOverlay as PrimitiveDialogOverlay,
  DialogContent as PrimitiveDialogContent,
  DialogTitle as PrimitiveDialogTitle,
  DialogDescription as PrimitiveDialogDescription,
  DialogClose as PrimitiveDialogClose,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Dialog = DialogRoot
export { DialogPortal, DialogTrigger }

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function DialogOverlay(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDialogOverlay class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)} {...rest} />
}

export function DialogContent(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <>
      <DialogOverlay />
      <PrimitiveDialogContent
        class={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          className,
        )}
        {...rest}
      >
        {children}
        <PrimitiveDialogClose class='absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
          <span aria-hidden='true'>×</span>
        </PrimitiveDialogClose>
      </PrimitiveDialogContent>
    </>
  )
}

export function DialogHeader(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...rest} />
}

export function DialogFooter(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...rest} />
}

export function DialogTitle(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDialogTitle class={cn('text-lg font-semibold leading-none tracking-tight', className)} {...rest} />
}

export function DialogDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDialogDescription class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export const DialogClose = PrimitiveDialogClose
`,
      },
    ],
  },
  {
    name: 'alert-dialog',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Alert dialog wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['button'],
    files: [
      {
        path: '{{componentsDir}}/alert-dialog.tsx',
        content: context => `import {
  AlertDialogRoot,
  AlertDialogPortal,
  AlertDialogTrigger,
  AlertDialogOverlay as PrimitiveAlertDialogOverlay,
  AlertDialogContent as PrimitiveAlertDialogContent,
  AlertDialogTitle as PrimitiveAlertDialogTitle,
  AlertDialogDescription as PrimitiveAlertDialogDescription,
  AlertDialogAction as PrimitiveAlertDialogAction,
  AlertDialogCancel as PrimitiveAlertDialogCancel,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'
import { buttonVariants } from '${context.uiImport('button')}'

export const AlertDialog = AlertDialogRoot
export { AlertDialogPortal, AlertDialogTrigger }

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function AlertDialogOverlay(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAlertDialogOverlay class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)} {...rest} />
}

export function AlertDialogContent(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <>
      <AlertDialogOverlay />
      <PrimitiveAlertDialogContent
        class={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          className,
        )}
        {...rest}
      >
        {children}
      </PrimitiveAlertDialogContent>
    </>
  )
}

export function AlertDialogHeader(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...rest} />
}

export function AlertDialogFooter(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...rest} />
}

export function AlertDialogTitle(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAlertDialogTitle class={cn('text-lg font-semibold', className)} {...rest} />
}

export function AlertDialogDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAlertDialogDescription class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function AlertDialogAction(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAlertDialogAction class={cn(buttonVariants(), className)} {...rest} />
}

export function AlertDialogCancel(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveAlertDialogCancel class={cn(buttonVariants({ variant: 'outline' }), className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'popover',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Popover primitive wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/popover.tsx',
        content: context => `import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent as PrimitivePopoverContent,
  PopoverClose,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Popover = PopoverRoot
export { PopoverTrigger, PopoverClose }

type PopoverContentProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function PopoverContent(props: PopoverContentProps) {
  const { class: className, sideOffset = 4, ...rest } = props
  return (
    <PrimitivePopoverContent
      sideOffset={sideOffset}
      class={cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'tooltip',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Tooltip primitive wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/tooltip.tsx',
        content: context => `import {
  TooltipProvider as PrimitiveTooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent as PrimitiveTooltipContent,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const TooltipProvider = PrimitiveTooltipProvider
export const Tooltip = TooltipRoot
export const TooltipTriggerEl = TooltipTrigger

type TooltipContentProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function TooltipContent(props: TooltipContentProps) {
  const { class: className, sideOffset = 4, ...rest } = props
  return (
    <PrimitiveTooltipContent
      sideOffset={sideOffset}
      class={cn('z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'hover-card',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Hover card primitive wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/hover-card.tsx',
        content: context => `import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent as PrimitiveHoverCardContent,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const HoverCard = HoverCardRoot
export const HoverCardTriggerEl = HoverCardTrigger

type HoverCardContentProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function HoverCardContent(props: HoverCardContentProps) {
  const { class: className, align = 'center', sideOffset = 4, ...rest } = props
  return (
    <PrimitiveHoverCardContent
      align={align}
      sideOffset={sideOffset}
      class={cn('z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'sheet',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Drawer-style sheet based on dialog primitives',
    dependencies: ['@fictjs/ui-primitives', 'class-variance-authority'],
    registryDependencies: ['dialog'],
    files: [
      {
        path: '{{componentsDir}}/sheet.tsx',
        content: context => `import {
  DialogRoot,
  DialogTrigger,
  DialogClose,
  DialogOverlay as PrimitiveDialogOverlay,
  DialogContent as PrimitiveDialogContent,
  DialogTitle as PrimitiveDialogTitle,
  DialogDescription as PrimitiveDialogDescription,
} from '@fictjs/ui-primitives'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

export const Sheet = DialogRoot
export const SheetTrigger = DialogTrigger
export const SheetClose = DialogClose

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type SheetContentProps = GenericProps & VariantProps<typeof sheetVariants>

export function SheetOverlay(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDialogOverlay class={cn('fixed inset-0 z-50 bg-black/80', className)} {...rest} />
}

export function SheetContent(props: SheetContentProps) {
  const { class: className, children, side, ...rest } = props
  return (
    <>
      <SheetOverlay />
      <PrimitiveDialogContent class={cn(sheetVariants({ side }), className)} {...rest}>
        {children}
      </PrimitiveDialogContent>
    </>
  )
}

export function SheetHeader(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...rest} />
}

export function SheetFooter(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end', className)} {...rest} />
}

export function SheetTitle(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDialogTitle class={cn('text-lg font-semibold text-foreground', className)} {...rest} />
}

export function SheetDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveDialogDescription class={cn('text-sm text-muted-foreground', className)} {...rest} />
}
`,
      },
    ],
  },
]
