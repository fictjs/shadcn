/** @jsxImportSource fict */

import { cn } from '../lib-cn'

export function Switch(props) {
  const { class: className, checked = false, ...rest } = props
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      class={cn(
        'peer inline-flex h-5 w-9 items-center rounded-full border border-input bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[checked=true]:bg-primary',
        className,
      )}
      data-checked={checked ? 'true' : 'false'}
      {...rest}
    >
      <span
        class={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
