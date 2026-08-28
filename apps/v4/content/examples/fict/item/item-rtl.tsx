import { Item, ItemContent, ItemDescription, ItemLeading, ItemTitle, ItemTrailing } from '@/components/ui/item'

export default function ItemRtlExample() {
  return (
    <Item dir="rtl"><ItemLeading>◆</ItemLeading><ItemContent><ItemTitle>Rtl</ItemTitle><ItemDescription>A composable Fict list item.</ItemDescription></ItemContent><ItemTrailing>View</ItemTrailing></Item>
  )
}
