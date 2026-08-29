import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

export default function ComboboxAutoHighlightExample() {
  return (
    <Combobox autoHighlight><ComboboxInput placeholder="Select a framework" /><ComboboxContent><ComboboxList>{frameworks.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
