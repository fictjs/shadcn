import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

const variants = [['default', 'Default Variant', 'Transparent background with no border.'], ['outline', 'Outline Variant', 'Outlined style with a visible border.'], ['muted', 'Muted Variant', 'Muted background for secondary content.']] as const

export default function ItemVariantExample() {
  return (
    <ItemGroup class="w-md">{variants.map(([variant, title, description]) => <Item variant={variant}><ItemMedia>▣</ItemMedia><ItemContent><ItemTitle>{title}</ItemTitle><ItemDescription>{description}</ItemDescription></ItemContent></Item>)}</ItemGroup>
  )
}
