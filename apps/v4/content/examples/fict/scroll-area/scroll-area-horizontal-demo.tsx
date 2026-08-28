import { ScrollArea, ScrollAreaViewport, ScrollBar } from '@/components/ui/scroll-area'

export default function ScrollAreaHorizontalDemoExample() {
  return (
    <ScrollArea class="w-72"><ScrollAreaViewport><div class="space-y-2 p-4">{Array.from({ length: 20 }, (_, index) => <div>Item {index + 1}</div>)}</div></ScrollAreaViewport><ScrollBar orientation="horizontal" /></ScrollArea>
  )
}
