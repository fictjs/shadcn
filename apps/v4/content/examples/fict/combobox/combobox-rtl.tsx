import { Combobox, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'

export default function ComboboxRtlExample() {
  return (
    <Combobox dir="rtl" defaultValue="Fict"><ComboboxInput placeholder="Search framework..." /><ComboboxList forceMount><ComboboxItem value="Fict">Fict</ComboboxItem><ComboboxItem value="Vue">Vue</ComboboxItem><ComboboxItem value="React">React</ComboboxItem></ComboboxList></Combobox>
  )
}
