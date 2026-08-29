import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

export default function ItemAvatarExample() {
  return (
    <ItemGroup class="w-lg"><Item variant="outline"><ItemMedia><Avatar size="lg"><AvatarImage src="https://github.com/evilrabbit.png" alt="Evil Rabbit" /><AvatarFallback>ER</AvatarFallback></Avatar></ItemMedia><ItemContent><ItemTitle>Evil Rabbit</ItemTitle><ItemDescription>Last seen 5 months ago</ItemDescription></ItemContent><ItemActions><Button variant="outline" size="icon-sm" aria-label="Invite">+</Button></ItemActions></Item><Item variant="outline"><ItemMedia><AvatarGroup><Avatar><AvatarImage src="https://github.com/shadcn.png" alt="shadcn" /></Avatar><Avatar><AvatarImage src="https://github.com/maxleiter.png" alt="maxleiter" /></Avatar><Avatar><AvatarImage src="https://github.com/evilrabbit.png" alt="evilrabbit" /></Avatar></AvatarGroup></ItemMedia><ItemContent><ItemTitle>No Team Members</ItemTitle><ItemDescription>Invite your team to collaborate on this project.</ItemDescription></ItemContent><ItemActions><Button variant="outline" size="sm">Invite</Button></ItemActions></Item></ItemGroup>
  )
}
