import { ScrollArea, ScrollAreaViewport, ScrollBar } from '@/components/ui/scroll-area'

const works = [
  { artist: 'Ornella Binni', art: 'https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80' },
  { artist: 'Tom Byrom', art: 'https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80' },
  { artist: 'Vladimir Malyavko', art: 'https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80' },
]

export default function ScrollAreaHorizontalDemoExample() {
  return (
    <ScrollArea class="w-96 whitespace-nowrap">
      <ScrollAreaViewport>
        <div class="flex w-max gap-4 p-4">{works.map(work => <figure class="shrink-0"><img class="aspect-[3/4] w-[300px] rounded-md object-cover" src={work.art} alt={`Photo by ${work.artist}`} /><figcaption class="pt-2 text-sm">Photo by <strong>{work.artist}</strong></figcaption></figure>)}</div>
      </ScrollAreaViewport>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
