import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from '@/components/ui/combobox'

const countries = [['', 'Select country'], ['argentina', 'Argentina'], ['australia', 'Australia'], ['japan', 'Japan'], ['united-states', 'United States']] as const

export default function ComboboxPopupExample() {
  return (
    <Combobox defaultValue=""><ComboboxTrigger class="w-64"><ComboboxValue>Select country</ComboboxValue></ComboboxTrigger><ComboboxContent class="w-72"><ComboboxInput placeholder="Search" aria-label="Search countries" /><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{countries.map(([value, label]) => <ComboboxItem value={value}>{label}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
