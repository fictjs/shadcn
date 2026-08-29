import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'

export default function ItemLinkExample() {
  return (
    <ItemGroup class="w-md"><Item asChild><a href="#"><ItemContent><ItemTitle>Visit our documentation</ItemTitle><ItemDescription>Learn how to get started with our components.</ItemDescription></ItemContent><ItemActions>›</ItemActions></a></Item><Item variant="outline" asChild><a href="#" target="_blank" rel="noopener noreferrer"><ItemContent><ItemTitle>External resource</ItemTitle><ItemDescription>Opens in a new tab with security attributes.</ItemDescription></ItemContent><ItemActions>↗</ItemActions></a></Item></ItemGroup>
  )
}
