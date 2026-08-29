import { ScrollArea, ScrollAreaViewport, ScrollBar } from '@/components/ui/scroll-area'

const tags = Array.from({ length: 50 }, (_, index) => `v1.2.0-beta.${50 - index}`)

export default function ScrollAreaDemoExample() {
  return (
    <ScrollArea class="h-72 w-48">
      <ScrollAreaViewport>
        <div class="p-4"><h4 class="mb-4 text-sm font-medium">Tags</h4>{tags.map(tag => <div class="border-b py-2 text-sm">{tag}</div>)}</div>
      </ScrollAreaViewport>
      <ScrollBar />
    </ScrollArea>
  )
}
