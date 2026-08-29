import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar'

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
}

export default function AvatarGroupCountIconExample() {
  return (
    <AvatarGroup class="grayscale">
      <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" /><AvatarFallback>LR</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" /><AvatarFallback>ER</AvatarFallback></Avatar>
      <AvatarGroupCount><PlusIcon /></AvatarGroupCount>
    </AvatarGroup>
  )
}
