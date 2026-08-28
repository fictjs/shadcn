import { HoverCard, HoverCardContent, HoverCardTriggerEl } from '@/components/ui/hover-card'

export default function HoverCardSidesExample() {
  return (
    <HoverCard openDelay={100}><HoverCardTriggerEl asChild><a href="https://fict.dev">@fict</a></HoverCardTriggerEl><HoverCardContent><strong>Fict</strong><p class="text-sm text-muted-foreground">Fine-grained TypeScript UI.</p></HoverCardContent></HoverCard>
  )
}
