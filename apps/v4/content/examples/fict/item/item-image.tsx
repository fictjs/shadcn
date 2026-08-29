import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

const songs = [['Midnight City Lights', 'Electric Nights', 'Neon Dreams', '3:45'], ['Coffee Shop Conversations', 'Urban Stories', 'The Morning Brew', '4:05'], ['Digital Rain', 'Binary Beats', 'Cyber Symphony', '3:30']] as const

export default function ItemImageExample() {
  return (
    <ItemGroup class="w-md">{songs.map(([title, artist, album, duration]) => <Item variant="outline" asChild><a href="#"><ItemMedia><img class="size-10 rounded-sm object-cover" src={`https://avatar.vercel.sh/${encodeURIComponent(title)}`} alt={title} /></ItemMedia><ItemContent><ItemTitle>{title} - <span>{artist}</span></ItemTitle><ItemDescription>{album}</ItemDescription></ItemContent><ItemContent class="max-w-10"><ItemDescription>{duration}</ItemDescription></ItemContent></a></Item>)}</ItemGroup>
  )
}
