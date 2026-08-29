import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

export default function ComboboxInvalidExample() {
  return (
    <Combobox><ComboboxInput placeholder="Select a framework" aria-invalid="true" /><ComboboxContent><ComboboxList>{frameworks.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
