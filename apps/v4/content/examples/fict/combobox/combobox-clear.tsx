import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

export default function ComboboxClearExample() {
  return (
    <Combobox defaultValue="Next.js"><ComboboxInput placeholder="Select a framework" showClear /><ComboboxContent><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{frameworks.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
