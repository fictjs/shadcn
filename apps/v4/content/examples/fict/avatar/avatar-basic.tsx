import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AvatarBasicExample() {
  return (
    <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="Avatar" /><AvatarFallback>CN</AvatarFallback></Avatar>
  )
}
