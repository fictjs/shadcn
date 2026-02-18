/** @jsxImportSource fict */

import { cn } from '../lib-cn'

export function Tabs(props) {
  const { class: className, ...rest } = props
  return <div class={cn('w-full', className)} {...rest} />
}

export function TabsList(props) {
  const { class: className, ...rest } = props
  return (
    <div
      role='tablist'
      class={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}
      {...rest}
    />
  )
}

export function TabsTrigger(props) {
  const { class: className, active = false, ...rest } = props
  return (
    <button
      type='button'
      role='tab'
      aria-selected={active}
      data-active={active ? 'true' : 'false'}
      class={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...rest}
    />
  )
}

export function TabsContent(props) {
  const { class: className, ...rest } = props
  return <div role='tabpanel' class={cn('mt-3 rounded-md border bg-background p-4', className)} {...rest} />
}
