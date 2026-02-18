/** @jsxImportSource fict */

import { cn } from '../lib-cn'

export function Card(props) {
  const { class: className, ...rest } = props
  return <div class={cn('rounded-xl border bg-card text-card-foreground shadow', className)} {...rest} />
}

export function CardHeader(props) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-1.5 p-6', className)} {...rest} />
}

export function CardTitle(props) {
  const { class: className, ...rest } = props
  return <h3 class={cn('font-semibold leading-none tracking-tight', className)} {...rest} />
}

export function CardDescription(props) {
  const { class: className, ...rest } = props
  return <p class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function CardContent(props) {
  const { class: className, ...rest } = props
  return <div class={cn('p-6 pt-0', className)} {...rest} />
}

export function CardFooter(props) {
  const { class: className, ...rest } = props
  return <div class={cn('flex items-center p-6 pt-0', className)} {...rest} />
}
