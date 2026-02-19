import type { RegistryEntry } from '../types'

export const feedbackComponentRegistry: RegistryEntry[] = [
  {
    name: 'toast',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Toast provider and presentation wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['button'],
    files: [
      {
        path: '{{componentsDir}}/toast.tsx',
        content: context => `import {
  ToastProvider,
  ToastViewport as PrimitiveToastViewport,
  ToastRoot as PrimitiveToast,
  ToastTitle as PrimitiveToastTitle,
  ToastDescription as PrimitiveToastDescription,
  ToastAction as PrimitiveToastAction,
  ToastClose as PrimitiveToastClose,
  useToast,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export { useToast, ToastProvider }

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function ToastViewport(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveToastViewport
      class={cn('fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
      {...rest}
    />
  )
}

export function Toast(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveToast class={cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border bg-background p-4 pr-6 shadow-lg', className)} {...rest} />
}

export function ToastTitle(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveToastTitle class={cn('text-sm font-semibold', className)} {...rest} />
}

export function ToastDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveToastDescription class={cn('text-sm opacity-90', className)} {...rest} />
}

export function ToastAction(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveToastAction class={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-secondary', className)} {...rest} />
}

export function ToastClose(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveToastClose class={cn('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100', className)} {...rest} />
}

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}
`,
      },
    ],
  },
  {
    name: 'progress',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Progress primitive wrapper',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/progress.tsx',
        content: context => `import { Progress as PrimitiveProgress } from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type ProgressProps = {
  class?: string
  [key: string]: unknown
}

export function Progress(props: ProgressProps) {
  const { class: className, ...rest } = props
  return <PrimitiveProgress class={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)} {...rest} />
}
`,
      },
    ],
  },
]
