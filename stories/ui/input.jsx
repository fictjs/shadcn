/** @jsxImportSource fict */

import { cn } from '../lib-cn'

export function Input(props) {
  const { class: className, type = 'text', ...rest } = props
  return (
    <input
      type={type}
      class={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...rest}
    />
  )
}
