import type { RegistryEntry } from '../types'

export const feedbackComponentRegistry: RegistryEntry[] = [
  {
    name: 'toast',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Accessible toast queue and presentation components',
    dependencies: [],
    registryDependencies: ['button'],
    files: [
      {
        path: '{{componentsDir}}/toast.tsx',
        content: context => `import { createContext, onDestroy, useContext } from 'fict'
import { createSignal } from 'fict/advanced'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export type ToastRecord = {
  id: string
  title?: string
  description?: string
  duration?: number
}

type ToastContextValue = {
  toasts: () => ToastRecord[]
  show: (toast: Omit<ToastRecord, 'id'> & { id?: string }) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

function nextToastId(): string {
  toastId += 1
  return 'fictcn-toast-' + String(toastId)
}

function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('Toast components must be used inside ToastProvider')
  return context
}

export function ToastProvider(props: GenericProps & { duration?: number }) {
  const toasts = createSignal<ToastRecord[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  const dismiss = (id: string) => {
    toasts(toasts().filter(toast => toast.id !== id))
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
  }
  const show: ToastContextValue['show'] = input => {
    const id = input.id ?? nextToastId()
    dismiss(id)
    toasts([...toasts(), { ...input, id }])
    const duration = input.duration ?? props.duration ?? 5000
    if (duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration))
    return id
  }

  onDestroy(() => {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
  })

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {props.children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useToastContext()
  return {
    show: context.show,
    dismiss: context.dismiss,
    toasts: context.toasts,
  }
}

export function ToastViewport(props: GenericProps) {
  const context = useToastContext()
  const { class: className, children, ...rest } = props
  return (
    <div
      role='region'
      aria-label='Notifications'
      aria-live='polite'
      aria-relevant='additions text'
      data-slot='toast-viewport'
      class={cn('fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
      {...rest}
    >
      {children}
      {() => context.toasts().map(toast => (
        <Toast id={toast.id} title={toast.title} description={toast.description} />
      ))}
    </div>
  )
}

export function Toast(props: GenericProps & { id?: string; title?: string; description?: string; open?: boolean }) {
  const context = useContext(ToastContext)
  const { class: className, children, id, title, description, open = true, ...rest } = props
  if (!open) return null
  return (
    <div
      role='status'
      data-slot='toast'
      data-state='open'
      class={cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border bg-background p-4 pr-6 shadow-lg', className)}
      {...rest}
    >
      <div class='grid gap-1'>
        {title ? <ToastTitle>{title}</ToastTitle> : null}
        {description ? <ToastDescription>{description}</ToastDescription> : null}
        {children}
      </div>
      {id && context ? <ToastClose onClick={() => context.dismiss(id)}>Dismiss</ToastClose> : null}
    </div>
  )
}

export function ToastTitle(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='toast-title' class={cn('text-sm font-semibold', className)} {...rest} />
}

export function ToastDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='toast-description' class={cn('text-sm opacity-90', className)} {...rest} />
}

export function ToastAction(props: GenericProps) {
  const { class: className, altText, ...rest } = props
  return <button type='button' aria-label={altText} data-slot='toast-action' class={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-secondary', className)} {...rest} />
}

export function ToastClose(props: GenericProps) {
  const { class: className, ...rest } = props
  return <button type='button' data-slot='toast-close' class={cn('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100', className)} {...rest} />
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
