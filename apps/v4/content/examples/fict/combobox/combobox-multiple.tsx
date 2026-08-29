import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue } from '@/components/ui/combobox'

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

export default function ComboboxMultipleExample() {
  return (
    <Combobox multiple autoHighlight defaultValue={['Next.js']}>
      <ComboboxChips class="w-full max-w-xs"><ComboboxValue>{values => <>{values.map(value => <ComboboxChip value={value}>{value}</ComboboxChip>)}<ComboboxChipsInput /></>}</ComboboxValue></ComboboxChips>
      <ComboboxContent><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{frameworks.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent>
    </Combobox>
  )
}
