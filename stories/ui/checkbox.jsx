/** @jsxImportSource fict */

import { cn } from '../lib-cn'

export function Checkbox(props) {
  const { class: className, checked = false, ...rest } = props
  return (
    <button
      type='button'
      role='checkbox'
      aria-checked={checked}
      class={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:bg-primary data-[checked=true]:text-primary-foreground',
        className,
      )}
      data-checked={checked ? 'true' : 'false'}
      {...rest}
    >
      {checked ? '✓' : ''}
    </button>
  )
}
