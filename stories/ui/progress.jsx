/** @jsxImportSource fict */

import { cn } from '../lib-cn'

export function Progress(props) {
  const { class: className, value = 0, ...rest } = props
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      class={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...rest}
    >
      <div class='h-full bg-primary transition-all' style={`width: ${clamped}%;`} />
    </div>
  )
}
