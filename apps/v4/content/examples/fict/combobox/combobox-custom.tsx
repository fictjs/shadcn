import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

const countries = [
  ['argentina', 'Argentina', 'South America (ar)'],
  ['australia', 'Australia', 'Oceania (au)'],
  ['japan', 'Japan', 'Asia (jp)'],
  ['united-states', 'United States', 'North America (us)'],
] as const

export default function ComboboxCustomExample() {
  return (
    <Combobox><ComboboxInput placeholder="Search countries..." /><ComboboxContent><ComboboxEmpty>No countries found.</ComboboxEmpty><ComboboxList>{countries.map(([value, label, description]) => <ComboboxItem value={value}><Item size="xs" class="p-0"><ItemContent><ItemTitle>{label}</ItemTitle><ItemDescription>{description}</ItemDescription></ItemContent></Item></ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
