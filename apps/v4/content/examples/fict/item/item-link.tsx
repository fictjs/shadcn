import { Item, ItemContent, ItemDescription, ItemLeading, ItemTitle, ItemTrailing } from '@/components/ui/item'

export default function ItemLinkExample() {
  return (
    <Item><ItemLeading>◆</ItemLeading><ItemContent><ItemTitle>Link</ItemTitle><ItemDescription>A composable Fict list item.</ItemDescription></ItemContent><ItemTrailing>View</ItemTrailing></Item>
  )
}
