import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTriggerEl } from '@/components/ui/hover-card'

const sides = ['left', 'top', 'bottom', 'right'] as const

export default function HoverCardSidesExample() {
  return <div class="flex flex-wrap gap-2">{sides.map(side => <HoverCard openDelay={100} closeDelay={100}><HoverCardTriggerEl asChild><Button variant="outline" class="capitalize">{side}</Button></HoverCardTriggerEl><HoverCardContent side={side}><strong>Hover Card</strong><p class="text-sm">This hover card appears on the {side} side of the trigger.</p></HoverCardContent></HoverCard>)}</div>
}
