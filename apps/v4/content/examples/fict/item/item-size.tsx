import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

const sizes = [['default', 'Default Size', 'The standard size for most use cases.'], ['sm', 'Small Size', 'A compact size for dense layouts.'], ['xs', 'Extra Small Size', 'The most compact size available.']] as const

export default function ItemSizeExample() {
  return (
    <ItemGroup class="w-md">{sizes.map(([size, title, description]) => <Item variant="outline" size={size}><ItemMedia>▣</ItemMedia><ItemContent><ItemTitle>{title}</ItemTitle><ItemDescription>{description}</ItemDescription></ItemContent></Item>)}</ItemGroup>
  )
}
