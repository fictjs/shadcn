import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AvatarBasicExample() {
  return <Avatar><AvatarImage class="grayscale" src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
}
