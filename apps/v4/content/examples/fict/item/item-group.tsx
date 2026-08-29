import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

const people = [['shadcn', 'shadcn@vercel.com'], ['maxleiter', 'maxleiter@vercel.com'], ['evilrabbit', 'evilrabbit@vercel.com']] as const

export default function ItemGroupExample() {
  return (
    <ItemGroup class="w-96">{people.map(([name, email]) => <Item variant="outline"><ItemMedia><Avatar><AvatarImage src={`https://github.com/${name}.png`} alt={name} /><AvatarFallback>{name.slice(0, 2)}</AvatarFallback></Avatar></ItemMedia><ItemContent><ItemTitle>{name}</ItemTitle><ItemDescription>{email}</ItemDescription></ItemContent><ItemActions><Button variant="ghost" size="icon" aria-label={`Add ${name}`}>+</Button></ItemActions></Item>)}</ItemGroup>
  )
}
