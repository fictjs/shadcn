import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
}

export default function AvatarBadgeIconExample() {
  return <Avatar><AvatarImage class="grayscale" src="https://github.com/pranathip.png" alt="@pranathip" /><AvatarFallback>PP</AvatarFallback><AvatarBadge><PlusIcon /></AvatarBadge></Avatar>
}
