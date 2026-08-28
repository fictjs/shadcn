import { ScrollArea, ScrollAreaViewport, ScrollBar } from '@/components/ui/scroll-area'

export default function ScrollAreaRtlExample() {
  return (
    <ScrollArea dir="rtl" class="h-72 w-48"><ScrollAreaViewport><div class="space-y-2 p-4">{Array.from({ length: 20 }, (_, index) => <div>Item {index + 1}</div>)}</div></ScrollAreaViewport><ScrollBar /></ScrollArea>
  )
}
