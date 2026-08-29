import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTriggerEl } from '@/components/ui/hover-card'

export default function HoverCardDemoExample() {
  return <HoverCard openDelay={10} closeDelay={100}><HoverCardTriggerEl asChild><Button variant="link">Hover Here</Button></HoverCardTriggerEl><HoverCardContent class="w-64"><strong>@fictjs</strong><p class="text-sm">Fine-grained reactivity with a compiler-first runtime.</p><small class="text-muted-foreground">Fict ecosystem</small></HoverCardContent></HoverCard>
}
