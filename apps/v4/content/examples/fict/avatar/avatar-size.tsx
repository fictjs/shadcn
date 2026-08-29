import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AvatarSizeExample() {
  return (
    <div class="flex items-center gap-2 grayscale">
      <Avatar size="sm"><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn small" /><AvatarFallback>CN</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn default" /><AvatarFallback>CN</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn large" /><AvatarFallback>CN</AvatarFallback></Avatar>
    </div>
  )
}
