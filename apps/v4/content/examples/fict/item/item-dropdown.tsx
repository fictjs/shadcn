import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

const people = [['shadcn', 'shadcn@vercel.com'], ['maxleiter', 'maxleiter@vercel.com'], ['evilrabbit', 'evilrabbit@vercel.com']] as const

export default function ItemDropdownExample() {
  return (
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Select⌄</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{people.map(([name, email]) => <DropdownMenuItem><Item size="xs"><ItemMedia><Avatar><AvatarImage src={`https://github.com/${name}.png`} alt={name} /><AvatarFallback>{name.slice(0, 2)}</AvatarFallback></Avatar></ItemMedia><ItemContent><ItemTitle>{name}</ItemTitle><ItemDescription>{email}</ItemDescription></ItemContent></Item></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
  )
}
