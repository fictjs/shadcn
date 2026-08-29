import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

export default function ItemIconExample() {
  return (
    <Item variant="outline" class="w-lg"><ItemMedia class="rounded-md bg-muted p-2">♢</ItemMedia><ItemContent><ItemTitle>Security Alert</ItemTitle><ItemDescription>New login detected from unknown device.</ItemDescription></ItemContent><ItemActions><Button variant="outline" size="sm">Review</Button></ItemActions></Item>
  )
}
