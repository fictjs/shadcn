import type { RegistryEntry } from '../types'

export const overlayComponentRegistry: RegistryEntry[] = [
  {
    name: 'dialog',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Dialog primitives with styled wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: ['button'],
    files: [
      {
        path: '{{componentsDir}}/dialog.tsx',
        content: context => `import { Dialog as DialogPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Dialog = DialogPrimitive.Root
export const DialogPortal = DialogPrimitive.Portal
export const DialogTrigger = DialogPrimitive.Trigger

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function DialogOverlay(props: GenericProps) {
  const { class: className, ...rest } = props
  return <DialogPrimitive.Overlay class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)} {...rest} />
}

export function DialogContent(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <>
      <DialogOverlay />
      <DialogPrimitive.Content
        class={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          className,
        )}
        {...rest}
      >
        {children}
        <DialogPrimitive.Close class='absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
          <span aria-hidden='true'>×</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
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
  return <DialogPrimitive.Title class={cn('text-lg font-semibold leading-none tracking-tight', className)} {...rest} />
}

export function DialogDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <DialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export const DialogClose = DialogPrimitive.Close
`,
      },
    ],
  },
  {
    name: 'alert-dialog',
    version: '0.3.0',
    type: 'ui-component',
    description: 'Alert dialog wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: ['button'],
    files: [
      {
        path: '{{componentsDir}}/alert-dialog.tsx',
        content: context => `import { AlertDialog as AlertDialogPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'
import { buttonVariants } from '${context.uiImport('button')}'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogPortal = AlertDialogPrimitive.Portal
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type AlertDialogContentProps = GenericProps & {
  size?: 'default' | 'sm'
}

type AlertDialogActionProps = GenericProps & {
  variant?: 'default' | 'destructive'
}

export function AlertDialogOverlay(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AlertDialogPrimitive.Overlay class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)} {...rest} />
}

export function AlertDialogContent(props: AlertDialogContentProps) {
  const { class: className, children, size = 'default', ...rest } = props
  return (
    <>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        class={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          size === 'sm' ? 'max-w-xs' : 'max-w-lg',
          className,
        )}
        {...rest}
      >
        {children}
      </AlertDialogPrimitive.Content>
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
  return <AlertDialogPrimitive.Title class={cn('text-lg font-semibold', className)} {...rest} />
}

export function AlertDialogDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AlertDialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function AlertDialogMedia(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div class={cn('mb-2 flex size-10 items-center justify-center rounded-full bg-muted [&_svg]:size-5', className)} {...rest} />
}

export function AlertDialogAction(props: AlertDialogActionProps) {
  const { class: className, variant = 'default', ...rest } = props
  return <AlertDialogPrimitive.Action class={cn(buttonVariants({ variant }), className)} {...rest} />
}

export function AlertDialogCancel(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AlertDialogPrimitive.Cancel class={cn(buttonVariants({ variant: 'outline' }), className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'popover',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Popover primitive wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/popover.tsx',
        content: context => `import { Popover as PopoverPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverClose = PopoverPrimitive.Close

type PopoverContentProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function PopoverContent(props: PopoverContentProps) {
  const { class: className, sideOffset = 4, ...rest } = props
  return (
    <PopoverPrimitive.Content
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
    version: '0.2.0',
    type: 'ui-component',
    description: 'Tooltip primitive wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/tooltip.tsx',
        content: context => `import { Tooltip as TooltipPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTriggerEl = TooltipPrimitive.Trigger

type TooltipContentProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function TooltipContent(props: TooltipContentProps) {
  const { class: className, sideOffset = 4, ...rest } = props
  return (
    <TooltipPrimitive.Content
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
    version: '0.2.0',
    type: 'ui-component',
    description: 'Hover card primitive wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/hover-card.tsx',
        content: context => `import { HoverCard as HoverCardPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const HoverCard = HoverCardPrimitive.Root
export const HoverCardTriggerEl = HoverCardPrimitive.Trigger

type HoverCardContentProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function HoverCardContent(props: HoverCardContentProps) {
  const { class: className, align = 'center', sideOffset = 4, ...rest } = props
  return (
    <HoverCardPrimitive.Content
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
    version: '0.2.0',
    type: 'ui-component',
    description: 'Drawer-style sheet based on dialog primitives',
    dependencies: ['@fictjs/radix-ui', 'class-variance-authority'],
    registryDependencies: ['dialog'],
    files: [
      {
        path: '{{componentsDir}}/sheet.tsx',
        content: context => `import { Dialog as DialogPrimitive } from '@fictjs/radix-ui'
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

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type SheetContentProps = GenericProps & VariantProps<typeof sheetVariants>

export function SheetOverlay(props: GenericProps) {
  const { class: className, ...rest } = props
  return <DialogPrimitive.Overlay class={cn('fixed inset-0 z-50 bg-black/80', className)} {...rest} />
}

export function SheetContent(props: SheetContentProps) {
  const { class: className, children, side, ...rest } = props
  return (
    <>
      <SheetOverlay />
      <DialogPrimitive.Content class={cn(sheetVariants({ side }), className)} {...rest}>
        {children}
      </DialogPrimitive.Content>
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
  return <DialogPrimitive.Title class={cn('text-lg font-semibold text-foreground', className)} {...rest} />
}

export function SheetDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <DialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)} {...rest} />
}
`,
      },
    ],
  },
]
